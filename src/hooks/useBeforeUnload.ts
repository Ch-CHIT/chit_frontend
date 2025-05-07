import { useEffect } from 'react';
import useParamsParser from './useParamsParser';
import { STORAGE_KEYS } from '@/constants/urls';

const useBeforeUnload = () => {
  useEffect(() => {
    const handleExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      console.log("🚀 사용자가 'Yes'를 선택하여 페이지를 떠남. sessionStorage 비우기 실행!");
      sessionStorage.removeItem(STORAGE_KEYS.SSEStorageKey);

      // ✅ 일부 브라우저에서만 필요한 레거시 코드
      event.returnValue = '';
      return '';
    };

    // const handleBackNavigation = (event: PageTransitionEvent) => {
    //   event.preventDefault();

    //   if (event.persisted) {
    //     console.log(
    //       '🚀 뒤로가기로 인해 bfcache에서 페이지 복원됨! sessionStorage 비우기 실행',
    //     );
    //     sessionStorage.removeItem(SSEStorageKey);
    //   }
    // };

    window.addEventListener('beforeunload', handleExit); // ✅ 브라우저 종료 시 경고창 & sessionStorage 비우기
    window.addEventListener('unload', handleExit); // ✅ 브라우저 종료 시 sessionStorage 비우기
    window.addEventListener('pagehide', handleExit); // ✅ 모바일 사파리에서 페이지가 백그라운드로 갈 때 실행

    return () => {
      window.removeEventListener('beforeunload', handleExit);
      window.removeEventListener('unload', handleExit);
      window.removeEventListener('pagehide', handleExit);
    };
  }, []);
};

export const useBackNavigationWarning = (message = '정말 뒤로 가시겠습니까?') => {
  const { channelId, sessionCode } = useParamsParser();
  useEffect(() => {
    const handlePopState = () => {
      const userConfirmed = window.confirm(message); // ✅ 뒤로 가기 시 경고창 띄우기
      if (userConfirmed) {
        console.log("🚀 사용자가 'Yes'를 선택! sessionStorage 비우기 실행.");
        sessionStorage.removeItem(STORAGE_KEYS.SSEStorageKey); // ✅ "Yes"를 선택하면 sessionStorage 비움
        window.removeEventListener('popstate', handlePopState); // ✅ 뒤로 가기 방해하지 않도록 이벤트 제거
        window.history.replaceState(null, '', `/${channelId}/${sessionCode}`); // ✅ 히스토리 초기화
      } else {
        console.log("❌ 사용자가 'No'를 선택! 현재 페이지 유지.");
        window.history.pushState(null, '', window.location.href); // ✅ "No"를 선택하면 현재 페이지 유지
      }
    };

    window.history.pushState(null, '', window.location.href); // ✅ 현재 페이지 상태 저장 (뒤로 가기 방지)
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [message, channelId, sessionCode]);
};

export default useBeforeUnload;
