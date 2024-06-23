import { axiosInstance } from ".";

export const verifyemail = async (payload: any) => {
  try {
    const response = await axiosInstance.post("/auth/verifyemail", payload);
    console.log("response.data: ", response.data);
    return response.data;
  } catch (error: any) {
    return error.response.message;
  }
};

// reset-password
export const resetPassword = async (payload: any) => {
  try {
    const response = await axiosInstance.post("/auth/reset-password", payload);
    return response.data;
  } catch (error: any) {
    return error.response.message;
  }
};
