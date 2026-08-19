"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function LoginButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setError(null);
          setPending(true);
          const { data, error: signInError } = await authClient.signIn.social({
            provider: "line",
            callbackURL: "/",
            disableRedirect: true,
          });

          if (signInError) {
            setError(signInError.message || "ログインを開始できませんでした");
            setPending(false);
            return;
          }

          if (data?.url) {
            window.location.assign(data.url);
            return;
          }

          setError("LINEへの遷移URLを取得できませんでした");
          setPending(false);
        }}
        className="inline-flex h-12 items-center justify-center rounded-full bg-[#06C755] px-6 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "LINEへ移動中..." : "LINEでログイン"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
