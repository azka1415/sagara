import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import * as argon2 from "argon2";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session {
		//@ts-ignore
		user: {
			id: string;
			// ...other properties
			// role: UserRole;
		} & Session["user"];
	}

	// interface User {
	// 	// ...other properties
	// 	// role: UserRole;
	// }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	callbacks: {
		session({ session, token }) {
			session.user.id = token.id;
			return session;
		},
		jwt({ token, account, user }) {
			if (account) {
				token.accesToken = account.access_token;
				token.id = user.id;
			}
			return token;
		},
	},
	pages: {
		signIn: "/auth/signin",
		error: "/auth/error",
	},
	adapter: PrismaAdapter(prisma),
	providers: [
		GoogleProvider({
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		}),
		CredentialsProvider({
			name: "Email Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "text",
					placeholder: "JohnDoe@somewhere.com",
				},
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.password) return null;
				if (!credentials?.email) return null;
				const res = await prisma.user.findFirst({
					where: {
						email: credentials.email,
					},
				});

				if (!res) throw new Error("Account-not-found");

				if (!res.password)
					throw new Error("Your-account-does-not-have-a-password-yet");

				const match = argon2.verify(res.password, credentials.password);
				if (!match) return null;
				return res;
			},
		}),
		/**
		 * ...add more providers here.
		 *
		 * Most other providers require a bit more work than the Discord provider. For example, the
		 * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
		 * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
		 *
		 * @see https://next-auth.js.org/providers/github
		 */
	],
	session: {
		strategy: "jwt",
	},
	secret: env.JWT_SECRET,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
	req: GetServerSidePropsContext["req"];
	res: GetServerSidePropsContext["res"];
}) => {
	return getServerSession(ctx.req, ctx.res, authOptions);
};
