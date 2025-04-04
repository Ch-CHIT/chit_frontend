import { handleSessionError } from '@/lib/handleErrors';
import sessionClient from '../axios/sessionClient';
import { SSE_URLS } from '@/constants/urls';

//Get
//15초 주기로 체크하는 하트비트
export const heartBeat = async (accessToken: string, sessionCode: string) => {
  try {
    const response = await sessionClient.get(
      `${SSE_URLS.heartBeat}?sessionCode=${sessionCode}&accessToken=${accessToken}`,
      {},
    );

    console.log('debug : heartBeat 체크 시작합니다');
    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return Promise.reject(handleSessionError(error)); // 에러 핸들링 함수 사용
  }
};
