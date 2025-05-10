import { StreamerInfo } from '@/services/streamer/type';
import { NextResponse } from 'next/server';

// POST 요청 처리
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { channelId } = body;

    if (!channelId) {
      console.error(`[${new Date().toISOString()}] channelId is not defined. Request ID: ${req}`);
      return NextResponse.json({ error: 'channelId is required' }, { status: 400 });
    }

    //channelDetailResponse
    // 채널 상세정보를 가져오기 위한 API 호출
    const channelDetailResponse = await fetch(
      `${process.env.CHZZK_API_URL}/service/v1/channels/${channelId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
      },
    );

    const channelInfo = await channelDetailResponse.json();
    const channelContent = await channelInfo.content;

    //liveDetailResponse
    // 방송중인지 확인하기 위한 API 호출
    const liveDetailResponse = await fetch(
      `${process.env.CHZZK_API_URL}/polling/v2/channels/${channelId}/live-status`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    //streamer 방송중이지 않은 기본 타입
    let streamerInfo: StreamerInfo = {
      channel: channelContent,
      status: 'CLOSE',
      liveCategory: null,
      liveCategoryValue: null,
    };

    const data = await liveDetailResponse.json();

    //streamer 방송진행중일 때
    if (data.content) {
      const { status, liveCategory, liveCategoryValue } = await data.content;
      console.log('[DEBUG] liveDetail:', streamerInfo);
      streamerInfo = {
        status,
        channel: channelContent,
        liveCategory,
        liveCategoryValue,
      };
    }

    return NextResponse.json({ streamerInfo }, { status: 200 });
  } catch (error: any) {
    console.error('🔥 Error fetching streamer info:', error);
    console.error('🔥 Error type:', typeof error, '| message:', error?.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
