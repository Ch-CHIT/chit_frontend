import { heartBeat } from '@/services/common/common';
import { useEffect, useRef } from 'react';

export const useHeartBeat = (sessionCode: string, accessToken: string, time: number) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sessionCode && accessToken) {
      console.warn('sessionCode나 accessToken이 없습니다.');
      return;
    }

    intervalRef.current = setInterval(() => {
      heartBeat(accessToken, sessionCode);
    }, time);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionCode, accessToken, time]);
};
