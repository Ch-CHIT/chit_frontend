import { STORAGE_KEYS } from '@/constants/urls';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
export enum ViewerStatus {
  JOINED = 'JOINED', // 시청자가 세션에 참여 중
  SESSION_CLOSED = 'SESSION_CLOSED', // 스트리머가 세션 종료함
  DISCONNECTED = 'DISCONNECTED', // 연결이 끊긴 상태
  KICKED = 'KICKED', //강퇴당한 상태
}

type SSEState = {
  contentsSessionInfo: SSEStateContentsSession | null;
  sessionCode: string | null;
  currentParticipants: ParticipantResponseType[] | null;
  eventSource: EventSource | null;
  lastEventId: string | null;
  isConnected: boolean;
  isProcessing: boolean;
  errorMessage: string | null;
  viewerSessionInfo: viewerSessionInfo | null;
  viewerNickname?: string | null;
  isSessionError: boolean;
  viewerStatus: ViewerStatus | null;
  setProcessing: (value: boolean) => void;
  setSessionError: (value: boolean) => void;
  isRehydrated: boolean; // 상태가 로드 완료되었는지 여부 추가
  setCurrentParticipants: (newCurrentParticipants: ParticipantResponseType[]) => void;
  setViewerNickname: (viewerNickname: string) => void;
  startSSE: (url: string) => void;
  stopSSE: () => void;
  reset: () => void;
};

type SSEStateContentsSession = {
  sessionCode?: string;
  maxGroupParticipants?: number;
  totalParticipants?: number;
  gameParticipationCode?: string;
  order?: number;
  fixed?: boolean;
  participant?: ParticipantResponseType;
};

enum SSEEventType {
  JOINED_SESSION = 'JOINED_SESSION',
  LEFT_SESSION = 'LEFT_SESSION',
  KICKED_SESSION = 'KICKED_SESSION',
  PARTICIPANT_JOINED_SESSION = 'PARTICIPANT_JOINED_SESSION',
  PARTICIPANT_FIXED_SESSION = 'PARTICIPANT_FIXED_SESSION',
  PARTICIPANT_KICKED_SESSION = 'PARTICIPANT_KICKED_SESSION',
  PARTICIPANT_LEFT_SESSION = 'PARTICIPANT_LEFT_SESSION',
  SESSION_ORDER_UPDATED = 'SESSION_ORDER_UPDATED',
  CLOSED_SESSION = 'CLOSED_SESSION',
  UPDATED_SESSION = 'UPDATED_SESSION',
  STREAMER_SESSION_UPDATED = 'STREAMER_SESSION_UPDATED',
}

export type ParticipantResponseType = {
  order: number;
  round: number;
  status: ViewerStatus;
  fixedPick: boolean;
  viewerId: number;
  isReadyToPlay: boolean;
  participantId: number;
  chzzkNickname: string;
  gameNickname: string;
};

type EVENT_ParticipantAddedResponse = {
  maxGroupParticipants: number;
  currentParticipants?: number;
  participant: ParticipantResponseType;
};

type EVENT_ParticipantRemovededResponse = EVENT_ParticipantAddedResponse;

interface EVENT_SessionStatusUpdateResponse extends EVENT_ParticipantAddedResponse {
  sessionCode: string;
  maxGroupParticipants: number;
  currentParticipants: number;
  gameParticipationCode: string;
}

interface EVENT_ParticipantOrderUpdated extends ParticipantResponseType {
  gameParticipationCode?: string | null;
}

type viewerSessionInfo = EVENT_ParticipantOrderUpdated;
const initialSSEState = {
  contentsSessionInfo: null,
  sessionCode: null,
  currentParticipants: null,
  eventSource: null,
  lastEventId: null,
  isConnected: false,
  isProcessing: false,
  errorMessage: null,
  viewerSessionInfo: null,
  viewerNickname: null,
  isSessionError: false,
  viewerStatus: null,
  isRehydrated: false,
};

