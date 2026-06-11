import api from "./api";

export const getAssetLabels = async () => {
  const response = await api.get("/asset-labels");
  return response.data;
};

export const scanInbound = async (payload: {
  labelCode: string;
  workOrderId: string;
}) => {
  const response = await api.post("/asset-labels/scan", payload);
  return response.data;
};

export const scanOutbound = async (payload: {
  labelCode: string;
  workOrderId: string;
}) => {
  const response = await api.post("/asset-labels/outbound-scan", payload);
  return response.data;
};

export const printLabelPdf = (workOrderId: string) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token not found");
    return;
  }
  const baseURL = "https://wms-backend-ef8b.onrender.com/api/v1";
  window.open(
    `${baseURL}/asset-labels/print/${workOrderId}?token=${token}`,
    "_blank"
  );
};