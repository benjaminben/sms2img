import { NextApiRequest, NextApiResponse } from "next";
import { Client, Environment } from "square";
import { randomUUID } from "crypto"

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox,
})

const post = async (
  req: NextApiRequest,
  res: NextApiResponse<string|object>
) => {
  try {
    const response = await client.paymentsApi.createPayment({
      sourceId: req.body.sourceId,
      locationId: req.body.locationId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: req.body.amountCents,
        currency: 'USD',
      }
    })
    // console.log(response.result)
    return res.status(200).send("OK")
  } catch(err) {
    return res.status(400).send("Something went wrong")
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<string|object>
) {
  if (req.method !== 'post') { return post(req, res) }
  res.status(400).send("Method not supported")
}