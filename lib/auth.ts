import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { clientPromise } from './mongodb';
import bcrypt from 'bcryptjs';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('[next-auth] authorize called', { email: credentials?.email });

        if (!credentials?.email || !credentials?.password) {
          console.log('[next-auth] missing credentials');
          return null;
        }

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          console.log('[next-auth] user not found', { email: credentials.email });
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          console.log('[next-auth] invalid password for', { email: credentials.email });
          return null;
        }

        console.log('[next-auth] login success for', { email: credentials.email });
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the user id to the token right after signin
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      // Make sure session.user has all needed fields
      if (session.user) {
        (session.user as any).id = token.sub || token.id;
        (session.user as any).email = token.email;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  // Verificar se isso resolve o problema com o login que não reconhece a senha do usuário
  //secret: process.env.NEXTAUTH_SECRET,
};