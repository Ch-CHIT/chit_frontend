'use client';
import { toast } from 'react-toastify';
import { ErrorResponse } from '@/services/streamer/type';
import CustomError from '@/errors/errors';

export const handleError = (error: unknown): ErrorResponse => {
  if (error instanceof CustomError) {
    const { code, status, message } = error;

    toast.warn(`${error.message}`);
    return {
      status,
      code,
      message: message || '서버 오류가 발생했습니다.',
    };
  }
  console.error(error);
  toast.warn(`500 서버에러\n 알 수 없는 오류가 발생했습니다.`);
  return {
    status: 500,
    code: 500,
    message: '알 수 없는 오류가 발생했습니다.',
  };
};

export const isErrorResponse = (response: any): response is ErrorResponse => {
  return response && typeof response === 'object' && 'message' in response;
};
