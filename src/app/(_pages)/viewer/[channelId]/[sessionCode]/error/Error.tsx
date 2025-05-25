'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const params = useParams();
  const channelId = params.channelId;
  useEffect(() => {
    console.error(error);
  }, [error, reset]);

  return (
    <div>
      <h1>에러가 발생했습니다!</h1>
      <p>{error.message || null}</p>
      <button
        onClick={() => {
          router.push(`/${channelId}`);
        }}
      >
        다시 시도
      </button>
    </div>
  );
}
