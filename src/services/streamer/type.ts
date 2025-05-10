import { ApiResponse, ContentsSession } from '@/store/sessionStore';
import { PartialChannel } from 'chzzk';
import { STATUS } from '../viewer/type';

export type StreamerStatusType = 'OPEN' | 'CLOSE';
export type StreamerInfo = {
  status: StreamerStatusType;
  channel: PartialChannel;
  liveCategory: string | null;
  liveCategoryValue: string | null;
};
export type ErrorResponse = {
  status: number; //상태코드
  code: number; //커스텀코드
  message: string; //에러메세지
};

export type CreateContentsSessionRequest = {
  gameParticipationCode: string | null;
  maxGroupParticipants: number;
};

export type CreateContentsSessionResponse = ApiResponse<ContentsSession>;

export type GetContentsSessionResponse = ApiResponse<ContentsSession>;
export type DeleteContentsSessionResponse = ApiResponse<string> | ErrorResponse;

export type PutContentsSessionNextGroupRequest = {
  accessToken: string;
};
export type PutContentsSessionNextGroupResponse = ApiResponse<STATUS> | ErrorResponse;

export type Result<T> = { success: true; data: T } | { success: false; error: ErrorResponse };