export const useSSEStore = create<SSEState>()(
  persist(
    (set, get) => ({
      ...initialSSEState,
      reset: () => set({ ...initialSSEState }),
      resetContentSessionInfo: () => {
        set((state) => ({ ...state, contentsSessionInfo: null }));
      },
      setCurrentParticipants: (newParticipants) => {
        set((state) => ({ ...state, currentParticipants: newParticipants }));
      },
      setViewerNickname: (viewerNickname) => {
        set((state) => ({
          ...state,
          viewerNickname,
        }));
      },
      setProcessing: (value) => set({ isProcessing: value }),
      setSessionError: (value) => set({ isSessionError: value }),
      stopSSE: () => {
        set((state) => {
          if (state.eventSource) {
            console.log('SSE연결을 종료합니다.');
            try {
              state.eventSource.close();
            } catch (isSessionError) {
              console.log('SSE 종료 중 오류 발생:', isSessionError);
            }
          }
          return {
            eventSource: null,
            isConnected: false,
            isSessionError: false,
            isProcessing: true,
            viewerSessionInfo: null,
          };
        });
      },
      startSSE: (url) => {
        set({ isProcessing: true });
        set((state) => {
          if (state.isConnected) {
            console.log('⚠️ 이미 SSE가 연결되어 있음. 중복 구독 방지');
            return state;
          }

          console.log('새로운 SSE연결 시작');
          const newEventSource = new EventSource(url);
          newEventSource.onopen = (event) => {
            console.log('SSE연결 성공~');
            console.log('연결성공메세지 수신', event);
            set({
              isConnected: true,
              isSessionError: false,
              viewerStatus: ViewerStatus.JOINED,
            }); // ✅ 에러 초기화
          };

          // ✅ 모든 이벤트 리스너 등록
          Object.values(SSEEventType).forEach((eventType) => {
            newEventSource.addEventListener(eventType, (event) => {
              console.log(`📩 ${eventType} 이벤트 수신:`, JSON.parse(event.data));
              const parsedData = JSON.parse(event.data);
              const { status, data: eventData, message } = parsedData;

              if (status !== 'OK') throw Error;
              const newState: Partial<SSEState> = {};

              switch (eventType) {
                // ✅ 공통 세션 참가 이벤트
                case SSEEventType.JOINED_SESSION:
                  console.log('📩 세션참가이벤트:', eventData);
                  if (eventData) newState.sessionCode = eventData;
                  break;

                //스트리머 세션 떠났을 때
                case SSEEventType.LEFT_SESSION:
                  get().stopSSE(); // 기존 stopSSE 함수 호출하여 안전하게 종료
                  break;

                case SSEEventType.CLOSED_SESSION:
                  get().stopSSE();
                  set({
                    viewerSessionInfo: null,
                    viewerStatus: ViewerStatus.SESSION_CLOSED,
                  }); // viewer 세션 정보 초기화
                  break;

                case SSEEventType.PARTICIPANT_JOINED_SESSION:
                  const { maxGroupParticipants, currentParticipants, participant } =
                    eventData as EVENT_ParticipantAddedResponse;

                  console.log('hit PARTICIPANT_JOINED_SESSION');
                  console.log(participant);
                  newState.contentsSessionInfo = {
                    ...(get().contentsSessionInfo || {}),
                    maxGroupParticipants,
                    totalParticipants: currentParticipants || 0,
                  };
                  const newCurrentParticipants = [
                    ...(get().currentParticipants ?? []),
                    participant,
                  ];

                  newState.currentParticipants = newCurrentParticipants;
                  break;

                //LEGACY
                case SSEEventType.PARTICIPANT_KICKED_SESSION:
                case SSEEventType.PARTICIPANT_LEFT_SESSION: {
                  const removedData = eventData as EVENT_ParticipantRemovededResponse;
                  const previoustParticipants = get().currentParticipants ?? [];
                  const {
                    participant: removedParticipant,
                    maxGroupParticipants,
                    currentParticipants,
                  } = removedData;
                  const newParticipants = previoustParticipants.filter(
                    (participant: ParticipantResponseType) =>
                      participant.viewerId !== removedParticipant.viewerId,
                  );

                  newState.contentsSessionInfo = {
                    ...(get().contentsSessionInfo || {}),
                    maxGroupParticipants,
                    totalParticipants: currentParticipants,
                  };
                  newState.currentParticipants = newParticipants.map((participant) => {
                    const updated = {
                      ...participant,
                      order: participant.order - 1,
                    };
                    console.log('updated order:', updated.order);
                    return updated;
                  });
                  console.log(newParticipants);
                  break;
                }
                case SSEEventType.PARTICIPANT_FIXED_SESSION: {
                  const fixedData = eventData as EVENT_ParticipantRemovededResponse;
                  const previoustParticipants = get().currentParticipants ?? [];
                  const { participant: fixedParticipant } = fixedData;
                  const nonFixedPariticipants = previoustParticipants.filter(
                    (participant: ParticipantResponseType) =>
                      participant.viewerId !== fixedParticipant.viewerId,
                  );

                  newState.currentParticipants = [fixedParticipant, ...nonFixedPariticipants];
                  console.log('newState');
                  console.log(newState);
                  break;
                }

                case SSEEventType.STREAMER_SESSION_UPDATED:
                  newState.contentsSessionInfo = {
                    ...(get().contentsSessionInfo || {}),
                    ...(eventData as EVENT_SessionStatusUpdateResponse),
                  };

                  if (get().viewerSessionInfo) {
                    newState.viewerSessionInfo = {
                      ...(get().viewerSessionInfo || {}),
                      ...(eventData as EVENT_ParticipantOrderUpdated),
                    };
                  }
                  break;

                case SSEEventType.SESSION_ORDER_UPDATED:
                case SSEEventType.UPDATED_SESSION:
                  newState.viewerSessionInfo = {
                    ...(get().viewerSessionInfo || {}),
                    ...(eventData as EVENT_ParticipantOrderUpdated),
                  };
                  break;

                case SSEEventType.LEFT_SESSION:
                  console.log('📩 참가자 세션 종료 이벤트 발생');
                  get().stopSSE(); // 기존 stopSSE 함수 호출하여 안전하게 종료
                  set({
                    viewerSessionInfo: null,
                    viewerStatus: ViewerStatus.DISCONNECTED,
                  }); // viewer 세션 정보 초기화
                  break;

                case SSEEventType.KICKED_SESSION: {
                  console.log('📩 참가자 세션 강퇴 이벤트 발생');
                  get().stopSSE(); // 기존 stopSSE 함수 호출하여 안전하게 종료
                  set({
                    viewerSessionInfo: null,
                    viewerStatus: ViewerStatus.KICKED,
                  }); // viewer 세션 정보 초기화
                  break;
                }

                default:
                  console.log('📩 세션 이벤트 수신:', eventData);
              }

              set(newState); // 상태 업데이트
            });
          });
          newEventSource.onmessage = (event) => {
            set({ ...state, lastEventId: event.lastEventId });
            console.log('메세지 수신', event.data.data.message);
          };

          newEventSource.onerror = (isSessionError) => {
            console.log('SSE오류 발생~', isSessionError);
            newEventSource.close();
            set({ isConnected: false, eventSource: newEventSource, isSessionError: true });
          };

          return {
            eventSource: newEventSource,
            isConnected: true,
            isSessionError: false,
          };
        });
      },
    }),

    {
      name: STORAGE_KEYS.SSEStorageKey,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        viewerNickname: state.viewerNickname,
        viewerSessionInfo: state.viewerSessionInfo,
        currentParticipants: state.currentParticipants,
        contentsSessionInfo: state.contentsSessionInfo,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isRehydrated = true; // 로드 완료 플래그 설정
        }
      },
    },
  ),
);
