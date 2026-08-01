import api from "./api";

export const agentService = {
  run: () => api.post("/agent/run"),
  importDemo: (count = 1000) => api.post("/agent/import-demo", { count }),
  getLogs: () => api.get("/agent/logs"),
  getJobs: (params) => api.get("/agent/jobs", { params }),
  verifyJob: (id, action) => api.patch(`/agent/jobs/${id}/verify`, { action }),
  getAnalytics: () => api.get("/agent/analytics"),
  getConfig: () => api.get("/agent/config"),
  updateConfig: (data) => api.put("/agent/config", data),
};
