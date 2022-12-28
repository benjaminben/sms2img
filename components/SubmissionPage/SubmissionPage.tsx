import {
  getFirestore, doc, getDoc, query, where, collection, onSnapshot,
  DocumentReference, DocumentData,
} from "firebase/firestore"
import useEntriesStore, { Entry } from "@/store/entries"
import { useEffect, useState } from "react"
import styles from "./SubmissionPage.module.css"
import EntryPreview from "../EntryPreview"
import TipJar from "../TipJar"

interface SubmissionPageProps {
  id: string,
}

const SubmissionPage = (props: SubmissionPageProps) => {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<Entry[]>([])
  const { getEntryDoc } = useEntriesStore()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const db = getFirestore()
      console.log(props)
      const submissionRef = doc(db, "submissions", props.id)
      const submissionSnap = await getDoc(submissionRef)
      if (!submissionSnap.exists()) {
        throw "You got a bad link, kid"
      }
      const submissionItems = await Promise.all(
        submissionSnap.data().items.map((entryRef: DocumentReference) => getEntryDoc(entryRef))
      )
      setEntries(submissionItems)
    } catch(err) {
      console.error(err)
      if (typeof err === "string") {
        setError(err)
      } else if (err instanceof Error) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return( loading ? <>loading...</> : error ? <>{error}</> :
    <div className={`${styles.SubmissionPage}`}>
      <div className="previews">
        { entries.map((entry: Entry) => <EntryPreview key={entry.downloadURL} entry={entry} />) }
      </div>
      <TipJar />
    </div>
  )
}

export default SubmissionPage
