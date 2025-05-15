'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

const useParamsParser = () => {
  const params = useParams();

  const parsed = useMemo(() => {
    const parseParam = (key: string) => {
      const value = params[key];
      return Array.isArray(value) ? value[0] : value;
    };

    return {
      channelId: parseParam('channelID'),
      sessionCode: parseParam('sessionCode'),
    };
  }, [params]);

  return { channelId: parsed.channelId, sessionCode: parsed.sessionCode };
};

export default useParamsParser;
