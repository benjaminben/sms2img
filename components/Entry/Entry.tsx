import { useEffect, useState } from "react"
import styles from "./Entry.module.css"
import useEntriesStore, { Entry } from "@/store/entries"

type EntryProps = {
  id: string,
}

const Entry = (props: EntryProps) => {
  const [src, setSrc] = useState("")
  const [loaded, setLoaded] = useState(false)
  const { entry, lib } = useEntriesStore()

  useEffect(() => {
    entry(props.id).then((e: Entry) => {
      const img = document.createElement("img")
      const { downloadURL } = e
      img.addEventListener("load", () => {
        setLoaded(true)
        setSrc(downloadURL)
      })
      img.src = downloadURL
    })
  }, [])

  return(
    <div className={`${styles.Entry}`}>
    {
      loaded
      ? <img src={src} />
      : "Loading Entry..."
    }
    </div>
  )
}

export default Entry
