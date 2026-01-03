"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"


export const QueryProvider = ({children}: {
  children: React.ReactNode
}) => {
  /**One QueryClient instance per component lifecycle
   * And not one per render.
   * That is the core guarantee of useState
   * React runs the initializer only once (on the first render)
   On every re-render:
   React reuses the same stored value
   It does not call new QueryClient() again
   The value only changes if you call setClient(...)
   * Why NOT do this:
   * const client = new QueryClient();
   * Because in React:
  Function components re-run on every render
    This would create a new QueryClient each time
    Result:
      cache reset
      refetch storms
      memory leaks
      broken React Query behavior
   */
  const [client] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
}