import axios from 'axios';
import { ChzzkClient } from 'chzzk';
import {
  StreamerInfo,
  GetContentsSessionResponse,
  CreateContentsSessionRequest,
  CreateContentsSessionResponse,
  DeleteContentsSessionResponse,
  PutContentsSessionNextGroupRequest,
  PutContentsSessionNextGroupResponse,
  Result,
} from './type';
import { handleError } from '@/lib/handleErrors';
import sessionClient from '../_axios/sessionClient';
import { SESSION_URLS } from '@/constants/urls';

const client = new ChzzkClient({
  baseUrls: {
    chzzkBaseUrl: 'https://api.chzzk.naver.com',
    gameBaseUrl: 'https://comm-api.game.naver.com/nng_main',
  },
});
//치지직 api를 통해 클라이언트 정보 가져오기
export const getStreamerInfo = async (channelId: string): Promise<StreamerInfo | null> => {
  try {
    const liveDetail = await client.live.detail(channelId);
    console.log(liveDetail);
    const { status, channel, liveCategory, liveCategoryValue } = liveDetail;

    const resStreamerInfo: StreamerInfo = {
      status,
      channel,
      liveCategory,
      liveCategoryValue,
    };
    return resStreamerInfo;
  } catch (error) {
    console.error('Error fetching streamer info:', error);
    throw new Error('Failed to fetch streamer info');
  }
};

const handleFetchError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    // Axios에서 발생한 오류 처리
    if (error.response) {
      // 서버에서 오류 응답을 반환했을 경우
      throw new Error(
        `서버 오류: ${error.response.status} - ${error.response.data.message || '알 수 없는 오류'}`,
      );
    } else if (error.request) {
      throw new Error('요청이 전송되었지만 응답이 없습니다. 네트워크 상태를 확인하세요.');
      // 요청이 만들어졌지만 응답이 없을 경우
    } else {
      throw new Error(`요청 중 오류가 발생했습니다: ${error.message}`);
      // 요청 생성 중 발생한 오류
    }
  } else {
    // 예상치 못한 오류 처리
    throw new Error(`알 수 없는 오류가 발생했습니다: ${String(error)}`);
  }

  // 추가: 로그를 서버로 전송하거나 콘솔에 기록
};

//치지직 api에 직접 스트리머 정보 가져오는 api
export const postStreamerInfo = async (channelId: string): Promise<StreamerInfo | null> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_FRONT_API_URL}/api/streamer`, {
    method: 'POST', // POST 메소드 사용
    headers: {
      'Content-Type': 'application/json', // JSON 형식으로 데이터 전송
    },
    body: JSON.stringify({ channelId }), // channelId를 JSON 형식으로 변환하여 전송
    cache: 'no-store', // ✅ SSR 로딩 감지를 위해 추가!
  }).catch((error) => {
    console.log('Error fetching streamer info:', error);
    handleFetchError(error);
    throw error;
  });
  console.log(res);
  if (!res.ok) {
    console.error('스트리머 정보 가져오기 실패');
    return null;
  }

  const json = await res.json();
  return json?.streamerInfo ?? null; // 응답 데이터에서 스트리머 정보 추출
};

//현재 세션 조회
export const getContentsSessionInfo = async ({
  page = 0,
  accessToken,
  size = 20,
}: {
  accessToken: string;
  page: number;
  size: number;
}): Promise<Result<GetContentsSessionResponse>> => {
  try {
    const response = await sessionClient.get(
      `${SESSION_URLS.contentsSession}?page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );

    return { success: true, data: response.data }; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return { success: false, error: handleError(error) }; // 에러 핸들링 함수 사용
  }
};

//세션 생성
export const createContentsSession = async (
  data: CreateContentsSessionRequest,
  accessToken: string,
): Promise<Result<CreateContentsSessionResponse>> => {
  try {
    const response = await sessionClient.post(
      SESSION_URLS.contentsSession,
      {
        ...data,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return { success: true, data: response.data }; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return { success: false, error: handleError(error) }; // 에러 핸들링 함수 사용
  }
};

//세션 수정 : 세션생성과 구조는 동일하고 put메소드만 다름
export const updateContentsSession = async (
  data: CreateContentsSessionRequest,
  accessToken: string,
): Promise<Result<CreateContentsSessionResponse>> => {
  console.log(accessToken);
  try {
    const response = await sessionClient.put(
      SESSION_URLS.contentsSession,
      {
        ...data,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );

    return { success: true, data: response.data }; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return { success: false, error: handleError(error) }; // 에러 핸들링 함수 사용
  }
};

//세션 삭제
export const deleteContentsSession = async (
  accessToken: string,
): Promise<Result<DeleteContentsSessionResponse>> => {
  console.log(accessToken);
  try {
    const response = await sessionClient.delete(SESSION_URLS.contentsSession, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
      },
    });

    return { success: true, data: response.data }; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return { success: false, error: handleError(error) }; // 에러 핸들링 함수 사용
  }
};

//세션에서 참가자 고정(Pick)
export const putContentsSessionParticipantPick = async (
  accessToken: string,
  viewerId: number,
): Promise<Result<DeleteContentsSessionResponse>> => {
  try {
    const response = await sessionClient.put(
      `${SESSION_URLS.contentsParticipants}/${viewerId}/pick`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );

    return { success: true, data: response.data }; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return { success: false, error: handleError(error) }; // 에러 핸들링 함수 사용
  }
};

//세션에서 다음 그룹 호출하기
export const putContentsSessionNextGroup = async ({
  accessToken,
}: PutContentsSessionNextGroupRequest): Promise<Result<PutContentsSessionNextGroupResponse>> => {
  console.log(accessToken);
  try {
    const response = await sessionClient.put(
      `${SESSION_URLS.contentsSession}/next-group`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );

    return { success: true, data: response.data }; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return { success: false, error: handleError(error) }; // 에러 핸들링 함수 사용
  }
};

//세션에서 참가자 추방
export const deleteContentsSessionParticipant = async (
  accessToken: string,
  viewerId: number,
): Promise<Result<DeleteContentsSessionResponse>> => {
  console.log(accessToken);
  try {
    const response = await sessionClient.delete(
      `${SESSION_URLS.contentsParticipants}/${viewerId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );

    return { success: true, data: response.data }; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return { success: false, error: handleError(error) }; // 에러 핸들링 함수 사용
  }
};
