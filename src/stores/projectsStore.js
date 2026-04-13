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
    activeSprint: null,
    sprintIssues: [],
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
        const response = await axios.get(`/api-jira/rest/api/3/search/jql`, {
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
    async fetchSprintData(boardId = 2) {
      try {
        const sprintRes = await axios.get(
          `/api-jira/rest/agile/1.0/board/${boardId}/sprint?state=active`,
          { headers: this.getAuthHeader() },
        );

        console.log(
          "🟢 Sprint response:",
          JSON.stringify(sprintRes.data, null, 2),
        );

        this.activeSprint = sprintRes.data.values?.[0] ?? null;

        console.log("🟡 activeSprint seteado:", this.activeSprint);

        if (!this.activeSprint) {
          console.log("🔴 No hay sprint activo, se corta acá");
          return;
        }

        const issuesRes = await axios.get(
          `/api-jira/rest/agile/1.0/sprint/${this.activeSprint.id}/issue`,
          {
            headers: this.getAuthHeader(),
            params: {
              fields:
                "summary,status,assignee,issuetype,customfield_10043,customfield_10044,resolutiondate,updated",
              maxResults: 500,
            },
          },
        );

        console.log("🟢 Issues count:", issuesRes.data.issues?.length);
        console.log(
          "🟡 Primer issue fields:",
          JSON.stringify(issuesRes.data.issues?.[0]?.fields, null, 2),
        );

        this.sprintIssues = issuesRes.data.issues ?? [];
      } catch (err) {
        console.log(
          "🔴 ERROR en fetchSprintData:",
          err.message,
          err.response?.data,
        );
        this.error = "Error al obtener sprint: " + err.message;
      }
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
      state.reportIssues.filter((i) => i.fields.status.name === "In QA").length,
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
    burndownData: (state) => {
      if (!state.activeSprint || !state.sprintIssues.length) return null;

      const start = new Date(state.activeSprint.startDate);
      const end = new Date(state.activeSprint.endDate);
      const today = new Date();

      // Genera array de días del sprint
      const days = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }

      const totalHours = state.sprintIssues.reduce(
        (acc, i) => acc + (i.fields.customfield_10043 || 0),
        0,
      );

      // Línea ideal: decrece linealmente de totalHours a 0
      const idealLine = days.map((_, idx) =>
        parseFloat(
          (totalHours - (totalHours / (days.length - 1)) * idx).toFixed(2),
        ),
      );

      // Línea real: por cada día, cuántas horas quedaban sin resolver
      const actualLine = days.map((day) => {
        if (day > today) return null; // días futuros → null
        const resolvedHours = state.sprintIssues
          .filter((i) => {
            const resolved = i.fields.resolutiondate
              ? new Date(i.fields.resolutiondate)
              : null;
            return resolved && resolved <= day;
          })
          .reduce((acc, i) => acc + (i.fields.customfield_10043 || 0), 0);
        return parseFloat((totalHours - resolvedHours).toFixed(2));
      });

      return {
        labels: days.map((d) =>
          d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
        ),
        idealLine,
        actualLine,
        totalHours,
        sprintName: state.activeSprint.name,
      };
    },

    // Sprint Health: conteo por categoría de estado
    sprintHealth: (state) => {
      const counts = { todo: 0, inProgress: 0, done: 0, blocked: 0 };
      state.sprintIssues.forEach((i) => {
        const cat = i.fields.status.statusCategory.key;
        const name = i.fields.status.name;
        if (name === "Blocked") counts.blocked++;
        else if (cat === "new") counts.todo++;
        else if (cat === "indeterminate") counts.inProgress++;
        else if (cat === "done") counts.done++;
      });
      return {
        ...counts,
        total: state.sprintIssues.length,
        sprintName: state.activeSprint?.name ?? "",
        startDate: state.activeSprint?.startDate ?? null,
        endDate: state.activeSprint?.endDate ?? null,
      };
    },
  },
});
