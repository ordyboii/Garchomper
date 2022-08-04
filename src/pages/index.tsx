import { GetServerSidePropsContext } from "next";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { getGarchomperAuth } from "@/server/auth";
import { useDropzone } from "react-dropzone";
import { FaGoogle } from "react-icons/fa";
import { HiCloud, HiExternalLink, HiTrash } from "react-icons/hi";
import { InferQueryOutput, trpc } from "@/utils/trpc";
import toast from "react-hot-toast";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
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
          <p>
            Drag and drop some image or pdf files here, or select files (max
            size: 1mb)
          </p>
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

  const { mutate: uploadFiles } = trpc.useMutation(["upload-files"], {
    onSuccess: () => ctx.invalidateQueries(["get-all-files"])
  });

  const deleteFile = (name: string) => {
    setFiles(files.filter(file => file.name !== name));
  };

  const handleUpload = () => {
    const toastId = toast.loading("Uploading files...");

    uploadFiles(
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
            {file.type === "IMAGE" && (
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

            {file.type === "PDF" && (
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
      <button onClick={handleUpload}>Upload</button>
    </section>
  );
}

type FileProps = {
  file: InferQueryOutput<"get-all-files">[0];
};

function FileCard({ file }: FileProps) {
  return (
    <article className='bg-white border border-gray-300'>
      <div className='flex items-center justify-between px-4 py-3 border-b border-gray-300'>
        <h2 className='font-semibold'>{file.name}</h2>
        <div className='flex gap-2'>
          <button className='p-2 rounded hover:bg-gray-100'>
            <HiTrash className='w-6 h-6' />
          </button>
          <a href='#' className='p-2 rounded hover:bg-gray-100'>
            <HiExternalLink className='w-6 h-6' />
          </a>
        </div>
      </div>

      {file.type === "IMAGE" && (
        <img
          src={file.content}
          alt={file.name}
          className='object-cover max-h-64 w-full'
        />
      )}
      {file.type === "PDF" && (
        <iframe
          title={file.name}
          className='w-full h-full'
          src={file.content}
        />
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
            {isLoading && <p>Loading...</p>}
            {allFiles?.map((file, idx) => (
              <FileCard key={idx} file={file} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}
