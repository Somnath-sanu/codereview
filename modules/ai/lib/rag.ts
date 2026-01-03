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
  repoId: string,
  files: {
    path: string;
    content: string;
  }[]
) => {
  const vectors = [];

  for (const file of files) {
    const content = `File: ${file.path}\n\n${file.content}`;

    const truncatedContent = content.slice(0, 8000);

    try {
      const embedding = await generateEmbedding(truncatedContent);

      vectors.push({
        id: `${repoId}-${file.path.replace(/\//g, "_")}`,
        values: embedding,
        metadata: {
          repoId,
          path: file.path,
          content: truncatedContent,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  if (vectors.length > 0) {
    const batchSize = 100;

    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);

      await pineconeIndex.upsert(batch);
    }
  }
};

export const retriveContent = async (
  query: string,
  repoId: string,
  topK: number = 20
) => {
  const embedding = await generateEmbedding(query);

  const res = await pineconeIndex.query({
    vector: embedding,
    filter: { repoId },
    topK,
    includeMetadata: true,
  });

  return res.matches.map((m) => m.metadata?.content as string).filter(Boolean);
};
