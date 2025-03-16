import { IAuthResult } from '@kuiiksoft/common';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import NextAuth, { CredentialsSignin } from 'next-auth';
import { type DefaultJWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { LoginSchema } from './components/forms/login/schema';

declare module 'next-auth' {
  interface User {
    accessToken: string;
    refreshToken: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: {
      accessToken: string;
      refreshToken: string;
    } & DefaultJWT['user'];
  }
}

async function refreshToken(token: string) {
  const response = await axios.post<IAuthResult>(
    `${process.env.API_URL}/auth/refresh-token`,
    { token: token }
  );

  return {
    id: response.data.user.id,
    name: response.data.user.firstName,
    email: response.data.user.email,
    image: response.data.user.avatar,
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  };
}

function handlerAuthApiError(error: unknown, provider: string): Error {
  const messageError = error instanceof Error ? error.message : 'Error';
  console.error(`[${provider}.authorize] Error: ${messageError}`);
  if (
    error instanceof AxiosError &&
    error.status !== undefined &&
    (error.status === 401 || error.status === 403 || error.status === 404)
  ) {
    return new CredentialsSignin(messageError, { code: 'AccessDenied' });
  }
  return new Error(messageError);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email/Username', type: 'emailOrUsername' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = await LoginSchema.parseAsync(credentials);

          const response = await axios.post<IAuthResult>(
            `${process.env.API_URL}/auth/login`,
            {
              emailOrUsername: email,
              password: password,
            }
          );

          if (response.status !== 200) {
            throw new AxiosError('Invalid credentials', '401');
          }

          const authResult = response.data;

          if (authResult) {
            return {
              id: authResult.user.id,
              name: authResult.user.firstName,
              email: authResult.user.email,
              image: authResult.user.avatar,
              accessToken: authResult.accessToken,
              refreshToken: authResult.refreshToken,
            };
          } else {
            return null;
          }
        } catch (error) {
          throw handlerAuthApiError(error, 'Credentials');
        }
      },
    }),
    {
      id: 'oauth',
      name: 'Custom OAuth',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { code, codeVerifier } = credentials;
        try {
          const response = await axios.post(
            `${process.env.API_URL}/auth/exchange-code`,
            {
              code,
              codeVerifier: codeVerifier,
            }
          );

          if (response.data) {
            const { accessToken, refreshToken, user } = response.data;
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.avatar,
              accessToken,
              refreshToken,
            };
          }
          return null;
        } catch (error) {
          throw handlerAuthApiError(error, 'OAuth');
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }

      const apiTokenExpiresAt = jwtDecode(token.user.accessToken)?.exp || 0;
      if (new Date().getTime() < apiTokenExpiresAt * 1000) {
        return token;
      }

      token.user = await refreshToken(token.user.refreshToken);
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        ...token.user,
      };
      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
});
