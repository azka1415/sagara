import { z } from "zod";
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from "~/server/api/trpc";
import * as argon2 from "argon2";
import nodemailer from "nodemailer";
import { generatePassword } from "~/utils/api";
import { env } from "~/env.mjs";
export const userRouter = createTRPCRouter({
	hello: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.text}`,
			};
		}),

	getUser: protectedProcedure.query(async ({ ctx }) => {
		const user = ctx.prisma.user.findFirst({
			where: {
				id: ctx.session.user.id,
			},
		});

		return user;
	}),

	verifyEmail: protectedProcedure
		.input(
			z.object({
				authCode: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.prisma.user.findFirst({
				where: {
					id: ctx.session.user.id,
				},
			});
			if (!user) throw new Error("user not found");
			if (!user.authCode) throw new Error("No auth code available");
			const match = await argon2.verify(user.authCode, input.authCode);
			if (!match) throw new Error("wrong auth code");
			await ctx.prisma.user.update({
				where: {
					id: ctx.session.user.id,
				},
				data: {
					emailVerified: new Date(),
					authCode: null,
				},
			});
		}),

	getCode: protectedProcedure
		.input(
			z.object({
				email: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const authCode = generatePassword();
			const transport = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: env.NODE_MAILER_EMAIL,
					pass: env.NODE_MAILER_PASSWORD,
				},
			});
			transport.sendMail({
				from: "azka.noreply",
				to: input.email,
				subject: "Verify Email Auth Code",
				text: `your auth code: ${authCode}`,
			});
			const hashCode = await argon2.hash(authCode);
			await ctx.prisma.user.update({
				where: {
					id: ctx.session.user.id,
				},
				data: {
					authCode: hashCode,
				},
			});
			return authCode;
		}),

	createUser: publicProcedure
		.input(
			z.object({
				email: z.string(),
				password: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const old = await ctx.prisma.user.findFirst({
				where: {
					email: input.email,
				},
			});
			if (old) throw new Error("Account exist");
			const hashPass = await argon2.hash(input.password);
			await ctx.prisma.user.create({
				data: {
					email: input.email,
					password: hashPass,
				},
			});
		}),
	generatePassword: publicProcedure
		.input(
			z.object({
				email: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const user = ctx.prisma.user.findFirst({
				where: {
					email: input.email,
				},
			});
			if (!user) throw new Error("User not found");
			const transport = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: env.NODE_MAILER_EMAIL,
					pass: env.NODE_MAILER_PASSWORD,
				},
			});
			const newPass = generatePassword();
			const newHash = await argon2.hash(newPass);
			await ctx.prisma.user.update({
				where: {
					email: input.email,
				},
				data: {
					password: newHash,
				},
			});
			transport.sendMail({
				from: "azka.noreply",
				to: input.email,
				subject: "New password",
				text: `your new password: ${newPass}`,
			});
		}),

	setPassword: protectedProcedure
		.input(
			z.object({
				password: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const hashPass = await argon2.hash(input.password);
			await ctx.prisma.user.update({
				where: {
					id: ctx.session.user.id,
				},
				data: {
					password: hashPass,
				},
			});
		}),

	editPassword: protectedProcedure
		.input(
			z.object({
				oldPassword: z.string(),
				newPassword: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.prisma.user.findFirst({
				where: {
					id: ctx.session.user.id,
				},
			});

			if (!user?.password) throw new Error("No Old Password");

			const match = await argon2.verify(user.password, input.oldPassword);
			if (!match) throw new Error("incorrect old password");
			const newHash = await argon2.hash(input.newPassword);

			await ctx.prisma.user.update({
				where: {
					id: ctx.session.user.id,
				},
				data: {
					password: newHash,
				},
			});
		}),

	getSecretMessage: protectedProcedure.query(() => {
		return "you can now see this secret message!";
	}),
});
