import { serve } from "inngest/next"
import { inngest } from "@/inngest/client"
import { indexRepo } from "@/inngest/index-repo"
import { generateReview } from "@/inngest/generate-review"


export const {GET, POST, PUT} = serve({
  client: inngest,
  functions: [
    indexRepo,
    generateReview
  ]
})