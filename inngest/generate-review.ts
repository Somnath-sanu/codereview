import prisma from "@/lib/db";
import { inngest } from "./client";
import { NonRetriableError } from "inngest";
import {
  getPullReqDiff,
  postReviewComment,
  updatePullRequestDescription,
} from "@/lib/github";
import { retriveContent } from "@/lib/rag";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { generateReviewPrompt } from "@/inngest/prompts";

export const generateReview = inngest.createFunction(
  { id: "generate-review" },
  { event: "pr.review.requested" },

  async ({ event, step }) => {
    const { owner, repo, prNumber, userId } = event.data;

    const { diff, title, description, token } = await step.run(
      "fetch-pr-data",
      async () => {
        const account = await prisma.account.findFirst({
          where: {
            userId: userId,
            providerId: "github",
          },
        });

        if (!account?.accessToken) {
          throw new NonRetriableError("No GitHub access token found");
        }

        const data = await getPullReqDiff(
          account.accessToken,
          owner,
          repo,
          prNumber
        );
        return { ...data, token: account.accessToken };
      }
    );

    const context = await step.run("retrieve-context", async () => {
      const query = `${title}\n${description}`;

      return await retriveContent(query, `${owner}/${repo}`);
    });

    const effectiveDescription =
      description?.trim().length > 0
        ? description
        : await step.run("generate-and-update-pr-description", async () => {
            const { text } = await generateText({
              model: google("gemini-2.5-flash"),
              prompt: `
You are an experienced software engineer.
Based ONLY on the following git diff, write a high-quality Pull Request description, short and clear.

Follow best practices:
- Clear summary
- Clear motivation
- What changed
- Any dependencies added

Diff:
\`\`\`diff
${diff}
\`\`\`
`,
            });

            await updatePullRequestDescription(
              token,
              owner,
              repo,
              prNumber,
              text
            );

            return text;
          });

    const review = await step.run("generate-ai-review", async () => {
      const repository = await prisma.repository.findFirst({
        where: {
          owner,
          name: repo,
        },
      });

      const theme = repository?.codeReviewTheme || "Standard";
      const personality = repository?.codeReviewPersonality || "Professional";

      const prompt = generateReviewPrompt(
        title,
        effectiveDescription,
        context.filter(Boolean) as string[],
        diff,
        theme,
        personality
      );

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt,
      });

      return text;
    });

    await step.run("post-comment", async () => {
      await postReviewComment(token, owner, repo, prNumber, review);
    });

    await step.run("save-review", async () => {
      const repository = await prisma.repository.findFirst({
        where: {
          owner,
          name: repo,
        },
      });

      if (repository) {
        await prisma.review.create({
          data: {
            repositoryId: repository.id,
            prNumber,
            prTitle: title,
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            review,
            status: "completed",
          },
        });
      }
    });
    return { success: true };
  }
);
