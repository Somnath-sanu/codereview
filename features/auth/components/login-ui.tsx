"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

export const LoginPage = () => {
  const onSubmit = async () => {
    try {
      await signIn.social({
        provider: "github",
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <Button onClick={onSubmit}> Sign In </Button>
    </div>
  );
};
