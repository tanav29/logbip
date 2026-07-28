import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

export const auth = betterAuth({
    appName: "LogBip",
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: { enabled: true },
    user: {
        additionalFields: {
            xAccount: { type: "string", required: false },
            avatar: { type: "string", required: false },
        },
    },
    plugins: [nextCookies()],
});
