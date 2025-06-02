// utils/axiosInstance.js
import axios from "axios";
import axiosRetry from "axios-retry";
import http from "http";
import https from "https";

// Create Axios instance
const axiosInstance = axios.create({
  timeout: 60000, // 60s timeout
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

// Enable retry on failed requests
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
  },
});

export default axiosInstance;
