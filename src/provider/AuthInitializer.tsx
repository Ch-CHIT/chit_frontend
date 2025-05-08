import { cookies } from 'next/headers';
import AuthInitializerClient from './AuthInitializerClient';
import { createSSRClient } from '@/services/_axios/ssrClient';
import { DEFAULT_URL } from '@/constants/urls';

export default async function AuthInitializer() {
  const cookieStore = await cookies();
  const REFRESH_TOKEN = cookieStore.get('REFRESH_TOKEN')?.value;

  const ssrClient = createSSRClient(`REFRESH_TOKEN=${REFRESH_TOKEN}`); // 👈 쿠키 직접 전달

  try {
    const response = await ssrClient.post(DEFAULT_URL + '/auth/refresh'); // 원하는 API 호출
    const accessToken = response.data?.data;
    console.log('debug : refreshToken 재발급');
    console.log(response.data);
    return <AuthInitializerClient accessToken={accessToken} refreshToken={REFRESH_TOKEN ?? null} />;
  } catch (err) {
    console.error('🔴 refresh 실패:', err);
    return <AuthInitializerClient accessToken={null} refreshToken={null} />;
  }
}
