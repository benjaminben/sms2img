import SubmissionPage from "@/components/SubmissionPage"
import Head from "next/head"
import { useRouter } from "next/router"

export default function Page() {
  const router = useRouter()
  const submissionId = router.query.submissionId as string
  return(
    <>
    {/* <Head>
      <script type="text/javascript" src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
    </Head> */}
    { router.isReady &&
      <SubmissionPage id={submissionId} /> }
    </>
  )
}