import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import setUpTokenInterceptor from './setUpTokenInterceptor';
import { ErrorResponse } from '../streamer/type';
import CustomError from '@/errors/errors';

const sessionClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // API의 기본 URL
  timeout: 100000,
  withCredentials: true, // ✅ 여기에 추가
  headers: {
    'Content-Type': 'application/json', // 기본 Content-Type
  },
});
// // 요청 인터셉터
// sessionClient.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     // 요청 전 처리 (예: 토큰 추가)
//     const accessToken = sessionStorage.getItem('accessToken');
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => {
//     // 요청 오류 처리
//     console.error('intercepter error');
//     return Promise.reject(error);
//   },
// );

setUpTokenInterceptor(sessionClient);

// 응답 인터셉터
sessionClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    // 요청 오류 처리
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // 서버에서 응답한 에러
        console.warn('🚨 Server Response:', error.response.data);
        const { code, status, message } = error.response.data;
        return Promise.reject(
          new CustomError({
            code,
            status,
            message: message || '서버 오류가 발생했습니다.',
          }),
        );
      }
      return Promise.reject(
        new CustomError({
          code: 500,
          status: 500,
          message: error.message || 'Axios 요청 중 오류가 발생했습니다.',
        }),
      );
    }

    // Axios 외의 일반적인 예외 처리
    console.warn('❌ Unexpected Error:', error);
    return Promise.reject(
      new CustomError({
        code: 500,
        status: 500,
        message: '알 수 없는 오류가 발생했습니다!.',
      }),
    );
  },
  // 응답 데이터 가공
);

export default sessionClient;
