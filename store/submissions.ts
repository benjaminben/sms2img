import create from "zustand"
import {
  getFirestore, query, where, collection, onSnapshot,
  DocumentReference, DocumentData,
} from "firebase/firestore"
import useUiStore from "./ui"
import useEntriesStore, { Entry } from "./entries"

interface Submission {
  id: string,
  data: DocumentData,
}

interface SubmissionsState {
  submissions: Submission[],
  setSubmissions: Function,
  unsubscribe: Function | null,
  setUnsubscribe: Function,
  init: Function,
}

const useSubmissionsStore = create<SubmissionsState>()((set, get) => {
  return {
    submissions: [],
    setSubmissions(submissions: Submission[]) { set({ submissions }) },

    unsubscribe: null,
    setUnsubscribe(unsubscribe: Function | null) { set({ unsubscribe }) },

    init() {
      const db = getFirestore()
      const { unsubscribe, setUnsubscribe, setSubmissions } = get()
      if (unsubscribe) { unsubscribe() }
      const { filterDateStart } = useUiStore.getState()
      const { addEntryToLib } = useEntriesStore.getState()
      const submissionsRef = collection(db, "submissions")
      const q = query(submissionsRef, where("timestamp", ">", filterDateStart))
      const unsub = onSnapshot(q, (snapshot) => {
        const { submissions } = get()
        const { spotlightIndex } = useUiStore.getState()
        const s: Submission[] = [...submissions]
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const d = change.doc.data()
            d.items.forEach((entryRef: DocumentReference) => {
              addEntryToLib(entryRef)
            })
            // s.push({id: change.doc.id, data: change.doc.data()})
            s.splice(
              spotlightIndex // Loop position
              ? spotlightIndex - 1
              : submissions.length - 1,
              0,
              { id: change.doc.id, data: change.doc.data() }
            )

          }
        })
        console.log("Next submissions array:", s)
        setSubmissions(s)
      })
      setUnsubscribe(unsub)
    },
  }
})

export default useSubmissionsStore