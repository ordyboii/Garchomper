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
    <main>
      <section>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </section>
    </main>
  );
}

export default function FileEmbedPage() {
  const { query } = useRouter();

  if (!query.fileId || typeof query.fileId !== "string") {
    return null;
  }

  return <FileEmbed fileId={query.fileId} />;
}
