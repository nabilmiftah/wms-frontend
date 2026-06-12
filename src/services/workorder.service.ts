import api from "./api";

export const getWorkOrders = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: "INBOUND" | "OUTBOUND";
  status?: "TODO" | "ON_PROGRESS" | "DONE";
}) => {
  const response = await api.get("/work-orders", { params });
  return response.data;
};

export const getWorkOrderById = async (id: string) => {
  const response = await api.get(`/work-orders/${id}`);
  return response.data;
};

export const createWorkOrder = async (payload: {
  type: "INBOUND" | "OUTBOUND";
  warehouseId: string;
  storageBinId: string;
  assetId: string;
  quantity: number;
  remarks?: string;
}) => {
  const response = await api.post("/work-orders", payload);
  return response.data;
};

export const updateWorkOrderStatus = async (
  id: string,
  status: "TODO" | "ON_PROGRESS" | "DONE"
) => {
  const response = await api.put(`/work-orders/${id}/status`, { status });
  return response.data;
};

export const generateLabels = async (id: string) => {
  const response = await api.post(`/work-orders/${id}/generate-labels`);
  return response.data;
};

export const getFifoLabels = async (id: string) => {
  const response = await api.get(`/work-orders/${id}/fifo-labels`);
  return response.data;
};