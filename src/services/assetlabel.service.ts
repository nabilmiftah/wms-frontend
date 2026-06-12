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

export const printLabelPdf = async (workOrderId: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found");
      return;
    }

    const baseURL = "https://wms-backend-ef8b.onrender.com/api/v1";
    const response = await fetch(`${baseURL}/asset-labels/print/${workOrderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to print label');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (error) {
    console.error("Print label error:", error);
  }
};