import { NextRequest, NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
//
export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('REFRESH_TOKEN');
  let hasCookie = false;
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);

  if (cookie?.value && cookie?.value.length >= 0) {
    hasCookie = true;
  }

  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 스트리머에서 sign-in요청시 리다이렉트를 스트리머 페이지로 보냅니다.
  // if (!hasCookie) {
  //   console.log('Redirect발동');
  //   if (request.nextUrl.pathname.startsWith('/streamer')) {
  //     return NextResponse.redirect(new URL('/', request.url));
  //   } else if (!request.nextUrl.pathname.startsWith('/streamer') && segments.length >= 3) {
  //     const channelId = segments[0];
  //     const sessionCode = segments[1];

  //     return NextResponse.redirect(new URL(`/${channelId}/${sessionCode}`, request.url));
  //   }
  // }
  return NextResponse.next();
}
export const config = {
  matcher: ['/streamer/:path*', '/:channelId/:sessionCode/:path*'],
};
