"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchRepos, getConnectedRepos } from "../actions";


export const useGithubRepositories = () => {
  return useInfiniteQuery({
    queryKey: ["repositories"],
    queryFn: async ({ pageParam = 1 }) => {
      return await fetchRepos(pageParam, 10);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 5) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
};

export const useDbRepositories = () => {
  return useInfiniteQuery({
    queryKey: ["connected-repos"],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await getConnectedRepos(pageParam, 10);
      return data.repos;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 5) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
};
