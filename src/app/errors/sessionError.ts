import CustomError from './errors';
// 1. 에러 코드 상수 정의
export const SessionErrorCode = {
  LIVE_STREAM_INACTIVE: {
    //진행중인 라이브가 없을 경우
    name: 'LiveStreamInactiveError',
    status: 400,
    code: 301,
    message: '라이브 방송이 꺼져있습니다, 라이브 방송을 키고 다시 시도해주세요',
  },
  LIVE_SESSION_NOT_FOUND: {
    //진행중인 세션이 없을 경우
    name: 'LiveSessionNotFoundError',
    status: 400,
    code: 302,
    message: '현재 진행 중인 시청자 참여 세션이 없습니다. 다시 확인해주세요',
  },
  INVALID_PARTICIPANT_COUNT: {
    name: 'InvalidParticipantCountError',
    status: 400,
    code: 303,
    message: '그룹당 최대 참가자 수는 1명 이상이어야 합니다. 현재 값: 0',
  },
  PARTICIPANT_NOT_FOUND: {
    name: 'participantNotFoundError',
    status: 400,
    code: 304,
    message: '해당 참여자가 존재하지 않습니다.',
  },
};

// viewerAPI와 streamerAPI에 사용됩니다.
class SessionError extends CustomError {
  constructor(errorCode = SessionErrorCode.LIVE_STREAM_INACTIVE) {
    super({ ...errorCode });
  }
}

export default SessionError;
