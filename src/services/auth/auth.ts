import { handleError } from '@/lib/handleErrors';
import { RequestLogout } from './type';
import { AUTH_URLS } from '@/constants/urls';
import { Result } from '../streamer/type';
import sessionClient from '../_axios/sessionClient';
type loginType = {
  code: string;
  state: string;
};
export const decodeJwtPayload = (token: string) => {
  const base64 = token.split('.')[1]; // payload
  const json = Buffer.from(base64, 'base64').toString('utf-8');
  return JSON.parse(json);
};

export const login = async ({
  code: code,
  state: state,
}: loginType): Promise<Result<{ accessToken: string; channelId: string }>> => {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ 쿠키 보내려면 이거 필요
    });
    const { data: token } = await response.json();
    const payload = decodeJwtPayload(token);
    const returnData = { accessToken: token, channelId: payload.channelId };
    return { success: true, data: returnData };
  } catch (error: unknown) {
    return { success: false, error: handleError(error) }; // 에러 핸들링 함수 사용
  }
};

//로그아웃
export const logout = async ({ accessToken }: RequestLogout) => {
  try {
    const response = await sessionClient.post(
      AUTH_URLS.logout,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      }, // ✅ 쿠키 보내려면 이거 필요,
    );

    if (response.status == 200) {
      await fetch('/api/auth/', {
        method: 'GET',
        credentials: 'include', // ✅ 쿠키 보내려면 이거 필요
      });
    }
    return response;
  } catch (error: any) {
    return handleError(error);
  }
};
