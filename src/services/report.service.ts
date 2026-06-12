import api from "./api";

export const getInboundReports =
  async () => {
    const { data } =
      await api.get(
        "/reports/inbound",
      );

    return data;
  };

export const getOutboundReports =
  async () => {
    const { data } =
      await api.get(
        "/reports/outbound",
      );

    return data;
  };

export const getStockReports =
  async () => {
    const { data } =
      await api.get(
        "/reports/stock",
      );

    return data;
  };

  export const getOutboundReport = async () => {
  const response = await api.get("/reports/outbound");
  return response.data;
};