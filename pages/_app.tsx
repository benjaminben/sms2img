import "../styles/globals.css"
import { useEffect } from "react"
import type { AppProps } from "next/app"
import "@/firebase/index.js"
import { useSubmissionsStore } from "@/store"
import { AuthProvider } from "@/context/Auth"

export default function App({ Component, pageProps }: AppProps) {
  const { init: initSubmissions } = useSubmissionsStore()

  async function start() {
    initSubmissions()
  }

  useEffect(() => {
    start()
  }, [])

  return(
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
