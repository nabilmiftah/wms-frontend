import api from "./api";

export const getUsers =
  async (
    page = 1,
    search = "",
  ) => {
    const { data } =
      await api.get("/users", {
        params: {
          page,
          limit: 10,
          search,
        },
      });

    return data;
  };

export const createUser =
  async (payload: {
    userName: string;
    email: string;
    password: string;
    role?: string;
    telp?: string;
  }) => {
    const { data } =
      await api.post(
        "/users",
        payload,
      );

    return data;
  };

export const updateUser =
  async (
    id: string,
    payload: {
      userName?: string;
      role?: string;
      telp?: string;
    },
  ) => {
    const { data } =
      await api.put(
        `/users/${id}`,
        payload,
      );

    return data;
  };

export const deleteUser =
  async (id: string) => {
    const { data } =
      await api.delete(
        `/users/${id}`,
      );

    return data;
  };