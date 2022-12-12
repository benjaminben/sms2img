import styles from "./Viewer.module.css"
import { useSubmissionsStore } from "@/store"
import { useRef, useEffect } from "react"
import Entry from "@/components/Entry"
import { DocumentReference } from "firebase/firestore"
import { useUiStore } from "@/store"

const cycleDuration = 10 * 60

const Viewer = () => {
  const { submissions } = useSubmissionsStore()
  const { spotlightIndex, spotlightNext } = useUiStore()
  const updateFrame = useRef(0)
  const tick = useRef(0)

  function onTick() {
    spotlightNext()
  }

  function run() {
    console.log("frame")
    tick.current += 1
    if (tick.current === cycleDuration) {
      onTick()
      tick.current = 0
    }
    updateFrame.current = requestAnimationFrame(run)
  }

  useEffect(() => {
    run()
    return () => {
      cancelAnimationFrame(updateFrame.current)
    }
  }, [])

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
