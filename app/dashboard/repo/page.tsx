/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useConnectRepo } from "@/modules/repo/hooks/use-connect-repo";
import { useRepositories } from "@/modules/repo/hooks/use-repo";
import { ExternalLinkIcon } from "lucide-react";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  isConnected?: boolean;
}

const RepoPage = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const allRepos = data?.pages.flatMap((page) => page) || [];

  const connectRepo = useConnectRepo();

  const handleConnnect = (repo: any) => {
    connectRepo.mutate(
      {
        owner: repo.full_name.split("/")[0],
        repo: repo.name,
        githubId: repo.id,
      },
      {
        onSettled: () => {},
      }
    );
  };

  return (
    <div>
      <div className="grid gap-4">
        {allRepos.map((repo) => (
          <Card key={repo.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    <Badge variant={"outline"}>
                      {repo.language || "Unknown"}
                    </Badge>
                    {repo.isConnected && (
                      <Badge variant={"secondary"}>Connected</Badge>
                    )}
                  </div>
                  <CardDescription>{repo.description}</CardDescription>
                </div>

                <div className="flex gap-2">
                  <Button variant={"ghost"} asChild>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLinkIcon className="size-4" />
                    </a>
                  </Button>

                  <Button onClick={() => handleConnnect(repo)}>
                    {repo.isConnected ? "Connected" : "Not connected"}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RepoPage;
