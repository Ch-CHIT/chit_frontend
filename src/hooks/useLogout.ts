import { STORAGE_KEYS } from '@/constants/urls';
import useAuthStore from '@/store/authStore';
import useContentsSessionStore from '@/store/sessionStore';
import { useSSEStore } from '@/store/sseStore';

const useLogout = () => {
  const { setLogin, setAccessToken } = useAuthStore((state) => state);
  const { reset: resetSSE } = useSSEStore();
  const { reset: resetSession } = useContentsSessionStore();

  const resetLocal = () => {
    setAccessToken(null);
    setLogin(false);
    resetSSE();
    resetSession();
    console.log('🔴 로그아웃');
    localStorage.removeItem(STORAGE_KEYS.AuthStorageKey);
    localStorage.removeItem(STORAGE_KEYS.SSEStorageKey);
    localStorage.removeItem(STORAGE_KEYS.SessionStorageKey);
  };

  return resetLocal;
};

export default useLogout;
