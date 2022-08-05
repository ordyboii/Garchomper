import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

type Props = {
  fileId: string;
};

function FileEmbed({ fileId }: Props) {
  const { data, isLoading } = trpc.useQuery(["get-file-by-id", { id: fileId }]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <main className='flex flex-col'>
      {data?.type === "IMAGE" && <img src={data.content} alt={data.name} />}
      {data?.type === "PDF" && (
        <iframe
          title={data.name}
          className='w-screen h-screen'
          src={data.content}
        />
      )}
    </main>
  );
}

export default function FileEmbedPage() {
  const { query } = useRouter();

  if (!query.fileId || typeof query.fileId !== "string") {
    return <p className='text-4xl text-red-500'>Error 400: Wrong Url link</p>;
  }

  return <FileEmbed fileId={query.fileId} />;
}
