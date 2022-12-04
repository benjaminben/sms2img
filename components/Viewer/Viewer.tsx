import styles from "./Viewer.module.css"
import { useSubmissionsStore } from "@/store"
import { useState, useRef, useEffect, useCallback } from "react"
import Entry from "@/components/Entry"
import { DocumentReference } from "firebase/firestore"

const Viewer = () => {
  const { submissions } = useSubmissionsStore()
  const [spotlightIndex, setSpotlightIndex] = useState(0)
  const [swapReady, setSwapReady] = useState(true)
  const [mounted, setMounted] = useState(false)
  const updateTimeout = useRef(0)

  // const nextIndex = useCallback((current: number) => {
  //   let next = current + 1
  //   console.log(next, submissions.length)
  //   return submissions.length % next
  // }, [submissions])

  // function nextIndex() {

  // }

  // function doSwap(idx: number) {
  //   setSpotlightIndex(idx)
  //   setSwapReady(false)
  //   refreshTimeout()
  // }

  // function refreshTimeout() {
  //   window.clearTimeout(updateTimeout.current)
  //   updateTimeout.current = window.setTimeout(
  //     () => doSwap(nextIndex()),
  //     5 * 1000
  //   )
  // }

  // useEffect(() => {
  //   setMounted(true)
  // }, [])

  // useEffect(() => {
  //   if (mounted) {
  //     refreshTimeout()
  //   }
  // }, [mounted])

  // useEffect(() => {
  //   if (submissions.length && swapReady) {
  //     // setSpotlightIndex(current => nextIndex(current))
  //     // refreshTimeout()
  //   } else {
  //     /* ... */
  //   }
  // }, [submissions, swapReady])

  return(
    <div className={`${styles.Viewer}`}>
    {
      submissions.length
      ? <div>
          {
            // submissions[spotlightIndex].data.items.map((entryRef: DocumentReference) =>
            submissions[submissions.length - 1].data.items.map((entryRef: DocumentReference) =>
              <Entry
                key={entryRef.id}
                id={entryRef.id}
              />
            )
          }
        </div>
      : "Initializing Viewer..."
    }
    </div>
  )
}

export default Viewer
