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
    <div className="flex min-h-svh w-full flex-col md:flex-row bg-background">
      <div className="relative hidden w-1/2 flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-primary/20" />
        <div className="absolute inset-0">
          <img
            src="/login-hero.png"
            alt="Login Hero"
            className="h-full w-full object-cover dark:brightness-[0.7]"
          />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img
            src="/codecat.png"
            alt="CodeCat Logo"
            className="mr-2 h-10 w-10 object-contain"
          />
          CodeCat
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Experience the intelligence of automated code reviews.
              Streamline your workflow and ship better code, faster.&rdquo;
            </p>
            {/* <footer className="text-sm">Somnath</footer> */}
          </blockquote>
        </div>
      </div>
      <div className="flex w-full flex-1 flex-col justify-center gap-6 px-10 md:px-14 lg:px-20">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Connect your github account to get started
            </p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Button variant="outline"  onClick={onSubmit} className="w-full cursor-pointer">
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </Button>
            </div>
            {/* <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <a
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </a>
              .
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
};
