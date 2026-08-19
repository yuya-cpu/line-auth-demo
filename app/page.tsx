import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LoginButton, LogoutButton } from "./login-button";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-white px-6">
      <main className="flex flex-col items-center">
        {session?.user ? (
          <div className="flex flex-col items-center gap-4">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt=""
                className="h-14 w-14 rounded-full"
              />
            ) : null}
            <p className="text-base font-medium text-zinc-950">
              {session.user.name}
            </p>
            <LogoutButton />
          </div>
        ) : (
          <LoginButton />
        )}
      </main>
    </div>
  );
}
