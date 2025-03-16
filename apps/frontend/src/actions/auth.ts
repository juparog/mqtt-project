'use server';

import { redirect } from 'next/navigation';
import { auth } from '../auth';

export const onAuthenticatedUser = async () => {
  try {
    const session = await auth();
    if (!session?.user) return { status: 404 };
    return {
      status: 200,
      user: session.user,
    };
  } catch (error) {
    console.error(error);
    return { status: 400 };
  }
};

export const redirectGoogleOAuth = (options: {
  callbackUrl: string;
  redirectUrl: string;
  codeChallenge: string;
}) => {
  const url = `${process.env.API_URL}/auth/google?callbackUrl=${options.callbackUrl}&redirectUrl=${options.redirectUrl}&codeChallenge=${options.codeChallenge}`;
  redirect(url);
};
