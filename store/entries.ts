import create from "zustand"
import { getDoc, DocumentReference } from "firebase/firestore"
import { getStorage, getDownloadURL, ref } from "firebase/storage"

const storage = getStorage()

// type Entry = Promise<Object>
export interface Entry {
  downloadURL: string,
}

interface EntriesLib {
  [key: string]: Promise<Entry>
}

interface EntriesState {
  lib: EntriesLib,
  setLib: Function,
  addEntryToLib: Function,
  entry: Function,
}

const useEntriesStore = create<EntriesState>()((set, get) => {
  return {
    lib: {},
    setLib(lib: EntriesLib) { set({ lib }) },

    addEntryToLib(entryRef: DocumentReference) {
      const { setLib, lib } = get()
      setLib({
        ...lib,
        [entryRef.id]: (async () => {
          console.log("fetching entry:", entryRef.id)
          try {
            const entry = await getDoc(entryRef)
            const entryData = entry.data()
            if (!entryData) {
              throw `Entry data undefined for ${entryRef.id}`
            }
            const downloadURL = await getDownloadURL(ref(storage, entryData.storagePath))
            // setLib({ ...lib, [entry.id]: { ...entryData, downloadURL } })
            const fin = { ...entryData, downloadURL }
            return fin
          } catch(err) {
            console.error(err)
            return err
          }
        })()
      })
    },

    async entry(id: string) {
      const { lib } = get()
      const entry = await lib[id]
      return entry
    }
  }
})

export default useEntriesStore