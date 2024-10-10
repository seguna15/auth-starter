import axios from "axios";

export const baseURL = "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
});

apiClient.defaults.withCredentials = true;
apiClient.interceptors.request.use(
  (config) => {
    if (!config.headers["Authorization"]) {
      const user = JSON.parse(localStorage.getItem("userInfo"));
      const token = user?.token;
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const prevRequest = error?.config;
    if (error?.response?.status === 401 && !prevRequest?.sent) {
      prevRequest.sent = true;
      const response = await apiClient.post(
        "/auth/refresh",
        {},
       
      );
      if (response.status === 200) {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const user = { ...userInfo, token: response.data.accessToken };
        localStorage.setItem("userInfo", JSON.stringify(user));
        prevRequest.headers[
          "Authorization"
        ] = `Bearer ${response.data["accessToken"]}`;
        return axios(prevRequest);
      }
    }

    if (error?.response?.status === 403) {
      localStorage.removeItem("userInfo");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);
