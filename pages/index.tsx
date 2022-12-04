import Viewer from '@/components/Viewer'
import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <Head>
        <title>sms2img</title>
      </Head>
      <Viewer />
    </>
  )
}
