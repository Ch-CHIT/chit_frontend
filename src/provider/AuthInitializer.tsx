'use server';
import { cookies } from 'next/headers';
import AuthInitializerClient from './AuthInitializerClient';
import { postRefresh } from '@/services/auth/auth';

export default async function AuthInitializer() {
  const cookieStore = await cookies();
  const REFRESH_TOKEN = cookieStore.get('REFRESH_TOKEN')?.value;
  let accessToken = null;
  if (REFRESH_TOKEN && !accessToken) {
    console.log('🔴 refreshToken 있음');

    const response = await postRefresh({ refreshToken: REFRESH_TOKEN });
    console.log(response);

    if (response.success) {
      console.log('🔵 refreshToken 재발급 성공');
      console.log(response);
      accessToken = response.data;
      console.log('debug : refreshToken 재발급');
      return <AuthInitializerClient accessToken={accessToken} />;
    } else {
      console.log('🔴 refreshToken 재발급 실패');
      return <AuthInitializerClient accessToken={null} />;
    }
  } else {
    console.log('🔴 refreshToken 없음');

    return <AuthInitializerClient accessToken={null} />;
  }
}
