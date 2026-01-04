import { UserButton } from "@/components/user-button";
import Image from "next/image";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full p-4 border-white/5 bg-background/80 backdrop-blur-xl shadow-md supports-backdrop-filter:bg-background/60 border-b">
      <div className="container mx-auto flex h-8 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-linear-to-tr shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo/codecat.png"
              alt="Codecat Logo"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
            Codecat
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <UserButton />
        </div>
      </div>
    </header>
  );
};
