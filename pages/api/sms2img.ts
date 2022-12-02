// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { run } from "@/server/sms2img.js"

type Data = {
  success: boolean,
  reason: string | null,
}

async function post(req: NextApiRequest) {
  const result = await run(req.body)
  return result
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case "POST":
      try {
        const succ = await post(req)
        return res.status(succ.code || 200).json({ success: !succ.code || succ.code < 400, reason: succ.message || "Done." })
      } catch(err) {
        return res.status(400).json({ success: false, reason: (err as Error).message })
      }
    default:
      return res.status(400).json({ success: false, reason: "Method not allowed." })
  }
}
