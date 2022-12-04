import "../styles/globals.css"
import { useEffect } from "react"
import type { AppProps } from "next/app"
import "@/firebase"
import { useSubmissionsStore } from "@/store"

export default function App({ Component, pageProps }: AppProps) {
  const { init: initSubmissions } = useSubmissionsStore()

  useEffect(() => {
    initSubmissions()
  }, [])

  return <Component {...pageProps} />
}
