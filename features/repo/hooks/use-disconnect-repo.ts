import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disconnectRepository } from "../actions";
import { toast } from "sonner";

export const useDisconnectRepo = () => {
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
      return await disconnectRepository(owner, repo, githubId);
    },
    onSuccess: () => {
      toast.success("Repo disconnected!");
      queryClient.invalidateQueries({
        queryKey: ["repositories"],
      });
    },
    onError: (error) => {
      toast.error("Failed to disconnect");
      console.error(error);
    },
  });
};
