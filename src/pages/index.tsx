import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { getGarchomperAuth } from "@/server/auth";
import { useDropzone } from "react-dropzone";
import { FaGoogle } from "react-icons/fa";
import {
  HiClipboardCopy,
  HiCloud,
  HiDownload,
  HiEmojiSad,
  HiExternalLink,
  HiTrash
} from "react-icons/hi";
import { InferQueryOutput, trpc } from "@/utils/trpc";
import toast from "react-hot-toast";

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ session?: Session }>> {
  const session = await getGarchomperAuth(ctx);

  if (!session) {
    return { props: {} };
  }
  return { props: { session } };
}

type FileUpload = {
  name: string;
  type: "PDF" | "IMAGE";
  preview: string;
  content: string;
};

type DropzoneProps = {
  setFiles: Dispatch<SetStateAction<FileUpload[]>>;
};

function Dropzone({ setFiles }: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [], "application/pdf": [".pdf"] },
    onDrop: acceptedFiles => {
      acceptedFiles.forEach(file => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = ev => {
          setFiles(files => [
            ...files,
            {
              name: file.name,
              type: file.type.includes("pdf") ? "PDF" : "IMAGE",
              preview: URL.createObjectURL(file),
              content: reader.result as string
            }
          ]);
        };
      });
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
          <p>Drag/select any image or PDF files (max size: 1mb)</p>
        </div>
      )}
    </div>
  );
}

type PreviewFileProps = {
  files: FileUpload[];
  setFiles: Dispatch<SetStateAction<FileUpload[]>>;
};

function PreviewFiles({ files, setFiles }: PreviewFileProps) {
  const ctx = trpc.useContext();

  const { mutate, isLoading } = trpc.useMutation(["upload-files"], {
    onSuccess: () => ctx.invalidateQueries(["get-all-files"])
  });

  const deleteFile = (name: string) => {
    setFiles(files.filter(file => file.name !== name));
  };

  function uploadFiles() {
    const toastId = toast.loading("Uploading files...");
    mutate(
      files.map(file => ({
        content: file.content,
        name: file.name,
        type: file.type
      })),
      {
        onError: error => {
          toast.error(`Error uploading file ${error}`, { id: toastId });
        },
        onSuccess: () => {
          toast.success("Uploaded files", { id: toastId });
        }
      }
    );
    // Reset preview files
    setFiles([]);
  }

  if (files.length === 0) {
    return null;
  }

  return (
    <section className='space-y-4 bg-white m-4 border p-6'>
      <h2 className='text-xl font-bold'>Preview Files</h2>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4'>
        {files.map(file => (
          <div key={file.name}>
            <div className='bg-gray-100 p-4 rounded flex flex-col gap-4'>
              {file.type === "IMAGE" && (
                <img src={file.preview} alt={file.name} />
              )}

              {file.type === "PDF" && (
                <iframe
                  title={file.name}
                  className='w-full h-full'
                  src={file.content}
                />
              )}
              <button
                onClick={() => deleteFile(file.name)}
                className='px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700'
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        disabled={isLoading}
        onClick={uploadFiles}
        className='px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700'
      >
        Upload
      </button>
    </section>
  );
}

type FileProps = {
  file: InferQueryOutput<"get-all-files">[0];
};

function FileCard({ file }: FileProps) {
  const ctx = trpc.useContext();
  const { mutate, isLoading } = trpc.useMutation(["delete-file"], {
    onSuccess: () => ctx.invalidateQueries(["get-all-files"])
  });

  function deleteFile() {
    const toastId = toast.loading("Deleting file...");

    // Optimistic update
    ctx.setQueryData(
      ["get-all-files"],
      old => old?.filter(oldFile => oldFile.id !== file.id) as any
    );

    mutate(
      { id: file.id },
      {
        onError: error => {
          toast.error(`Error deleting file ${error}`, { id: toastId });
        },
        onSuccess: () => {
          toast.success("Deleted file", { id: toastId });
        }
      }
    );
  }

  function copyEmbedLink(fileId: string) {
    navigator.clipboard
      .writeText(`${location.origin}/embed/${fileId}`)
      .then(() => {
        toast.success("Copied embed link");
      });
  }

  return (
    <article className='bg-white flex flex-col border border-gray-300'>
      <div
        className='flex flex-col items-center justify-between px-4 py-3 border-b 
      border-gray-300 sm:flex-row'
      >
        <h2 className='font-semibold'>{file.name}</h2>
        <div className='flex gap-2'>
          <a
            href={file.content}
            download={file.name}
            className='p-2 rounded hover:bg-gray-100'
          >
            <HiDownload className='text-purple-600 w-6 h-6' />
          </a>

          <button
            onClick={deleteFile}
            disabled={isLoading}
            className='p-2 rounded hover:bg-gray-100'
          >
            <HiTrash className='text-purple-600 w-6 h-6' />
          </button>

          <button
            onClick={() => copyEmbedLink(file.id)}
            className='p-2 rounded hover:bg-gray-100'
          >
            <HiClipboardCopy className='text-purple-600 w-6 h-6' />
          </button>

          <a
            href={`/embed/${file.id}`}
            target='_blank'
            rel='noreferrer'
            className='p-2 rounded hover:bg-gray-100'
          >
            <HiExternalLink className='text-purple-600 w-6 h-6' />
          </a>
        </div>
      </div>

      {file.type === "IMAGE" && (
        <img
          src={file.content}
          alt={file.name}
          className='object-cover flex-1'
        />
      )}

      {file.type === "PDF" && (
        <iframe title={file.name} className='flex-1' src={file.content} />
      )}
    </article>
  );
}

export default function Index() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<FileUpload[]>([]);

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  const { data: allFiles, isLoading } = trpc.useQuery(["get-all-files"]);

  return (
    <main className='min-h-screen flex flex-col bg-gray-100'>
      {!session && (
        <section className='h-screen grid place-content-center'>
          <div className='bg-white flex flex-col items-center border border-gray-300 p-12 space-y-4'>
            <div className='-mt-24 w-24 h-24 rounded-full bg-purple-600 border border-gray-300'></div>
            <h1 className='font-bold text-4xl'>Garchomper</h1>
            <p className='text-lg'>
              An easier way to share notes and files between devices
            </p>
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
              <div className='hidden sm:flex sm:items-center sm:gap-2'>
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

          {isLoading && (
            <section className='bg-white m-4 p-4 border border-gray-300'>
              <h2 className='text-xl'>Loading files...</h2>
            </section>
          )}

          {allFiles?.length === 0 && (
            <section
              className='bg-white border border-gray-300 flex-1 flex items-center 
              justify-center p-4 m-4'
            >
              <h2 className='text-lg flex flex-col gap-3 items-center sm:flex-row sm:text-3xl'>
                <HiEmojiSad className='text-purple-500 w-12 h-12' /> It appears
                you have not uploaded any files yet.
              </h2>
            </section>
          )}

          {allFiles && allFiles.length > 0 && (
            <section className='p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
              {allFiles?.map((file, idx) => (
                <FileCard key={idx} file={file} />
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
