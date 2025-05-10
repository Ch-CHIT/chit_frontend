import { StreamerInfo } from '@/services/streamer/type';
import { NextResponse } from 'next/server';

// POST 요청 처리
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { channelId } = body;
    console.log('post', channelId);
    if (!channelId) {
      return NextResponse.json({ error: 'channelId is required' }, { status: 400 });
    }
    const liveImage = await fetch(`${process.env.CHZZK_API_URL}/service/v1/channels/${channelId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const channelInfo = await liveImage.json();
    const channel = await channelInfo.content;
    const liveDetail = await fetch(
      `${process.env.CHZZK_API_URL}/polling/v2/channels/${channelId}/live-status`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const data = await liveDetail.json();
    console.log(data);
    if (data.content === null) {
      return NextResponse.json({ error: 'No live detail found' }, { status: 404 });
    }
    const { status, liveCategory, liveCategoryValue } = await data.content;
    if (!liveDetail) {
      return NextResponse.json({ error: 'No live detail found' }, { status: 404 });
    }
    console.log('[DEBUG] liveDetail:', liveDetail);

    const streamerInfo: StreamerInfo = {
      status,
      channel: channel,
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
