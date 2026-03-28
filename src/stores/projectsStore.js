import { defineStore } from "pinia";
import axios from "axios";

export const useProjectsStore = defineStore("projects", {
    state: () => ({
        // Estados generales
        projectDetails: null,
        reportIssues: [],
        blockedIssues: [],
        loading: false,
        loadingIssues: false,
        error: null,
    }),

    actions: {
        // Helper para generar el header de autorización
        getAuthHeader() {
        const email = import.meta.env.VITE_JIRA_EMAIL;
        const token = import.meta.env.VITE_JIRA_API_TOKEN;
        return {
            Authorization: `Basic ${btoa(`${email}:${token}`)}`,
            Accept: "application/json",
        };
        },

        // CASO: Datos básicos del proyecto (Nombre, Key, etc.)
        async fetchProjectData(projectKey) {
        this.loading = true;
        this.error = null;
        try {
            const response = await axios.get(
            `/api-jira/rest/api/3/project/${projectKey}`,
            {
                headers: this.getAuthHeader(),
            },
            );
            this.projectDetails = response.data;
        } catch (err) {
            this.error = "Error al obtener el proyecto: " + err.message;
            console.error(err);
        } finally {
            this.loading = false;
        }
        },

        // CASO: Carga masiva para Reportes y KPIs
        async fetchReportData(projectKey) {
        this.loading = true;
        this.error = null;

        // JQL que abarca Bugs, Tasks, Stories y estados críticos
        const jql = `project = "${projectKey}" AND (issuetype IN (Bug, Task, Story) OR status IN ("QA", "Ready for Prod", "QA Failed", "Blocked"))`;

        try {
            const response = await axios.get(`/api-jira/rest/api/3/search`, {
            headers: this.getAuthHeader(),
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
            // Sincronizamos blockedIssues filtrando del reporte global
            this.blockedIssues = this.reportIssues.filter(
            (i) => i.fields.status.name === "Blocked",
            );
        } catch (err) {
            this.error = "Error en el reporte: " + err.message;
        } finally {
            this.loading = false;
        }
        },

        // Mantenemos esta por compatibilidad con tu botón anterior
        async fetchBlockedIssues(projectKey) {
        await this.fetchReportData(projectKey);
        },
    },

    getters: {
        // Tabla 1: Est vs Spent por Usuario (Últimos 7 días)
        userTimeStats: (state) => {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const stats = {};
        state.reportIssues.forEach((issue) => {
            const updated = new Date(issue.fields.updated);
            const user = issue.fields.assignee?.displayName || "Sin Asignar";
            if (updated >= lastWeek) {
            if (!stats[user]) stats[user] = { estimated: 0, spent: 0 };
            stats[user].estimated += issue.fields.customfield_10043 || 0;
            stats[user].spent += issue.fields.customfield_10044 || 0;
            }
        });
        return stats;
        },

        // Tablas 2 y 3: Conteos de Status
        qaCount: (state) =>
        state.reportIssues.filter((i) => i.fields.status.name === "QA").length,
        readyForProdCount: (state) =>
        state.reportIssues.filter(
            (i) => i.fields.status.name === "Ready for Prod",
        ).length,

        // Tabla 4: Bug Rate
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

        // Tabla 5: Defect Escape Rate
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

        // Tabla 6: QA Pass Rate
        qaPassRate: (state) => {
        const targets = state.reportIssues.filter((i) =>
            ["Task", "Story"].includes(i.fields.issuetype.name),
        );
        const failed = targets.filter(
            (i) => i.fields.status.name === "QA Failed",
        ).length;
        return targets.length > 0
            ? (((targets.length - failed) / targets.length) * 100).toFixed(2) + "%"
            : "100%";
        },

        // Tabla 7: Velocity
        velocityPerSprint: (state) => {
        const sprints = {};
        state.reportIssues.forEach((issue) => {
            const sprintName = issue.fields.customfield_10020?.[0]?.name;
            if (sprintName) {
            sprints[sprintName] =
                (sprints[sprintName] || 0) + (issue.fields.customfield_10044 || 0);
            }
        });
        return sprints;
        },

        // Tabla 8: Accuracy
        estimationAccuracy: (state) => {
        const targets = state.reportIssues.filter((i) =>
            ["Task", "Story"].includes(i.fields.issuetype.name),
        );
        const totalEst = targets.reduce(
            (acc, i) => acc + (i.fields.customfield_10043 || 0),
            0,
        );
        const totalSpent = targets.reduce(
            (acc, i) => acc + (i.fields.customfield_10044 || 0),
            0,
        );
        if (totalEst === 0) return "0%";
        const accuracy = (1 - Math.abs(totalEst - totalSpent) / totalEst) * 100;
        return Math.max(0, accuracy).toFixed(2) + "%";
        },

        // Tabla 9: Desvío Acumulado
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
