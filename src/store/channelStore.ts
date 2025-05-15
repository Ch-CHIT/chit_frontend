import { STORAGE_KEYS } from '@/constants/urls';
import { StreamerInfo } from '@/services/streamer/type';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

interface ChannelState {
  channelId: string | undefined;
  sessionCode: string | null;
  streamerInfo: StreamerInfo | null;
  isRehydrated: boolean;
}

type ChannelAction = {
  setChannelId: (channelId: string) => void;
  setStreamerInfo: (streamerInfo: StreamerInfo) => void;
  setSessionCode: (channelId: string) => void;
};

const useChannelStore = create<ChannelState & ChannelAction>()(
  devtools(
    persist(
      (set) => ({
        channelId: '',
        streamerInfo: null,
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
      }),
      {
        name: STORAGE_KEYS.ChannelStorageKey,
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          channelId: state.channelId,
          sessionCode: state.sessionCode,
          streamerInfo: state.streamerInfo,
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
