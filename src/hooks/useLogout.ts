import { STORAGE_KEYS } from '@/constants/urls';
import useAuthStore from '@/store/authStore';
import useContentsSessionStore from '@/store/sessionStore';
import { useSSEStore } from '@/store/sseStore';
import { useRouter } from 'next/navigation';

const useLogout = () => {
  const { setLogin, setAccessToken } = useAuthStore((state) => state);
  const { reset: resetSSE } = useSSEStore();
  const { reset: resetSession } = useContentsSessionStore();
  const router = useRouter();
  const resetLocal = () => {
    setAccessToken(null);
    setLogin(false);
    resetSSE();
    resetSession();
    router.refresh();
    console.log('🔴 로그아웃');
    sessionStorage.removeItem(STORAGE_KEYS.AuthStorageKey);
    sessionStorage.removeItem(STORAGE_KEYS.SSEStorageKey);
    sessionStorage.removeItem(STORAGE_KEYS.SessionStorageKey);
  };

  return resetLocal;
};

export default useLogout;
