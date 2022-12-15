import { useEffect } from "react"
import styles from "./SquareCheckout.module.css"
import { payments, Payments } from "@square/web-sdk"

const SquareCheckout = () => {
  useEffect(() => {
    initSquare()
  }, [])

  async function initializeCard(squarePayments: Payments) {
    const card = await squarePayments.card()
    await card.attach('#card-container')
    return card
  }

  async function initSquare() {
    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ''
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ''
    console.log(appId)
    const squarePayments = await payments(
      appId,
      locationId
    )
    if (!squarePayments) { throw 'Failed to initialize Square' }
    let card
    try {
      card = await initializeCard(squarePayments)
    } catch(err) {
      if (typeof err === "string") {
        console.error('Initializing Card failed', err)
      } else if (err instanceof Error) {
        console.error(err.message)
      }
    }
  }

  return(
    <div className={`${styles.SquareCheckout}`}>
      <div id="card-container"></div>
    </div>
  )
}

export default SquareCheckout
