/* eslint-disable @typescript-eslint/no-explicit-any */
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
  }

  try {
    const response: any = await octokit.graphql(query, {
      username,
    });

    return response.user.contributionCollection.contributionCalender;
  } catch (error) {
    console.error(error);
  }
};
