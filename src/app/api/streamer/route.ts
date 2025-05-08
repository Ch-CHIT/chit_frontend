import { StreamerInfo } from '@/services/streamer/type';
import { ChzzkClient } from 'chzzk';
import { NextResponse } from 'next/server';

const client = new ChzzkClient({
  baseUrls: {
    chzzkBaseUrl: 'https://api.chzzk.naver.com',
    gameBaseUrl: 'https://comm-api.game.naver.com/nng_main',
  },
});

// POST 요청 처리
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { channelId } = body;
    console.log('post', channelId);
    if (!channelId) {
      return NextResponse.json({ error: 'channelId is required' }, { status: 400 });
    }
    const liveDetail = await client.live.detail(channelId);
    console.log(liveDetail);
    const { status, channel, liveCategory, liveCategoryValue } = liveDetail;
    const streamerInfo: StreamerInfo = {
      status,
      channel,
      liveCategory,
      liveCategoryValue,
    };

    if (streamerInfo) {
      return NextResponse.json({ streamerInfo }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Streamer is not live or HLS media not found' },
        { status: 404 },
      );
    }
  } catch (error: any) {
    console.error('🔥 Error fetching streamer info:', error);
    console.error('🔥 Error type:', typeof error, '| message:', error?.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
