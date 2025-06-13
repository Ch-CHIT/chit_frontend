import { STORAGE_KEYS } from '@/constants/urls';
import { ParticipantManager } from '@/lib/participantManager';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
export enum ViewerStatus {
  JOINED = 'JOINED', // 시청자가 세션에 참여 중
  SESSION_CLOSED = 'SESSION_CLOSED', // 스트리머가 세션 종료함
  DISCONNECTED = 'DISCONNECTED', // 연결이 끊긴 상태
  KICKED = 'KICKED', //강퇴당한 상태
  LEFT = 'LEFT', // 시청자가 세션을 떠난 상태
}

type SSEState = {
  contentsSessionInfo: SSEStateContentsSession | null;
  sessionCode: string | null;
  participantManager: ParticipantManager | null;
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
  setViewerStatus: (value: ViewerStatus) => void;
  isRehydrated: boolean; // 상태가 로드 완료되었는지 여부 추가
  setCurrentParticipants: (newCurrentParticipants: ParticipantResponseType[]) => void;
  setViewerNickname: (viewerNickname: string) => void;
  startSSE: (url: string, data?: ParticipantResponseType[]) => void;
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
  CALLED_NEXT_PARTY = 'CALLED_NEXT_PARTY',
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
  participantManager: null,
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

      setViewerStatus: (viewerStatus) => {
        set((state) => ({
          ...state,
          viewerStatus,
        }));
      },
      setProcessing: (value) => set({ isProcessing: value }),
      setSessionError: (value) => set({ isSessionError: value }),
      stopSSE: () => {
        set((state) => {
          if (state.eventSource) {
            try {
              state.eventSource.close();
            } catch (isSessionError) {
              console.warn('SSE 종료 중 오류 발생:', isSessionError);
            }
          }
          const manager = get().participantManager;
          if (manager) manager.clear();

          return {
            eventSource: null,
            isConnected: false,
            isSessionError: false,
            isProcessing: true,
            viewerSessionInfo: null,
          };
        });
      },
      startSSE: (url, data) => {
        if (get().isConnected) {
          console.warn('⚠️ SSE가 연결되어 있음. 중복 구독 방지 요청 종료');
          get().stopSSE(); // 기존 SSE 연결 종료
        }

        const manager = new ParticipantManager(data);
        set({ isProcessing: true });

        const newEventSource = new EventSource(url);

        newEventSource.onopen = () => {
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
            const { status, data: eventData } = parsedData;

            if (status !== 'OK') return;
            const newState: Partial<SSEState> = {};

            switch (eventType) {
              // ✅ 공통 세션 참가 이벤트
              case SSEEventType.JOINED_SESSION: //시청자에게 발생생\
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

              case SSEEventType.PARTICIPANT_JOINED_SESSION: {
                const { maxGroupParticipants, currentParticipants, participant } =
                  eventData as EVENT_ParticipantAddedResponse;

                newState.contentsSessionInfo = {
                  ...(get().contentsSessionInfo || {}),
                  maxGroupParticipants,
                  totalParticipants: currentParticipants || 0,
                };

                manager.addOrUpdateParticipant(participant);
                newState.currentParticipants = manager.getAllParticipants();

                break;
              }
              //LEGACY
              case SSEEventType.PARTICIPANT_KICKED_SESSION:
              case SSEEventType.PARTICIPANT_LEFT_SESSION: {
                const removedData = eventData as EVENT_ParticipantRemovededResponse;
                const {
                  participant: removedParticipant,
                  maxGroupParticipants,
                  currentParticipants,
                } = removedData;

                newState.contentsSessionInfo = {
                  ...(get().contentsSessionInfo || {}),
                  maxGroupParticipants,
                  totalParticipants: currentParticipants,
                };

                manager.removeParticipant(removedParticipant.participantId);
                newState.currentParticipants = manager.getAllParticipants();
                break;
              }

              case SSEEventType.PARTICIPANT_FIXED_SESSION: {
                const fixedData = eventData as EVENT_ParticipantRemovededResponse;
                const { participant: fixedParticipant } = fixedData;

                manager.fixedParticipant(fixedParticipant);
                newState.currentParticipants = manager.getAllParticipants();
                break;
              }

              case SSEEventType.STREAMER_SESSION_UPDATED: {
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
              }

              case SSEEventType.CALLED_NEXT_PARTY: {
                const limitPerGroup = get().contentsSessionInfo?.maxGroupParticipants || 1;
                manager.sendTopNToLastRound(limitPerGroup);
                newState.currentParticipants = manager.getAllParticipants();

                break;
              }

              case SSEEventType.SESSION_ORDER_UPDATED:
              case SSEEventType.UPDATED_SESSION: {
                newState.viewerSessionInfo = {
                  ...(get().viewerSessionInfo || {}),
                  ...(eventData as EVENT_ParticipantOrderUpdated),
                };
                break;
              }

              case SSEEventType.LEFT_SESSION: {
                get().stopSSE(); // 기존 stopSSE 함수 호출하여 안전하게 종료
                set({
                  viewerSessionInfo: null,
                  viewerStatus: ViewerStatus.DISCONNECTED,
                }); // viewer 세션 정보 초기화
                break;
              }

              case SSEEventType.KICKED_SESSION: {
                get().stopSSE(); // 기존 stopSSE 함수 호출하여 안전하게 종료
                set({
                  viewerSessionInfo: null,
                  viewerStatus: ViewerStatus.KICKED,
                }); // viewer 세션 정보 초기화
                break;
              }

              default:
            }

            set(newState); // 상태 업데이트
          });
        });

        //자동재연경, backOff로직
        newEventSource.onerror = (isSessionError) => {
          console.warn('❌ SSE 오류 발생 - 재연결 시도 예정', isSessionError);
          newEventSource.close();
          get().stopSSE();
          set({
            isConnected: false,
            eventSource: null,
            isSessionError: true,
          });
        };

        set({
          eventSource: newEventSource,
          isConnected: true,
          isSessionError: false,
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
