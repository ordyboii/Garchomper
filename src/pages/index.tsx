import { signIn, signOut, useSession } from "next-auth/react";

const FileCard = () => {
  return (
    <article className='bg-white border border-gray-300'>
      <div className='px-4 py-3 border-b border-gray-300'>
        <h2 className='font-semibold'>Hello Test file</h2>
      </div>
      <div>
        <img src='' alt='Preview area' />
      </div>
    </article>
  );
};

export default function Index() {
  const { data: session } = useSession();

  return (
    <main className='text-2xl min-h-screen bg-gray-100'>
      {!session && (
        <section>
          <p>Please Sign In</p>
          <button onClick={() => signIn("google")}>Sign In</button>
        </section>
      )}

      {session && (
        <>
          <header className='flex items-center justify-between px-5 py-3 bg-purple-400 text-white'>
            {session.user?.image && (
              <div className='flex items-center gap-2'>
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className='w-12 h-12 rounded-full'
                />
                <p className='text-md font-bold'>{session.user.name}</p>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className='text-sm font-bold bg-purple-600 px-3 py-2 rounded-sm transition hover:bg-purple-700'
            >
              Sign Out
            </button>
          </header>
          <section className='p-4 grid grid-cols-4 gap-4'>
            {Array(20)
              .fill([])
              .map((file, idx) => (
                <FileCard key={idx} />
              ))}
          </section>
        </>
      )}
    </main>
  );
}
