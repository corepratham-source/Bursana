import api from "../api";

export const loginUser = async ({ identifier, password }) => {

  const payload = {
    identifier: identifier.trim(),
    password: password.trim()
  };

  console.log("LOGIN PAYLOAD:", payload);

  const response = await api.post("/auth/login", payload);

  return response.data;
};
