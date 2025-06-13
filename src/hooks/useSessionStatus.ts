import { getContentsSessionStatus } from '@/services/streamer/streamer';
import { useState, useCallback, useEffect } from 'react';

export const useSessionStatus = (channelId: string, accessToken: string | null) => {
  const [isSessionOpen, setIsSessionOpen] = useState<boolean | null>(null);

  const fetchSessionStatus = useCallback(async (): Promise<boolean> => {
    if (!channelId || !accessToken) {
      setIsSessionOpen(false);
      return false;
    }

    try {
      const response = await getContentsSessionStatus(channelId, accessToken);
      const isOpen = response.success ? response.data.isOpen : false;
      setIsSessionOpen(isOpen);
      return isOpen;
    } catch {
      setIsSessionOpen(false);
      return false;
    }
  }, [accessToken, channelId]);

  useEffect(() => {
    fetchSessionStatus();
  }, [fetchSessionStatus]);

  return { isSessionOpen, fetchSessionStatus };
};
