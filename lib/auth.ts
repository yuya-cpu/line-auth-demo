import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware } from "better-auth/api";
import { upsertLineUser } from "@/lib/line-users";

function appUrl() {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

const baseURL = appUrl();

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    baseURL,
    "http://localhost:3000",
    "http://localhost:3001",
    "https://line-auth-demo.vercel.app",
    "https://line-auth-demo*.vercel.app",
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7,
      strategy: "jwe",
      refreshCache: true,
    },
  },
  account: {
    storeStateStrategy: "cookie",
    storeAccountCookie: true,
  },
  socialProviders: {
    line: {
      clientId: process.env.LINE_CLIENT_ID as string,
      clientSecret: process.env.LINE_CLIENT_SECRET as string,
      disableDefaultScope: true,
      scope: ["openid", "profile"],
      mapProfileToUser: (profile) => ({
        email: `${profile.sub}@line.invalid`,
        name: profile.name ?? "LINE User",
        image: profile.picture,
      }),
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const provider = ctx.params?.id;
      const isLineCallback =
        ctx.path === "/callback/:id" ||
        ctx.path.startsWith("/callback/line") ||
        provider === "line";
      if (!isLineCallback) return;
      if (provider && provider !== "line") return;

      const session = ctx.context.newSession;
      const name = session?.user?.name;
      const lineId = session?.user?.email?.replace(/@line\.invalid$/, "");
      if (!name || !lineId) {
        console.error("[line.users] skip: missing name or lineId", {
          path: ctx.path,
          provider,
          hasSession: Boolean(session),
        });
        return;
      }

      try {
        await upsertLineUser(lineId, name);
      } catch (error) {
        console.error("[line.users] upsert failed", error);
      }
    }),
  },
  plugins: [nextCookies()],
});
