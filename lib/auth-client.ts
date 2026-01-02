import { createAuthClient } from "better-auth/client";

export const { signIn, signUp, signOut } = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
});
