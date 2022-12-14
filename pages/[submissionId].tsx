import SubmissionPage from "@/components/SubmissionPage"
import { useRouter } from "next/router"

export default () => {
  const router = useRouter()
  const { submissionId } = router.query
  return( router.isReady &&
    <SubmissionPage id={submissionId} />
  )
}