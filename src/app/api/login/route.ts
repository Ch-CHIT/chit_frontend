import { NextRequest, NextResponse } from 'next/server';
import { AUTH_URLS } from '@/constants/urls';

//login 시
export const POST = async (req: NextRequest): Promise<Response> => {
  const { code, state } = await req.json();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    console.error(`[${new Date().toISOString()}] API URL is not defined. Request ID: ${req}`);

    return new Response('API URL is not defined.', { status: 400 });
  }

  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + AUTH_URLS.login, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, state }),
    credentials: 'include',
  });
  console.log('response');
  console.log(response);
  return response;
};

//로그아웃 시 쿠키 삭제를 위한 api
export const GET = async () => {
  const response = new NextResponse(null, { status: 200 });
  response.cookies.set('REFRESH_TOKEN', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0),
  });
  return response;
};
