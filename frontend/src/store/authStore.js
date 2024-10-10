import {create} from "zustand";
import { apiClient } from "../api";

export const useAuthStore = create((set) => ({
  user: null,
  error: null,
  isLoading: false,
  isGoogleLoading: false,
  userProfile: null,
  message: null,

  signup: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/auth/register", {
        username,
        email,
        password,
      });
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error.response.data.message || "Error signing up",
        isLoading: false,
      });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("auth/verify-email", { code });
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error.response.data.message || "Error verifying email",
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(
        "/auth/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));

      set({
        user: JSON.parse(localStorage?.getItem("userInfo")),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response.data.message || "Error signing up",
        isLoading: false,
      });
      throw error;
    }
  },

  googleLogin: async() => {
    set({isGoogleLoading: true, error: null})
     try {
       const { data } = await apiClient.post("/auth/google-request");
       set({isGoogleLoading: false, error: null})
       window.location.href = data?.url;
     } catch (error) {
      set({
        error: error.response.data.message || "Error signing up with google",
        isGoogleLoading: false,
      });
      throw error;     
    }
  },

  googleAuthSuccessful: async(email) => {
     set({ isLoading: true, error: null });
     try {
       const response = await apiClient.post(
         "/auth/google-auth-successful",
         {
           email,
         },
         { withCredentials: true }
       );
       localStorage.setItem("userInfo", JSON.stringify(response.data.user));

       set({
         user: JSON.parse(localStorage?.getItem("userInfo")),
         isLoading: false,
       });
     } catch (error) {
       set({
         error: error.response.data.message || "Error signing up",
         isLoading: false,
       });
       throw error;
     }
  },

  fetchAdminUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/users/get-admin-profile");
      set({ userProfile: response.data.user, isLoading: false });
    } catch (error) {
      set({
        error: error.response.data.message || "Error fetching data",
        isLoading: false,
      });
    }
  },

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/users/get-user-profile");
      set({ userProfile: response.data.user, isLoading: false });
    } catch (error) {
      set({
        error: error.response.data.message || "Error fetching data",
        isLoading: false,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      localStorage.removeItem("userInfo");
      const response = await apiClient.post("/auth/logout");
      console.log(response.data);
      set({ user: null, isLoading: false });
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Error fetching data",
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    const userAuth = localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null;
    set({ user: userAuth });
  },

  forgotPassword: async (email)=> {
    set({isLoading: true, error: null })
    try {
        const response = await apiClient.post("/auth/forgot-password", {email});
        set({message: response.data.message, isLoading: false})
    } catch (error) {
        set({ isLoading: false, error: error.response.data.message || "Error sending reset password email" });
        throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({isLoading: true, error: null})
    try {
        const response = await apiClient.post(`/auth/reset-password/${token}`, {password})
        set({message: response.data.message, isLoading: false})
    } catch (error) {
        set({
        isLoading: false,
        error:
            error.response.data.message ||
            "Error sending reset password email",
        });
        throw error;
    }
  },

  
}));

