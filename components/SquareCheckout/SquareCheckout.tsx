import { useRef, useEffect, FormEvent, useState } from "react"
import styles from "./SquareCheckout.module.css"
import { ApplePay, Card, PaymentMethod, payments, Payments, TokenResult } from "@square/web-sdk"

const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ''
const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ''

const SquareCheckout = () => {
  const firstRender = useRef(true)
  const card = useRef<Card>()
  const applePay = useRef<ApplePay>()
  const [paymentStatus, setPaymentStatus] = useState('')

  useEffect(() => {
    if (firstRender.current) {
      initSquare()
      firstRender.current = false
    }
  }, [])

  async function initializeCard(squarePayments: Payments) {
    const card = await squarePayments.card()
    await card.attach('#card-container')
    return card
  }

  async function initializeApplePay(payments: Payments) {
    const paymentRequest = payments.paymentRequest({
      countryCode: 'US',
      currencyCode: 'USD',
      total: {
        amount: '1.00',
        label: 'Total',
      }
    })
    const applePay = await payments.applePay(paymentRequest)
    return applePay
  }

  async function initSquare() {
    const squarePayments = await payments(
      appId,
      locationId
    )
    if (!squarePayments) { throw 'Failed to initialize Square' }
    
    try {
      card.current = await initializeCard(squarePayments)
    } catch(err) {
      if (typeof err === "string") {
        console.error('Initializing Card failed', err)
      } else if (err instanceof Error) {
        console.error(err.message)
      }
    }

    try {
      applePay.current = await initializeApplePay(squarePayments)
    } catch(err) {
      console.error(err)
    }
  }

  async function createPayment(token: string | undefined) {
    const body = JSON.stringify({
      locationId,
      sourceId: token,
      amountCents: 100,
    })
    const paymentResponse = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body,
    })
    if (paymentResponse.ok) {
      return paymentResponse.text()
    }
    const errorBody = await paymentResponse.text()
    throw new Error(errorBody)
  }

  async function tokenize(paymentMethod: Card) {
    const tokenResult = await paymentMethod.tokenize()
    if (tokenResult.status === 'OK') {
      return tokenResult.token
    } else {
      let errorMessage = `Tokenization failed-status: ${tokenResult.status}`
      if (tokenResult.errors) {
        errorMessage += ` and errors: ${JSON.stringify(
          tokenResult.errors
        )}`
      }
      throw new Error(errorMessage);
    }
  }

  async function handlePaymentMethodSubmission(method: Card) {
    try {
      const token = await tokenize(method)
      const paymentResults = await createPayment(token)
      console.debug('Payment Success', paymentResults)
      setPaymentStatus("SUCCESS")
    } catch(e) {
      setPaymentStatus("FAILURE")
      if (e instanceof Error) {
        console.error(e.message)
      }
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (card.current) {
      handlePaymentMethodSubmission(card.current)
    }
  }

  return(
    <div className={`${styles.SquareCheckout}`}>
      <form onSubmit={submit}>
        <div id="card-container"></div>
        <div id="apple-pay-button" className={`${styles['apple-pay']}`}></div>
        <input type="submit" />
      </form>
    </div>
  )
}

export default SquareCheckout
