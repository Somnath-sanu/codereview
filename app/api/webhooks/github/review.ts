"use server";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";

export const reviewPullReq = async (
  owner: string,
  repo: string,
  prN: number
) => {
  try {
    const repository = await prisma.repository.findFirst({
      where: {
        owner,
        name: repo,
      },
      include: {
        user: {
          include: {
            accounts: {
              where: {
                providerId: "github",
              },
              select: {
                accessToken: true,
              },
            },
          },
        },
      },
    });

    if (!repository) {
      throw new Error("repository not found");
    }

    const { accessToken } = repository.user.accounts[0];

    if (!accessToken) {
      throw new Error("token not found");
    }

    await inngest.send({
      name: "pr.review.requested",
      data: {
        owner,
        repo,
        prNumber: prN,
        userId: repository.userId,
      },
    });
  } catch (error) {
    console.error(error);
  }
};
