export { auth as middleware } from './auth';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|$|home|login|register|oauth-callback).*)',
  ],
};
