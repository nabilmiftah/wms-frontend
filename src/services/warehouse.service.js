import api from "./api";

export const getWarehouses =
  async () => {
    const { data } =
      await api.get(
        "/warehouses",
      );

    return data;
  };

export const createWarehouse =
  async (payload) => {
    const { data } =
      await api.post(
        "/warehouses",
        payload,
      );

    return data;
  };

export const updateWarehouse =
  async (id, payload) => {
    const { data } =
      await api.put(
        `/warehouses/${id}`,
        payload,
      );

    return data;
  };

export const deleteWarehouse =
  async (id) => {
    const { data } =
      await api.delete(
        `/warehouses/${id}`,
      );

    return data;
  };