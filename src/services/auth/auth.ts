import { handleError } from '@/lib/handleErrors';
import { RequestLogout } from './type';
import { AUTH_URLS } from '@/constants/urls';
import { ErrorResponse, Result } from '../streamer/type';
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
    console.log(response);
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

export const postRefresh = async ({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<Result<string | null>> => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + AUTH_URLS.refresh, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `REFRESH_TOKEN=${refreshToken}`,
      },
      credentials: 'include',
    }); // 원하는 API 호출s
    console.log('refres hFECTH');
    console.log(response);
    const data = await response.json();
    if (response.status == 200) {
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error };
  } catch (error: unknown) {
    console.log(error);
    return { success: false, error: error as ErrorResponse }; // 에러 핸들링 함수 사용
  }
};
