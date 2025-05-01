'use client';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ErrorResponse } from '@/services/streamer/type';
import CustomError from '@/errors/errors';

// 서버 에러 형식 정의

// API 에러 핸들링 함수
export const handleAuthError = (error: unknown): ErrorResponse => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // 서버에서 응답한 에러
      console.log('여기냐?@');
      console.warn('🚨 Server Response:', error.response.data);
      return {
        status: error.response.status,
        error: error.response.data?.error || '서버 오류가 발생했습니다.',
        code: error.response.data?.code,
      };
    } else if (error.request) {
      // 요청이 전송되었지만 응답이 없음
      return {
        status: 503,
        error: '서버 응답이 없습니다. 네트워크 상태를 확인하세요.',
        code: 500,
      };
    }
  }

  // Axios 외의 일반적인 예외 처리
  console.warn('❌ Unexpected Error:', error);
  return {
    status: 500,
    error: '알 수 없는 오류가 발생했습니다.',
    code: 500,
  };
};

export const handleSessionError = (err: unknown): ErrorResponse => {
  if (err instanceof CustomError) {
    toast.warn(`${err.error}`);
    return {
      status: err.status,
      code: err.statusCode,
      error: err.error || '서버 오류가 발생했습니다.',
    };
  }
  toast.warn(`500 서버에러\n 알 수 없는 오류가 발생했습니다.`);
  return {
    status: 500,
    error: '알 수 없는 오류가 발생했습니다.',
    code: 500,
  };
};

export const isErrorResponse = (response: any): response is ErrorResponse => {
  return response && typeof response === 'object' && 'error' in response;
};
