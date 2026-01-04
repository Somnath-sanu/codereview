import prisma from "@/lib/db";
import { inngest } from "./client";
import { NonRetriableError } from "inngest";
import {
  getRepoFiles,
} from "@/lib/github";
import { indexCodebase } from "@/lib/rag";
import { RepositoryStatus } from "@/lib/generated/prisma/enums";

export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    onFailure: async ({ event }) => {
      await prisma.repository.update({
        where: {
          githubId: BigInt(event.data.event.data.githubId),
        },
        data: {
          status: RepositoryStatus.Failed,
        },
      });
    },
  },
  { event: "repos.connected" },
  async ({ event, step }) => {
    const { owner, repo, userId, githubId } = event.data;

    // files
    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          providerId: "github",
        },
        select: {
          accessToken: true,
        },
      });

      if (!account?.accessToken) {
        throw new NonRetriableError("Access token not found");
      }

      return await getRepoFiles(account.accessToken, owner, repo);
    });

    const { message } = await step.run("index-codebase", async () => {
      return await indexCodebase(`${owner}/${repo}`, files);
    });

    await step.run("update-repo-status", async () => {
      await prisma.repository.update({
        where: {
          githubId: BigInt(githubId),
        },
        data: {
          status: RepositoryStatus.Indexed,
        },
      });
    });

    return {
      success: true,
      indexedFiles: files.length,
      message,
    };
  }
);
