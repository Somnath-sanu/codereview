"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { PROMPT_PERSONALITIES, PROMPT_THEMES } from "@/inngest/prompts";
import { Loader2, Trash2 } from "lucide-react";
import { useDisconnectRepo } from "@/features/repo/hooks/use-disconnect-repo";
import { useUpdateRepo } from "@/features/repo/hooks/use-settings";

interface RepoSettingsDialogProps {
  repo: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refetchConnected?: () => void;
}

export function RepoSettingsDialog({
  repo,
  open,
  onOpenChange,
  refetchConnected,
}: RepoSettingsDialogProps) {
  const [theme, setTheme] = useState(repo?.codeReviewTheme || "Standard");
  const [personality, setPersonality] = useState(
    repo?.codeReviewPersonality || "Professional"
  );
  const { mutate: disconnect, isPending: isDisconnecting } =
    useDisconnectRepo();
  const { mutate: updateRepo, isPending: isUpdating } = useUpdateRepo();

  useEffect(() => {
    if (!repo) return;
    setTheme(repo?.codeReviewTheme || "Standard");
    setPersonality(repo?.codeReviewPersonality || "Professional");
  }, [repo , setTheme , setPersonality]);

  const handleDisconnect = () => {
    if (!repo) return;
    disconnect(
      {
        owner: repo.owner,
        repo: repo.name,
        githubId: repo.githubId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          refetchConnected?.();
        },
      }
    );
  };

  const handleSave = async () => {
    if (!repo) return;

    updateRepo({
      repoId: repo.id,
      theme,
      personality,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Repository Settings</DialogTitle>
          <DialogDescription>
            Customize how the AI reviews your code for {repo?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="theme" className="text-right">
              Theme
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger
                className="col-span-3"
                disabled={isUpdating || isDisconnecting}
              >
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PROMPT_THEMES).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="personality" className="text-right">
              Personality
            </Label>
            <Select value={personality} onValueChange={setPersonality}>
              <SelectTrigger
                className="col-span-3"
                disabled={isUpdating || isDisconnecting}
              >
                <SelectValue placeholder="Select a personality" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PROMPT_PERSONALITIES).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 cursor-pointer"
            onClick={handleDisconnect}
            disabled={isUpdating || isDisconnecting}
          >
            {isDisconnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Disconnect
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={isUpdating || isDisconnecting}
            className="cursor-pointer"
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
