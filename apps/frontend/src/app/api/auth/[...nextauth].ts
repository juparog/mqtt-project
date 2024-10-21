import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { IAuthResult } from '@kuiiksoft/common';

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // Do whatever you want here, before the request is passed down to `NextAuth`
  return await NextAuth(req, res, {
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email/Username', type: 'emailOrUsername' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          try {
            const response = await axios.post<IAuthResult>(
              `${process.env.API_URL}/auth/login`,
              {
                emailOrUsername: credentials?.email,
                password: credentials?.password,
              }
            );

            const authResult = response.data;

            if (authResult) {
              return {
                id: authResult.user.id,
                name: authResult.user.firstName,
                email: authResult.user.email,
                image: authResult.user.avatar,
                token: authResult.accessToken,
              };
            } else {
              return null;
            }
          } catch (error) {
            return null;
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.accessToken = token;
        }
        return token;
      },
      async session({ session, token, user }) {
        // Pasar el token de acceso a la sesión
        session.user = user;
        return session;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: '/auth/login',
    },
  });
}
