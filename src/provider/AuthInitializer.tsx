'use server';
import { cookies } from 'next/headers';
import AuthInitializerClient from './AuthInitializerClient';
import { createSSRClient } from '@/services/_axios/ssrClient';
import { DEFAULT_URL } from '@/constants/urls';

export default async function AuthInitializer() {
  const cookieStore = await cookies();
  const REFRESH_TOKEN = cookieStore.get('REFRESH_TOKEN')?.value;

  try {
    if (!REFRESH_TOKEN) {
      console.log('🔴 refreshToken 없음');

      const response = await fetch(DEFAULT_URL + '/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키를 포함하여 요청
      }); // 원하는 API 호출s
      console.log(response);
      const accessToken = await response?.data?.accessToken;
      console.log('debug : refreshToken 재발급');
      console.log(response.data?.accessToken);
      return <AuthInitializerClient accessToken={accessToken} />;
    } else {
      return <AuthInitializerClient accessToken={null} />;
    }
  } catch (err) {
    console.log('🔴 refresh 실패:', err);
    return <AuthInitializerClient accessToken={null} refreshToken={null} />;
  }
}
