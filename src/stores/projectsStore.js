import { defineStore } from "pinia";
import axios from "axios";

export const useProjectsStore = defineStore("projects", {
    state: () => ({
        projectDetails: null,
        reportIssues: [], // Raw issues for all KPIs
        loading: false,
        error: null,
    }),

    actions: {
        async fetchReportData(projectKey) {
        this.loading = true;
        this.error = null;

        const auth = btoa(
            `${import.meta.env.VITE_JIRA_EMAIL}:${import.meta.env.VITE_JIRA_API_TOKEN}`,
        );

        // JQL to bring all necessary issues for the tables
        const jql = `project = "${projectKey}" AND (issuetype IN (Bug, Task, Story) OR status IN ("QA", "Ready for Prod", "QA Failed"))`;

        try {
            const response = await axios.get(`/api-jira/rest/api/3/search`, {
            headers: {
                Authorization: `Basic ${auth}`,
                Accept: "application/json",
            },
            params: {
                jql,
                maxResults: 1000,
                fields: [
                "summary",
                "assignee",
                "status",
                "issuetype",
                "updated",
                "customfield_10043", // Estimation (hs)
                "customfield_10044", // Time Spent (hs)
                "customfield_10020", // Sprint
                "customfield_10077", // Environment
                ].join(","),
            },
            });
            this.reportIssues = response.data.issues;
        } catch (err) {
            this.error = "Error fetching report data: " + err.message;
        } finally {
            this.loading = false;
        }
        },
    },

    getters: {
        // Table 1: Est vs Spent per User (Last 7 days)
        userTimeStats: (state) => {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const stats = {};
        state.reportIssues.forEach((issue) => {
            const updated = new Date(issue.fields.updated);
            const user = issue.fields.assignee?.displayName || "Unassigned";
            if (updated >= lastWeek) {
            if (!stats[user]) stats[user] = { estimated: 0, spent: 0 };
            stats[user].estimated += issue.fields.customfield_10043 || 0;
            stats[user].spent += issue.fields.customfield_10044 || 0;
            }
        });
        return stats;
        },

        // Table 2 & 3: Simple Status Counts
        qaCount: (state) =>
        state.reportIssues.filter((i) => i.fields.status.name === "QA").length,
        readyForProdCount: (state) =>
        state.reportIssues.filter(
            (i) => i.fields.status.name === "Ready for Prod",
        ).length,

        // Table 4: Bug Rate KPI
        bugRate: (state) => {
        const bugs = state.reportIssues.filter(
            (i) => i.fields.issuetype.name === "Bug",
        );
        const totalSpent = state.reportIssues.reduce(
            (acc, i) => acc + (i.fields.customfield_10044 || 0),
            0,
        );
        return totalSpent > 0 ? (bugs.length / totalSpent).toFixed(2) : 0;
        },

        // Table 5: Defect Escape Rate
        defectEscapeRate: (state) => {
        const totalBugs = state.reportIssues.filter(
            (i) => i.fields.issuetype.name === "Bug",
        ).length;
        const prodBugs = state.reportIssues.filter(
            (i) =>
            i.fields.issuetype.name === "Bug" &&
            i.fields.customfield_10077?.value === "Production",
        ).length;
        return totalBugs > 0
            ? ((prodBugs / totalBugs) * 100).toFixed(2) + "%"
            : "0%";
        },

        // Table 6: QA Pass Rate (1st attempt)
        qaPassRate: (state) => {
        const targetTypes = state.reportIssues.filter((i) =>
            ["Task", "Story"].includes(i.fields.issuetype.name),
        );
        const failed = targetTypes.filter(
            (i) => i.fields.status.name === "QA Failed",
        ).length;
        return targetTypes.length > 0
            ? (((targetTypes.length - failed) / targetTypes.length) * 100).toFixed(
                2,
            ) + "%"
            : "100%";
        },

        // Table 7: Velocity (Spent per Sprint)
        velocityPerSprint: (state) => {
        const sprints = {};
        state.reportIssues.forEach((issue) => {
            const sprintData = issue.fields.customfield_10020?.[0]; // Usually an array
            if (sprintData) {
            const name = sprintData.name;
            sprints[name] =
                (sprints[name] || 0) + (issue.fields.customfield_10044 || 0);
            }
        });
        return sprints;
        },

        // Table 8: Estimation Accuracy
        estimationAccuracy: (state) => {
        const targets = state.reportIssues.filter((i) =>
            ["Task", "Story"].includes(i.fields.issuetype.name),
        );
        if (!targets.length) return "0%";

        const totalEst = targets.reduce(
            (acc, i) => acc + (i.fields.customfield_10043 || 0),
            0,
        );
        const totalSpent = targets.reduce(
            (acc, i) => acc + (i.fields.customfield_10044 || 0),
            0,
        );

        if (totalEst === 0) return "N/A";
        const accuracy = (1 - Math.abs(totalEst - totalSpent) / totalEst) * 100;
        return Math.max(0, accuracy).toFixed(2) + "%";
        },

        // Table 9: Accumulative A vs B (Project Deviation)
        projectDeviation: (state) => {
        const totalEst = state.reportIssues.reduce(
            (acc, i) => acc + (i.fields.customfield_10043 || 0),
            0,
        );
        const totalSpent = state.reportIssues.reduce(
            (acc, i) => acc + (i.fields.customfield_10044 || 0),
            0,
        );
        return { totalEst, totalSpent, deviation: totalSpent - totalEst };
        },
    },
});
