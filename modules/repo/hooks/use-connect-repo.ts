"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { connectRepository } from "../actions";
import { toast } from "sonner";

export const useConnectRepo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      repo,
      githubId,
    }: {
      owner: string;
      repo: string;
      githubId: number;
    }) => {
      return await connectRepository(owner, repo, githubId);
    },
    onSuccess: () => {
      toast.success("Repo connected!");
      queryClient.invalidateQueries({
        queryKey: ["repositories"],
      });
    },
    onError: (error) => {
      toast.error("Failed to connect");
      console.error(error);
    },
  });
};
