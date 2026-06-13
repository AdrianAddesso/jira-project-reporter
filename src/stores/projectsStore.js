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
    userTimeStatsIssues: [],
    allSprints: [],
    selectedSprint: null,
    selectedSprintIssues: [],
    loadingSprintSelector: false,
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
    // Usa paginación por cursor (nextPageToken / isLast) — propio de /rest/api/3/search/jql
    async fetchReportData(projectKey) {
      this.loading = true;
      this.error = null;

      const jql = `project = "${projectKey}" AND (issuetype IN (Bug, Task, Story) OR status IN ("QA", "Ready for Prod", "QA Failed", "Blocked"))`;
      const fields = [
        "summary",
        "assignee",
        "status",
        "issuetype",
        "updated",
        "customfield_10043", // Estimation (hs)
        "customfield_10044", // Time Spent (hs)
        "customfield_10020", // Sprint
        "customfield_10077", // Environment
      ].join(",");

      const PAGE_SIZE = 100;
      let allIssues = [];
      let nextPageToken = null;

      try {
        while (true) {
          const params = { jql, maxResults: PAGE_SIZE, fields };
          if (nextPageToken) params.nextPageToken = nextPageToken;

          const response = await axios.get(`/api-jira/rest/api/3/search/jql`, {
            headers: this.getAuthHeader(),
            params,
          });

          const { issues, isLast, nextPageToken: token } = response.data;
          allIssues = allIssues.concat(issues);

          if (isLast || !token) break;
          nextPageToken = token;
        }

        this.reportIssues = allIssues;
        // Sincronizamos blockedIssues filtrando del reporte global
        this.blockedIssues = allIssues.filter(
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

    // Usa paginación por offset (startAt / total) — propio de /rest/agile/1.0
    async fetchSprintData(boardId = 2) {
      try {
        const sprintRes = await axios.get(
          `/api-jira/rest/agile/1.0/board/${boardId}/sprint?state=active`,
          { headers: this.getAuthHeader() },
        );

        this.activeSprint = sprintRes.data.values?.[0] ?? null;

        if (!this.activeSprint) {
          console.log("🔴 No hay sprint activo, se corta acá");
          return;
        }

        const PAGE_SIZE = 100;
        let startAt = 0;
        let allIssues = [];

        while (true) {
          const issuesRes = await axios.get(
            `/api-jira/rest/agile/1.0/sprint/${this.activeSprint.id}/issue`,
            {
              headers: this.getAuthHeader(),
              params: {
                fields:
                  "summary,status,assignee,issuetype,customfield_10043,customfield_10044,resolutiondate,updated",
                maxResults: PAGE_SIZE,
                startAt,
              },
            },
          );

          const { issues, total } = issuesRes.data;
          allIssues = allIssues.concat(issues);
          startAt += issues.length;

          if (startAt >= total || issues.length === 0) break;
        }

        this.sprintIssues = allIssues;
      } catch (err) {
        console.log(
          "🔴 ERROR en fetchSprintData:",
          err.message,
          err.response?.data,
        );
        this.error = "Error al obtener sprint: " + err.message;
      }
    },

    async fetchUserTimeStats(boardId = 2) {
      try {
        const sprintRes = await axios.get(
          `/api-jira/rest/agile/1.0/board/${boardId}/sprint?state=active`,
          { headers: this.getAuthHeader() },
        );

        this.activeSprint = sprintRes.data.values?.[0] ?? null;

        if (!this.activeSprint) {
          this.userTimeStatsIssues = [];
          return;
        }

        const PAGE_SIZE = 100;
        let startAt = 0;
        let allIssues = [];

        while (true) {
          const issuesRes = await axios.get(
            `/api-jira/rest/agile/1.0/sprint/${this.activeSprint.id}/issue`,
            {
              headers: this.getAuthHeader(),
              params: {
                fields: "assignee,customfield_10044",
                maxResults: PAGE_SIZE,
                startAt,
              },
            },
          );

          const { issues, total } = issuesRes.data;
          allIssues = allIssues.concat(issues);
          startAt += issues.length;

          if (startAt >= total || issues.length === 0) break;
        }

        this.userTimeStatsIssues = allIssues;
      } catch (err) {
        console.log(
          "ðŸ”´ ERROR en fetchUserTimeStats:",
          err.message,
          err.response?.data,
        );
        this.error =
          "Error al obtener tiempos del sprint activo: " + err.message;
      }
    },
    async fetchAllSprints(boardId = 2) {
      this.loadingSprintSelector = true;
      try {
        const PAGE_SIZE = 50;
        let startAt = 0;
        let allSprints = [];

        while (true) {
          const res = await axios.get(
            `/api-jira/rest/agile/1.0/board/${boardId}/sprint`,
            {
              headers: this.getAuthHeader(),
              params: { maxResults: PAGE_SIZE, startAt },
            },
          );
          const { values, isLast } = res.data;
          allSprints = allSprints.concat(values);
          startAt += values.length;
          if (isLast || values.length === 0) break;
        }

        // Orden cronológico inverso: más reciente primero
        this.allSprints = allSprints.reverse();

        // Si no hay sprint seleccionado, pre-seleccionar el activo
        if (!this.selectedSprint && this.activeSprint) {
          await this.selectSprint(this.activeSprint);
        }
      } catch (err) {
        this.error = "Error al cargar sprints: " + err.message;
      } finally {
        this.loadingSprintSelector = false;
      }
    },

    // Selecciona un sprint y carga sus issues
    async selectSprint(sprint) {
      this.selectedSprint = sprint;
      this.loadingSprintSelector = true;
      try {
        const PAGE_SIZE = 100;
        let startAt = 0;
        let allIssues = [];

        while (true) {
          const res = await axios.get(
            `/api-jira/rest/agile/1.0/sprint/${sprint.id}/issue`,
            {
              headers: this.getAuthHeader(),
              params: {
                fields:
                  "summary,status,assignee,issuetype,customfield_10043,customfield_10044,resolutiondate,updated",
                maxResults: PAGE_SIZE,
                startAt,
              },
            },
          );
          const { issues, total } = res.data;
          allIssues = allIssues.concat(issues);
          startAt += issues.length;
          if (startAt >= total || issues.length === 0) break;
        }

        this.selectedSprintIssues = allIssues;
      } catch (err) {
        this.error = "Error al cargar issues del sprint: " + err.message;
      } finally {
        this.loadingSprintSelector = false;
      }
    },
  },

  getters: {
    // Tabla 1: Spent por Usuario (Current Sprint)
    userTimeStats: (state) => {
      const stats = {};

      state.userTimeStatsIssues.forEach((issue) => {
        const user = issue.fields.assignee?.displayName || "Sin Asignar";

        if (!stats[user]) {
          stats[user] = { spent: 0 };
        }

        stats[user].spent += issue.fields.customfield_10044 || 0;
      });

      return stats;
    },

    // Tablas 2 y 3: Conteos de Status
    qaCount: (state) =>
      state.sprintIssues.filter((i) => i.fields.status.name === "PR Review")
        .length,
    readyForProdCount: (state) =>
      state.sprintIssues.filter((i) => i.fields.status.name === "Done").length,

    // Tabla 4: Bug Rate
    bugRate: (state) => {
      const bugs = state.sprintIssues.filter(
        (i) => i.fields.issuetype.name === "Bug",
      );
      const totalSpent = state.sprintIssues.reduce(
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
          i.fields.customfield_10077?.value === "Prod",
      ).length;
      return totalBugs > 0
        ? ((prodBugs / totalBugs) * 100).toFixed(2) + "%"
        : "0%";
    },

    // Tabla 6: QA Pass Rate
    qaPassRate: (state) => {
        const totalBugs = state.reportIssues.filter(
            (i) => i.fields.issuetype.name === "Bug",
        ).length;
        const totalTasks = state.reportIssues.filter((i) =>
            ["Task", "Story"].includes(i.fields.issuetype.name),
        ).length;

        return totalTasks > 0
            ? (((totalTasks - totalBugs) / totalTasks) * 100).toFixed(2) + "%"
            : "0%";
    },

    // Tabla 7: Velocity (Only Task & Story)
    velocityPerSprint: (state) => {
      const sprints = {};
      const validIssues = state.reportIssues.filter((i) =>
        ["Task", "Story"].includes(i.fields.issuetype.name),
      );

      validIssues.forEach((issue) => {
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
      const targets = state.sprintIssues.filter(
        (i) =>
          ["Task", "Story"].includes(i.fields.issuetype.name) &&
          i.fields.status.name === "Done" &&
          i.fields.customfield_10043 != null &&
          i.fields.customfield_10044 != null,
      );
      const totalEst = targets.reduce(
        (acc, i) => acc + i.fields.customfield_10043,
        0,
      );
      const totalSpent = targets.reduce(
        (acc, i) => acc + i.fields.customfield_10044,
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
      const sprint = state.selectedSprint;
      const issues = state.selectedSprintIssues.filter((i) =>
        ["Task", "Story"].includes(i.fields.issuetype.name),
      );

      if (!sprint || !issues.length) return null;

      const start = new Date(sprint.startDate);
      const end = new Date(sprint.endDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const days = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }

      const totalHours = issues.reduce(
        (acc, i) => acc + (i.fields.customfield_10043 || 0),
        0,
      );

      const idealLine = days.map((_, idx) =>
        parseFloat(
          (
            totalHours -
            (days.length > 1 ? (totalHours / (days.length - 1)) * idx : 0)
          ).toFixed(2),
        ),
      );

      const actualLine = days.map((day) => {
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);
        if (dayEnd > today) return null;
        const resolvedHours = issues
          .filter((i) => {
            const resolved = i.fields.resolutiondate
              ? new Date(i.fields.resolutiondate)
              : null;
            return resolved && resolved <= dayEnd;
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
        sprintName: sprint.name,
      };
    },

    // Sprint Health: conteo por categoría de estado
    // Sprint Health: conteo por categoría de estado (Only Task & Story)
    sprintHealth: (state) => {
      const counts = { todo: 0, inProgress: 0, done: 0, blocked: 0 };
      const issues = state.selectedSprintIssues.filter((i) =>
        ["Task", "Story"].includes(i.fields.issuetype.name),
      );

      issues.forEach((i) => {
        const cat = i.fields.status.statusCategory.key;
        const name = i.fields.status.name;
        if (name === "Blocked") counts.blocked++;
        else if (cat === "new") counts.todo++;
        else if (cat === "indeterminate") counts.inProgress++;
        else if (cat === "done") counts.done++;
      });

      return {
        ...counts,
        total: issues.length,
        sprintName: state.selectedSprint?.name ?? "",
        startDate: state.selectedSprint?.startDate ?? null,
        endDate: state.selectedSprint?.endDate ?? null,
      };
    },
  },
});
