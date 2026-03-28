import { embed } from "ai";
import { google } from "@ai-sdk/google";
import { pineconeIndex } from "@/lib/pinecone";

export const generateEmbedding = async (text: string) => {
  const { embedding } = await embed({
    model: google.embeddingModel("text-embedding-004"),
    value: text,
  });

  return embedding;
};

export const indexCodebase = async (
  repoId: string, // `Somnath-sanu/coderabbit`
  files: {
    path: string;
    content: string;
  }[]
) => {
  const namespace = pineconeIndex.namespace(repoId);

  // TODO: check whether this working or not
  const namespaces = await pineconeIndex.listNamespaces();
  const exists = namespaces.namespaces?.some(
    (ns) => ns.name === namespace.namespace.name
  );

  if (exists) {
    console.log("Namespace already exists, skipping indexing");
    return { message: "Namespace already exists, skipping indexing" };
  }

  const vectors = await Promise.all(
    files.map(async (file) => {
      const content = `File: ${file.path}\n\n${file.content}`.slice(0, 8000);

      try {
        const embedding = await generateEmbedding(content);

        return {
          id: `${repoId}:${file.path}`,
          values: embedding,
          metadata: {
            repoId,
            path: file.path,
          },
        };
      } catch {
        return null;
      }
    })
  );

  const validVectors = vectors.filter((v) => v != null).filter(Boolean);

  if (validVectors.length > 0) {
    const batchSize = 100;

    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = validVectors.slice(i, i + batchSize);
      await namespace.upsert(batch);
    }
  }

  return {
    message: "Indexing complete",
  };
};

export const retriveContent = async (
  query: string,
  repoId: string,
  topK: number = 20
) => {
  const embedding = await generateEmbedding(query);

  const res = await pineconeIndex.namespace(repoId).query({
    vector: embedding,
    filter: { repoId },
    topK,
    includeMetadata: true,
  });

  return res.matches
    .map((m) =>
      m.metadata?.content
        ? `File: ${m.metadata.path}\n${m.metadata.content}`
        : null
    )
    .filter(Boolean);
};
