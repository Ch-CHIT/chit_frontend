'use client';
import axios from 'axios';
import SessionError from '@/app/errors/sessionError';
import { toast } from 'react-toastify';
import { ErrorResponse } from '@/services/streamer/type';

// 서버 에러 형식 정의

// API 에러 핸들링 함수
export const handleAuthError = (error: unknown): ErrorResponse => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // 서버에서 응답한 에러
      console.warn('🚨 Server Response:', error.response.data);
      return {
        status: error.response.status,
        error: error.response.data?.error || '서버 오류가 발생했습니다.',
        data: error.response.data?.data,
      };
    } else if (error.request) {
      // 요청이 전송되었지만 응답이 없음
      return {
        status: 503,
        error: '서버 응답이 없습니다. 네트워크 상태를 확인하세요.',
        data: 'null',
      };
    }
  }

  // Axios 외의 일반적인 예외 처리
  console.warn('❌ Unexpected Error:', error);
  return {
    status: 500,
    error: '알 수 없는 오류가 발생했습니다.',
    data: 'null',
  };
};

export const handleSessionError = (error: unknown): ErrorResponse => {
  if (error instanceof SessionError) {
    toast.warn(`에러코드:${error.code}\n ${error.name}:${error.message}`);
    return {
      status: error.status,
      code: error.code,
      error: error.name || '서버 오류가 발생했습니다.',
      data: error.message,
    };
  }
  return {
    status: 500,
    error: '알 수 없는 오류가 발생했습니다.',
    data: 'null',
  };
};
