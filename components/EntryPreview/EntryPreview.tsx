import { Entry } from "@/store/entries"
import styles from "./EntryPreview.module.css"

interface EntryProps {
  entry: Entry
}

const EntryPreview = (props:EntryProps) => {
  return(
    <div className={`${styles.EntryPreview}`}>
      <img src={props.entry.downloadURL} alt={props.entry.prompt} />
    </div>
  )
}

export default EntryPreview
