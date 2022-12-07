import styles from "./Viewer.module.css"
import { useSubmissionsStore } from "@/store"
import { useState, useRef, useEffect, useCallback } from "react"
import Entry from "@/components/Entry"
import { DocumentReference } from "firebase/firestore"

const Viewer = () => {
  const { submissions } = useSubmissionsStore()
  const [spotlightIndex, setSpotlightIndex] = useState(0)
  const [swapReady, setSwapReady] = useState(true)
  const updateTimeout = useRef(0)

  function cycleRange(start: number, end: number) {
    killCycle()
    updateTimeout.current = window.setTimeout(
      () => {
        setSpotlightIndex(current =>
          current - start > 0
          ? current - 1
          : end - 1
        )
        cycleRange(start, end)
      },
      5 * 1000
    )
  }

  function killCycle() {
    window.clearTimeout(updateTimeout.current)
  }

  useEffect(() => {
    if (submissions.length && swapReady) {
      cycleRange(0, submissions.length)
    } else {
      /* ... */
    }
  }, [submissions, swapReady])

  const currentSubmission = submissions[spotlightIndex]

  return(
    <div className={`${styles.Viewer}`}>
    {
      submissions.length && currentSubmission
      ? <>
          <div className={styles.prompt}>
            <h2>{submissions[spotlightIndex].data.prompt}</h2>
          </div>
          <div className={`${styles.entries}`}>
            {
              submissions[spotlightIndex].data.items.map((entryRef: DocumentReference) =>
              // submissions[submissions.length - 1].data.items.map((entryRef: DocumentReference) =>
                <Entry
                  key={entryRef.id}
                  id={entryRef.id}
                />
              )
            }
          </div>
        </>
      : "Awaiting submissions..."
    }
    </div>
  )
}

export default Viewer
