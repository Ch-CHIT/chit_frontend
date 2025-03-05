import { ApiResponse, ContentsSession } from '@/store/sessionStore';
import { PartialChannel } from 'chzzk';
import { STATUS } from '../viewer/type';

export type StreamerStatusType = 'OPEN' | 'CLOSE';
export type StreamerInfo = {
  status: StreamerStatusType;
  channel: PartialChannel;
  liveCategory: string | undefined;
  liveCategoryValue: string | undefined;
};
export type ErrorResponse = {
  status: number;
  code?: number; //todo : 임시 code추가
  error: string;
  data: string;
};

export type CreateContentsSessionRequest = {
  gameParticipationCode: string | null;
  maxGroupParticipants: number;
};

export type CreateContentsSessionResponse = ApiResponse<ContentsSession>;

export type GetContentsSessionResponse =
  | ApiResponse<ContentsSession>
  | ErrorResponse;
export type DeleteContentsSessionResponse = ApiResponse<string> | ErrorResponse;

export type PutContentsSessionNextGroupRequest = {
  accessToken: string;
};
export type PutContentsSessionNextGroupResponse =
  | ApiResponse<STATUS>
  | ErrorResponse;
