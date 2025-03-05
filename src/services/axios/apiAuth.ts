import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

const apiAuth: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // API의 기본 URL
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json', // 기본 Content-Type
  },
});
// 요청 인터셉터
apiAuth.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 요청 전 처리 (예: 토큰 추가)
    const accessToken = sessionStorage.getItem('accessToken');
    if (accessToken) {
      console.log('axios : ', accessToken);
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    // 요청 오류 처리
    console.log('intercepter error');
    return Promise.reject(error);
  },
);

// 응답 인터셉터
apiAuth.interceptors.response.use((response: AxiosResponse) => {
  // 응답 데이터 가공
  return response;
});

export default apiAuth;
