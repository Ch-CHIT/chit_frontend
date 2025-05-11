import { handleError } from '@/lib/handleErrors';
import { RequestLogout } from './type';
import { AUTH_URLS } from '@/constants/urls';
import { ErrorResponse } from '../streamer/type';
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
}: loginType): Promise<{ accessToken: string; channelId: string } | ErrorResponse> => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ 쿠키 보내려면 이거 필요
    });
    const { data } = await response.json();
    const token = data;
    const payload = decodeJwtPayload(token);
    console.log('유효한 토큰:', payload);

    return { accessToken: data, channelId: payload.channelId }; // 성공적인 응답 데이터 반환
  } catch (error: any) {
    return handleError(error);
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
    console.log(response);

    return response;
  } catch (error: any) {
    return handleError(error);
  }
};
