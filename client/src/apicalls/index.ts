import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
