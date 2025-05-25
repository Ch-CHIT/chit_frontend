import { handleError } from '@/lib/handleErrors';
import sessionClient from '../_axios/sessionClient';
import { AUTH_URLS, SSE_URLS } from '@/constants/urls';
import { Result } from '../streamer/type';
import { ApiResponse } from '@/store/sessionStore';

//Get
//15초 주기로 체크하는 하트비트
export const heartBeat = async (
  accessToken: string,
  sessionCode: string,
): Promise<Result<{ data: string }>> => {
  //to do 임시
  try {
    const response = await sessionClient.get(
      `${SSE_URLS.heartBeat}?sessionCode=${sessionCode}&accessToken=${accessToken}`,
      {},
    );

    console.log('debug : heartBeat 체크 시작합니다');
    return { success: true, data: response.data }; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return { success: false, error: handleError(error) }; // 에러 핸들링 함수 사용
  }
};

export type RefreshAccessTokenResponse = { code: number; data: string; status: number };
export const refreshAccessToken = async (): Promise<
  Result<ApiResponse<RefreshAccessTokenResponse>>
> => {
  try {
    const response = await sessionClient.post(`${AUTH_URLS.refresh}`);

    console.log('debug : refreshToken 재발급');
    console.log(response.data);
    return { success: true, data: response.data }; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return { success: false, error: handleError(error) }; // 에러 핸들링 함수 사용
  }
};
