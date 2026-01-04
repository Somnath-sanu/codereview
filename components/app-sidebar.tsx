"use client"

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react"
import { Sidebar, SidebarContent, SidebarHeader } from "./ui/sidebar";

export const AppSidebar = () => {
  const [mounted, setMounted] = useState(false);

  const {data: session} = useSession()

  useEffect(() => {
    setMounted(true);
  },[])

  if (!mounted || !session) {
    return null;
  }

  const user = session.user;
  const name = user.name || "Guest";
  const email = user.email
  const userInitials = name.split(" ").map(n => n[0]).join("").toUpperCase()
  
  
  return (
    <Sidebar>
      <SidebarHeader className="border-b">

      </SidebarHeader>

      <SidebarContent className="px-3 py-6 flex-col gap-1">

      </SidebarContent>
    </Sidebar>
  )
}
