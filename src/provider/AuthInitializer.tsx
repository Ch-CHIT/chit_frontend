'use server';
import { cookies } from 'next/headers';
import AuthInitializerClient from './AuthInitializerClient';
import { postRefresh } from '@/services/auth/auth';

export default async function AuthInitializer() {
  const cookieStore = await cookies();
  const REFRESH_TOKEN = cookieStore.get('REFRESH_TOKEN')?.value;
  let accessToken = null;
  if (REFRESH_TOKEN && !accessToken) {
    const response = await postRefresh({ refreshToken: REFRESH_TOKEN });

    if (response.success) {
      accessToken = response.data;
      return <AuthInitializerClient accessToken={accessToken} />;
    } else {
      console.warn('🔴 refreshToken 재발급 실패');
      return <AuthInitializerClient accessToken={null} />;
    }
  } else {
    return <AuthInitializerClient accessToken={null} />;
  }
}
