/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { Octokit } from "octokit";

/**
 * Get the github access token
 */

export const getGithubToken = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
    select: {
      accessToken: true,
    },
  });

  if (!account?.accessToken) {
    throw new Error("No github access token found");
  }

  return account.accessToken;
};

export const fetchUserContribution = async (
  token: string,
  username: string
) => {
  const octokit = new Octokit({
    auth: token,
  });

  const query = `
  query($username: String!){
    user(login:$username){
      contributionCollection {
        contributionCalender{
          totalContributions
            weeks{
              contributionDays{
                contributionCount
                data
                color 
              }
            }
        }
      }
    }
  }`;

  type ContributionData = {
    user: {
      contributionCollection: {
        contributionCalender: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              contributionCount: number;
              data: string | Date;
              color: string;
            };
          };
        };
      };
    };
  };

  try {
    const response: any = await octokit.graphql(query, {
      username,
    });

    return response.user.contributionCollection.contributionCalender;
  } catch (error) {
    console.error(error);
  }
};

export const getRepositories = async (
  page: number = 1,
  perPage: number = 10
) => {
  const token = await getGithubToken();

  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    per_page: perPage,
    page,
  });

  return data;
};

export const createWebhook = async (owner: string, repo: string) => {
  const token = await getGithubToken();
  const octokit = new Octokit({
    auth: token,
  });

  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/github`;

  const { data: hooks } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });

  const existingHook = hooks.find((hook) => hook.config.url === webhookUrl);

  if (existingHook) {
    return existingHook;
  }

  const { data } = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type: "json",
    },
    events: ["pull_request"],
  });

  return data;
};

export const getRepoFiles = async (
  token: string,
  owner: string,
  repo: string,
  path: string = ""
): Promise<{ path: string; content: string }[]> => {
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  if (!Array.isArray(data)) {
    if (data.type === "file" && data.content) {
      return [
        {
          path: data.path,
          content: Buffer.from(data.content, "base64").toString("utf-8"),
        },
      ];
    }
    return [];
  }

  let files: { path: string; content: string }[] = [];

  for (const item of data) {
    if (item.type === "file") {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: item.path,
      });

      if (
        !Array.isArray(fileData) &&
        fileData.type === "file" &&
        fileData.content
      ) {
        if (!item.path.match(/\.(png|jpg|svg|io|pdf|zip)$/i)) {
          files.push({
            path: item.path,
            content: Buffer.from(fileData.content, "base64").toString("utf-8"),
          });
        }
      }
    } else if (item.type === "dir") {
      const subfiles = await getRepoFiles(token, owner, repo, item.path);

      files = files.concat(subfiles);
    }
  }

  return files;
};

export const getPullReqDiff = async (
  token: string,
  owner: string,
  repo: string,
  prN: number
) => {
  const octokit = new Octokit({ auth: token });

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prN,
  });

  const { data: diff } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prN,
    mediaType: {
      format: "diff",
    },
  });

  return {
    diff: diff as unknown as string,
    title: pr.title,
    description: pr.body || "",
  };
};


export const postReviewComment = async (
  token: string,
  owner: string,
  repo: string,
  prN: number,
  review: string
) => {
   const octokit = new Octokit({ auth: token });

   await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prN,
    body: `AI code review\n\n${review}\n\nPowered by your effort`
   })
}