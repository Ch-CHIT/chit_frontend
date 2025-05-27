import { STORAGE_KEYS } from '@/constants/urls';
import { StreamerInfo, UserInfo } from '@/services/streamer/type';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

interface ChannelState {
  channelId: string | undefined; //내 채널 정보
  myChannelInfo?: UserInfo | null;
  sessionCode: string | null;
  streamerInfo: StreamerInfo | null;
  isRehydrated: boolean;
}

type ChannelAction = {
  setChannelId: (channelId: string) => void;
  setStreamerInfo: (streamerInfo: StreamerInfo) => void;
  setMyChannelInfo: (myChannelInfo: UserInfo) => void;
  setSessionCode: (channelId: string) => void;
};

// 스트리머와 유저의 채널 정보를 관리하는 zustand 스토어입니다.
//myChannelInfo는 유저의 채널 정보입니다.
// streamerInfo는 스트리머의 채널 정보입니다.
// channelId는 현재 방송중인 채널의 ID입니다.
// 시청자로 로그인이라면 스트리머의 channelId, 스트리머로 로그인했다면 자신의 channelId입니다.
const useChannelStore = create<ChannelState & ChannelAction>()(
  devtools(
    persist(
      (set) => ({
        channelId: '',
        streamerInfo: null,
        myChannelInfo: null,
        isRehydrated: false,
        sessionCode: null,
        setChannelId: (channelId) =>
          set((state) => ({
            ...state,
            channelId: channelId,
          })),

        setSessionCode: (sessionCode) =>
          set((state) => ({
            ...state,
            sessionCode: sessionCode,
          })),
        setStreamerInfo: (streamerInfo) =>
          set((state) => ({
            ...state,
            streamerInfo: streamerInfo,
          })),
        setMyChannelInfo: (myChannelInfo) =>
          set((state) => ({
            ...state,
            myChannelInfo: myChannelInfo,
          })),
      }),
      {
        name: STORAGE_KEYS.ChannelStorageKey,
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          channelId: state.channelId,
          sessionCode: state.sessionCode,
          streamerInfo: state.streamerInfo,
          myChannelInfo: state.myChannelInfo,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.isRehydrated = true; // 로드 완료 플래그 설정
          }
        },
      },
    ),
    { anonymousActionType: STORAGE_KEYS.ChannelStorageKey, name: STORAGE_KEYS.ChannelStorageKey },
  ),
);

export default useChannelStore;
