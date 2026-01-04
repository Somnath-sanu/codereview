"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings2Icon, GithubIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RepoCardProps {
  repo: any;
  isConnected?: boolean;
  onConnect?: (repo: any) => void;
  onSettings?: (repo: any) => void;
  isLoading?: boolean;
  connectingRepo?: any;
}

export function RepoCard({
  repo,
  isConnected = false,
  onConnect,
  onSettings,
  isLoading,
  connectingRepo,
}: RepoCardProps) {
  const handleConnect = async () => {
    if (!onConnect) return;
    try {
      await onConnect(repo);
    } catch {
      toast.error("Failed to connect repository");
    }
  };

  return (
    <Card className="group relative overflow-hidden border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/10 hover:shadow-2xl hover:-translate-y-1">
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-orange-500/10 opacity-0 transition-opacity group-hover:opacity-100" />

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <GithubIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">
                {repo.name}
              </CardTitle>
              <CardDescription className="text-xs font-mono text-muted-foreground">
                {repo.owner?.login || repo.owner}
              </CardDescription>
            </div>
          </div>
          {isConnected && (
            <Badge
              variant="outline"
              className={`${
                repo.status === "Indexed"
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : repo.status === "Indexing"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : repo.status === "Failed"
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-gray-500/10 text-gray-400 border-gray-500/20"
              }`}
            >
              {repo.status === "Indexing" ? (
                <span className="flex items-center">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Indexing
                </span>
              ) : (
                repo.status || "Unknown"
              )}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {repo.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {repo.description}
          </p>
        )}

        {repo.language && (
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              {repo.language && (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  {repo.language}
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        {isConnected ? (
          <Button
            variant="outline"
            className="w-full cursor-pointer bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-medium text-muted-foreground z-100"
            onClick={() => onSettings?.(repo)}
          >
            <Settings2Icon className="w-4 h-4 mr-2" />
            Configure
          </Button>
        ) : (
          <Button
            className="z-100 cursor-pointer w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 border-0"
            onClick={handleConnect}
            disabled={isLoading && connectingRepo?.id === repo.id}
          >
            {isLoading && connectingRepo?.id === repo.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Connect Repository"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
