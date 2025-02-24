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
} from './type';
import { handleApiError } from '@/lib/error';
import axiosInstance from '../axios';

const client = new ChzzkClient();

//치지직 api를 통해 클라이언트 정보 가져오기
export const getStreamerInfo = async (
  channelId: string,
): Promise<StreamerInfo | null> => {
  try {
    const liveDetail = await client.live.detail(channelId);
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
      throw new Error(
        '요청이 전송되었지만 응답이 없습니다. 네트워크 상태를 확인하세요.',
      );
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
export const postStreamerInfo = async (
  channelId: string,
): Promise<StreamerInfo | null> => {
  const data = await axios
    .post(`${process.env.NEXT_PUBLIC_FRONT_API_URL}/api/streamer`, {
      channelId: channelId,
    })
    .catch((error) => {
      handleFetchError(error);
      throw error;
    });
  if (data?.data) return data.data.streamerInfo;
  return null;
};

//현재 세션 조회
export const getContentsSessionInfo = async (
  accessToken: string,
  page: number = 0,
  size: number = 20,
): Promise<GetContentsSessionResponse> => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/contents/session?page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );
    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleApiError(error); // 에러 핸들링 함수 사용
  }
};

//세션 생성
export const createContentsSession = async (
  data: CreateContentsSessionRequest,
  accessToken: string,
): Promise<CreateContentsSessionResponse> => {
  console.log(accessToken);
  try {
    const response = await axiosInstance.post(
      '/api/v1/contents/session',
      {
        ...data,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );
    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleApiError(error); // 에러 핸들링 함수 사용
  }
};

//세션 삭제
export const deleteContentsSession = async (
  accessToken: string,
): Promise<DeleteContentsSessionResponse> => {
  console.log(accessToken);
  try {
    const response = await axiosInstance.delete('/api/v1/contents/session', {
      headers: {
        Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
      },
    });

    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleApiError(error); // 에러 핸들링 함수 사용
  }
};

//세션에서 참가자 고정(Pick)
export const putContentsSessionParticipantPick = async (
  accessToken: string,
  viewerId: number,
): Promise<DeleteContentsSessionResponse> => {
  console.log(accessToken);
  try {
    const response = await axiosInstance.put(
      `/api/v1/contents/participants/${viewerId}/pick`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );

    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleApiError(error); // 에러 핸들링 함수 사용
  }
};

//세션에서 참가자 고정(Pick)
export const putContentsSessionNextGroup = async ({
  accessToken,
}: PutContentsSessionNextGroupRequest): Promise<PutContentsSessionNextGroupResponse> => {
  console.log(accessToken);
  try {
    const response = await axiosInstance.put(
      `/api/v1/contents/session/next-group`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );

    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleApiError(error); // 에러 핸들링 함수 사용
  }
};

//세션에서 참가자 추방
export const deleteContentsSessionParticipant = async (
  accessToken: string,
  viewerId: number,
): Promise<DeleteContentsSessionResponse> => {
  console.log(accessToken);
  try {
    const response = await axiosInstance.delete(
      `/api/v1/contents/participants/${viewerId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );

    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleApiError(error); // 에러 핸들링 함수 사용
  }
};
