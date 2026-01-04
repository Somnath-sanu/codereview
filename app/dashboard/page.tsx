"use client";

import { useQuery } from "@tanstack/react-query";
import { RepoCard } from "@/components/repo-card";
import { RepoSettingsDialog } from "@/components/repo-settings-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useDbRepositories,
  useGithubRepositories,
} from "@/features/repo/hooks/use-repo";
import { useConnectRepo } from "@/features/repo/hooks/use-connect-repo";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("connected");

  const {
    data: connectedRepos,
    isLoading: loadingConnected,
    refetch: refetchConnected,
    fetchNextPage: fetchNextConnectedPage,
    hasNextPage: hasNextConnectedPage,
    isFetchingNextPage: isFetchingNextConnectedPage,
  } = useDbRepositories();

  const allConnectedReposData = connectedRepos?.pages.flatMap((page) => page);

  const {
    data,
    isLoading: loadingAll,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useGithubRepositories();
  const allReposData = data?.pages.flatMap((page) => page);
  const allReposDataFiltered = allReposData?.filter((repo) => {
    return (
      repo.name.toLowerCase().includes(search.toLowerCase()) ||
      repo.owner.login.toLowerCase().includes(search.toLowerCase())
    );
  });

  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [connectingRepo, setConnectingRepo] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { mutate: connectRepo, isPending: isConnecting } = useConnectRepo();

  const handleConnect = async (repo: any) => {
    setConnectingRepo(repo);
    connectRepo(
      {
        owner: repo.owner.login,
        repo: repo.name,
        githubId: repo.id,
      },
      {
        onSuccess: () => {
          refetchConnected();
          setConnectingRepo(null);
        },
      }
    );
  };

  const handleSettings = (repo: any) => {
    setSelectedRepo(repo);
    setSettingsOpen(true);
  };

  return (
    <>
      {selectedRepo && (
        <RepoSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          repo={selectedRepo}
          refetchConnected={refetchConnected}
        />
      )}
      <div className="space-y-8 animate-slide-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
              Repositories
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your repositories and AI code reviews.
            </p>
          </div>

          {activeTab === "all" && (
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                className="pl-9 bg-white/5 border-white/10 focus-visible:ring-blue-500/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        <Tabs
          defaultValue="connected"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-white/5 border border-white/10 ">
            <TabsTrigger
              value="connected"
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-600/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-blue-400 cursor-pointer"
            >
              Connected Repositories
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-orange-600/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-orange-400 cursor-pointer"
            >
              All Repositories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connected" className="space-y-4">
            {loadingConnected ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : allConnectedReposData?.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-lg bg-white/5">
                <p className="text-muted-foreground mb-4">
                  No repositories connected yet.
                </p>
                <Button onClick={() => setActiveTab("all")}>
                  Connect a Repository
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allConnectedReposData?.map((repo: any) => (
                    <RepoCard
                      key={repo.id}
                      repo={repo}
                      isConnected={true}
                      onSettings={handleSettings}
                    />
                  ))}
                </div>
                {hasNextConnectedPage && (
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => fetchNextConnectedPage()}
                      disabled={isFetchingNextConnectedPage}
                      className="cursor-pointer"
                    >
                      {isFetchingNextConnectedPage && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {loadingAll ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allReposDataFiltered?.length === 0 ? (
                  <div className="flex flex-col w-full items-center justify-center p-12 border border-dashed border-white/10 rounded-lg bg-white/5">
                    <p className="text-muted-foreground mb-4">
                      No repositories found.
                    </p>
                  </div>
                ) : (
                  <>
                    {allReposDataFiltered?.map((repo) => (
                      <RepoCard
                        key={repo.id}
                        repo={repo}
                        isConnected={false}
                        onConnect={handleConnect}
                        isLoading={isConnecting}
                        connectingRepo={connectingRepo}
                      />
                    ))}
                    {hasNextPage && !search.trim() && (
                      <div className="col-span-full flex justify-center mt-4">
                        <Button
                          variant="outline"
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                          className="cursor-pointer"
                        >
                          {isFetchingNextPage && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Load More
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Dashboard;
