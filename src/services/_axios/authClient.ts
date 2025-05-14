import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import setUpTokenInterceptor from './setUpTokenInterceptor';

const authClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // API의 기본 URL
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json', // 기본 Content-Type
  },
});
// 요청 인터셉터
authClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 요청 전 처리 (예: 토큰 추가)
    const accessToken = sessionStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    // 요청 오류 처리
    console.error('intercepter error');
    return Promise.reject(error);
  },
);

setUpTokenInterceptor(authClient);

export default authClient;
