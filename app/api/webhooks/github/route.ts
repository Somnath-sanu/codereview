import { reviewPullReq } from "@/app/api/webhooks/github/review";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = req.headers.get("x-github-event");
    console.log({ event });

    if (event === "ping") {
      return NextResponse.json(
        {
          message: "Pong",
        },
        {
          status: 200,
        }
      );
    }

    if (event === "pull_request") {
      const action = body.action;
      const repo = body.repository.full_name;
      const prN = body.number;

      const [owner, repoName] = repo.split("/");

      console.log({ action });

      if (action === "opened" || action === "synchronize") {
        try {
          await reviewPullReq(owner, repoName, prN);
        } catch (error) {
          console.error(error);
        }
      }
    }

    return NextResponse.json(
      {
        message: "Event Processeed",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
