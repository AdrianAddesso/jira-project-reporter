import { defineStore } from "pinia";
import axios from "axios";

export const useProjectsStore = defineStore("projects", {
  state: () => ({
    projectDetails: null,
    loading: false,
    error: null,
    blockedIssues: [],
    loadingIssues: false,
  }),

  actions: {
    async fetchProjectData(projectKey) {
      this.loading = true;
      this.error = null;

      const auth = btoa(
        `${import.meta.env.VITE_JIRA_EMAIL}:${import.meta.env.VITE_JIRA_API_TOKEN}`,
      );

      try {
        const response = await axios.get(
          `/api-jira/rest/api/3/project/${projectKey}`,
          {
            headers: {
              Authorization: `Basic ${auth}`,
              Accept: "application/json",
            },
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
        async fetchBlockedIssues(projectKey) {
        this.loadingIssues = true;
        const auth = btoa(
            `${import.meta.env.VITE_JIRA_EMAIL}:${import.meta.env.VITE_JIRA_API_TOKEN}`,
        );
        try {
            const response = await axios.get(`/api-jira/rest/api/3/search/jql`, {
            headers: {
                Authorization: `Basic ${auth}`,
                Accept: "application/json",
            },
            params: {
                jql: `project=${projectKey} AND status=Blocked`,
                fields: "summary,assignee",
            },
            });
            this.blockedIssues = response.data.issues;
        } catch (err) {
            this.error = "Error al obtener issues: " + err.message;
        } finally {
            this.loadingIssues = false;
        }
        },
  },
});
