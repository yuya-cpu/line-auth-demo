"use client";

import { authClient } from "@/lib/auth-client";

export function LoginButton() {
  return (
    <button
      type="button"
      onClick={() =>
        authClient.signIn.social({
          provider: "line",
          callbackURL: "/",
        })
      }
      className="inline-flex h-12 items-center justify-center rounded-full bg-[#06C755] px-6 text-base font-bold text-white transition-opacity hover:opacity-90"
    >
      LINEでログイン
    </button>
  );
}
