import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRepositorySettings } from "../actions";
import { toast } from "sonner";


export const useUpdateRepo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      repoId,
      theme,
      personality,
    }: {
      repoId: string;
      theme: string;
      personality: string;
    }) => {
      return await updateRepositorySettings(repoId, theme, personality);
    },
    onSuccess: () => {
      toast.success("Repo updated!");
      queryClient.invalidateQueries({
        queryKey: ["repositories"],
      });
    },
    onError: (error) => {
      toast.error("Failed to update");
      console.error(error);
    },
  })
}