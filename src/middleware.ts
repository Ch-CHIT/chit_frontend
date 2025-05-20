import { NextRequest, NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
//
export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('REFRESH_TOKEN');
  const role = request.cookies.get('CH_ROLE');

  console.log('middleware');
  console.log(request.nextUrl.pathname);

  let hasCookie = false;

  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  console.log('segments');
  console.log(segments);
  if (cookie?.value && cookie?.value.length >= 0) {
    hasCookie = true;
  }

  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/assets/') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/.well-known/')
  ) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.includes('login') || request.nextUrl.pathname.endsWith('callback')) {
    return NextResponse.next();
  }
  console.log('middleware2');
  console.log(segments);
  // 스트리머에서 sign-in요청시 리다이렉트를 스트리머 페이지로 보냅니다.
  if (!hasCookie) {
    console.log('Redirect발동');
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    const responseWithCookie = NextResponse.redirect(redirectUrl);
    if (!role) {
      if (segments.includes('streamer') && segments.length <= 1) {
        responseWithCookie.cookies.set('CH_ROLE', 'STREAMER', {
          path: '/',
          maxAge: 60 * 60 * 24, // 1일
          secure: false, // ⚠️ 프로덕션에서는 반드시 true
          httpOnly: false,
          sameSite: 'lax',
        });
      } else {
        responseWithCookie.cookies.set('CH_ROLE', 'VIEWER', {
          path: '/',
          maxAge: 60 * 60 * 24, // 1일
          secure: false, // ⚠️ 프로덕션에서는 반드시 true
          httpOnly: false,
          sameSite: 'lax',
        });
      }
      return responseWithCookie;
    }

    if (segments.includes('streamer') || segments.length <= 1) {
      return NextResponse.redirect(redirectUrl);
    } else if (!request.nextUrl.pathname.startsWith('/streamer') && segments.length >= 2) {
      const channelId = segments[0];
      const sessionCode = segments[1];

      return NextResponse.redirect(new URL(`/${channelId}/${sessionCode}`, request.url));
    }
  }
  return NextResponse.next();
}
export const config = {
  matcher: ['/streamer/:path*', '/:channelId/:sessionCode/:path*'],
};
