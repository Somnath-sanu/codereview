"use server";

import { inngest } from "@/inngest/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  createWebhook,
  getRepositories,
  removeWebhook,
} from "@/lib/github";
import { headers } from "next/headers";

export const fetchRepos = async (page: number = 1, perPage: number = 10) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const githubRepos = await getRepositories(page, perPage);

  const dbRepos = await prisma.repository.findMany({
    where: {
      userId: session.user.id,
    },
  });

  const connectedRepoIds = new Set(dbRepos.map((repo) => repo.githubId));

  const nonDbRepos = githubRepos.filter(
    (repo) => !connectedRepoIds.has(BigInt(repo.id))
  );

  return nonDbRepos;
};

export const connectRepository = async (
  owner: string,
  repo: string,
  githubId: number
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const webhook = await createWebhook(owner, repo);

  if (webhook) {
    await prisma.repository.create({
      data: {
        githubId: BigInt(githubId),
        name: repo,
        owner,
        fullName: `${owner}/${repo}`,
        url: `https://github.com/${owner}/${repo}`,
        userId: session.user.id,
      },
    });
  }

  try {
    await inngest.send({
      name: "repos.connected",
      data: {
        githubId,
        owner,
        repo,
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.error(error);
  }

  return webhook;
};

export const disconnectRepository = async (
  owner: string,
  repo: string,
  githubId: number
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await Promise.all([
    prisma.repository.deleteMany({
      where: {
        githubId: BigInt(githubId),
        userId: session.user.id,
      },
    }),
    await removeWebhook(owner, repo),
  ]);

  return {
    success: true,
  };
};
