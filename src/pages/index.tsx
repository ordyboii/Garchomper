import { signIn, signOut, useSession } from "next-auth/react";

export default function Index() {
  const { data: session } = useSession();

  return (
    <main className='text-2xl'>
      <h1>Garchomper - an image sharer </h1>

      {!session && (
        <section>
          <p>Please Sign In</p>
          <button onClick={() => signIn("google")}>Sign In</button>
        </section>
      )}

      {session && (
        <section>
          <p>Hello, {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </section>
      )}
    </main>
  );
}
