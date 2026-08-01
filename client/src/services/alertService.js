import api from "./api";

export const alertService = {
  create: (data) => api.post("/alerts", data),
  getMyAlerts: () => api.get("/alerts"),
  toggle: (id) => api.patch(`/alerts/${id}/toggle`),
  delete: (id) => api.delete(`/alerts/${id}`),
};
