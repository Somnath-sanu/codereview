import { Header } from "@/components/header";
import { requireAuth } from "@/features/auth/utils/auth-utils";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header/>
      <main className="flex-1 container mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
};

export default Layout;
