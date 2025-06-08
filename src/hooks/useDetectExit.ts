import { useEffect, useRef } from 'react';

//새로고침일 시엔 alert안 띄움, 브라우저 종료만 감지
const useDetectExit = (onExit: () => void) => {
  const isRefresh = useRef(false); // 🔥 useRef로 상태 유지

  useEffect(() => {
    const handlePageHide = (event: PageTransitionEvent) => {
      console.log('pageHide 이벤트 발생', event.persisted); //사용자가 탭을 전환하거나 백그라운드로 이동하면 발생
      if (!event.persisted) {
        if (!isRefresh.current) {
          alert('⚠️ 경고: 창을 닫으시겠습니까?');
          onExit();
        } else {
          console.log('tab 전환');
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'F5' ||
        (event.ctrlKey && event.key === 'r') || //ctrl + R windows
        (event.metaKey && event.key === 'r') //cmd+R  mac
      )
        isRefresh.current = true;

      setTimeout(() => {
        isRefresh.current = false;
      }, 3000);
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isRefresh.current) {
        event.preventDefault();
        event.returnValue = '';
        onExit();
        return false;
      }
    };

    //이벤트 리스너 등록
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    //이벤트 리스너 해제
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};

export default useDetectExit;
