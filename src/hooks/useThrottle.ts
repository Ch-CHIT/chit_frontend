import { useCallback, useRef } from 'react';

const useThrottle = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
) => {
  const lastCall = useRef<number>(0); // ✅ 마지막 실행 시간만 저장

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    },
    [delay], // ✅ 최신 상태 유지
  );
};

export default useThrottle;
