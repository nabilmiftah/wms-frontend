import api from "./api";

export const getStorageBins = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: string;
}) => {
  const response = await api.get("/storage-bins", { params });
  return response.data;
};

export const getStorageBinById = async (id: string) => {
  const response = await api.get(`/storage-bins/${id}`);
  return response.data;
};

export const createStorageBin = async (payload: {
  warehouseId: string;
  category: "SMALL_ASSET" | "MEDIUM_ASSET" | "LARGE_ASSET";
  remarks?: string;
}) => {
  const response = await api.post("/storage-bins", payload);
  return response.data;
};

export const updateStorageBin = async (
  id: string,
  payload: {
    category?: "SMALL_ASSET" | "MEDIUM_ASSET" | "LARGE_ASSET";
    remarks?: string;
  }
) => {
  const response = await api.put(`/storage-bins/${id}`, payload);
  return response.data;
};

export const deleteStorageBin = async (id: string) => {
  const response = await api.delete(`/storage-bins/${id}`);
  return response.data;
};