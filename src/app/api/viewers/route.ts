import { ParticipantResponseType, ViewerStatus } from '@/store/sseStore';
import { NextResponse } from 'next/server';

const totalViewers = 500;

const generateViewers = (page: number, limit: number): ParticipantResponseType[] => {
  const start = (page - 1) * limit;
  return Array.from({ length: limit }, (_, i) => ({
    status: ViewerStatus.JOINED,
    isReadyToPlay: true,
    participantId: start + i + 1,
    viewerId: start + i + 1,
    round: Math.floor(i % 2) + 2,
    gameNickname: `Viewer ${start + i + 1}`,
    chzzkNickname: `치지직유저 ${start + i + 1}`,
    fixedPick: false,
    order: start + i + 1,
  }));
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = 20;

  const viewers = generateViewers(page, limit);
  const nextPage = page * limit < totalViewers ? page + 1 : null;

  return NextResponse.json({ viewers, nextPage });
}
