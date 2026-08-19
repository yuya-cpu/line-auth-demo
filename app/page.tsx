import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LoginButton } from "./login-button";
import { LogoutButton } from "./logout-button";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-6">
      <main className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          LINE ログイン
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          better-auth の LINE プロバイダでサインインするデモです。
        </p>

        {session?.user ? (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-12 w-12 rounded-full"
                />
              ) : null}
              <div>
                <p className="font-medium text-zinc-950">{session.user.name}</p>
                <p className="text-xs text-zinc-500">ログイン中</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        ) : (
          <div className="mt-8">
            <LoginButton />
          </div>
        )}
      </main>
    </div>
  );
}
