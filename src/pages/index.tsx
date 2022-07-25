import { GetServerSideProps } from "next";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { getGarchomperAuth } from "@/server/auth";
import { useDropzone } from "react-dropzone";
import { FaGoogle } from "react-icons/fa";
import { HiCloud, HiExternalLink } from "react-icons/hi";

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getGarchomperAuth(ctx);

  if (!session) {
    return { props: {} };
  }

  return { props: { session } };
};

const FileCard = () => {
  return (
    <article className='bg-white border border-gray-300'>
      <div className='flex items-center justify-between px-4 py-3 border-b border-gray-300'>
        <h2 className='font-semibold'>Hello Test file</h2>
        <a href='#' className='p-2 rounded hover:bg-gray-100'>
          <HiExternalLink className='w-6 h-6' />
        </a>
      </div>
      <img
        src='https://images.unsplash.com/photo-1658237242655-c7b39d02ba59'
        alt='Preview area'
        className='object-cover'
      />
    </article>
  );
};

type File = {
  name: string;
  type: string;
  preview: string;
};

type DropzoneProps = {
  setFiles: Dispatch<SetStateAction<File[]>>;
};

const Dropzone = ({ setFiles }: DropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [], "application/pdf": [".pdf"] },
    onDrop: acceptedFiles => {
      setFiles(
        acceptedFiles.map(file => {
          return {
            name: file.name,
            type: file.type,
            preview: URL.createObjectURL(file)
          };
        })
      );
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-1 w-full p-4 justify-center bg-purple-800 border-2 border-dashed 
    border-purple-400 sm:w-fit ${isDragActive && "opacity-60"}`}
    >
      <input {...getInputProps()} />
      {isDragActive && <p>Drop the files here ...</p>}
      {!isDragActive && (
        <div className='flex flex-col text-center gap-2 items-center sm:flex-row sm:text-left'>
          <HiCloud className='w-6 h-6' />
          <p>Drag and drop some image or pdf files here, or select files</p>
        </div>
      )}
    </div>
  );
};

type PreviewFileProps = {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
};

const PreviewFiles = ({ files, setFiles }: PreviewFileProps) => {
  const deleteFile = (name: string) => {
    setFiles(files.filter(file => file.name !== name));
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <section className='space-y-4 bg-white m-4 border p-4'>
      <h2 className='text-xl font-bold'>Preview Files</h2>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4'>
        {files.map(file => (
          <div key={file.name}>
            {file.type.includes("image") && (
              <>
                <img src={file.preview} alt={file.name} />
                <button
                  onClick={() => deleteFile(file.name)}
                  className='px-2 py-1 rounded bg-red-600 text-white'
                >
                  X
                </button>
              </>
            )}

            {file.type.includes("pdf") && (
              <>
                <button
                  onClick={() => window.open(file.preview)}
                  className='underline text-purple-600 font-bold'
                >
                  Preview PDF
                </button>
                <button
                  onClick={() => deleteFile(file.name)}
                  className='px-2 py-1 rounded bg-red-600 text-white'
                >
                  X
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <button>Upload</button>
    </section>
  );
};

export default function Index() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <main className='min-h-screen bg-gray-100'>
      {!session && (
        <section className='h-screen grid place-content-center'>
          <div className='bg-white border border-gray-300 p-12 space-y-4'>
            <h1 className='font-bold text-4xl'>Garchomper</h1>
            <p>A way to share notes and files</p>
            <button
              onClick={() => signIn("google")}
              className='flex gap-3 items-center px-4 py-3 font-semibold bg-purple-600 text-white
              rounded hover:bg-purple-700'
            >
              <FaGoogle />
              Sign In With Google
            </button>
          </div>
        </section>
      )}

      {session && (
        <>
          <header
            className='flex flex-col items-start gap-4 justify-between px-5 py-3 bg-purple-600 text-white 
            sm:flex-row sm:items-center sm:gap-10'
          >
            {session.user?.image && session.user.name && (
              <div className='flex items-center gap-2'>
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className='w-12 h-12 rounded-full'
                />
                <p className='text-md font-bold'>{session.user.name}</p>
              </div>
            )}
            <Dropzone setFiles={setFiles} />
            <button
              onClick={() => signOut()}
              className='text-sm w-full font-bold bg-purple-800 px-3 py-2 rounded-sm transition 
              hover:bg-purple-900 sm:w-fit'
            >
              Sign Out
            </button>
          </header>

          <PreviewFiles files={files} setFiles={setFiles} />

          <section className='p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
            {Array(15)
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
