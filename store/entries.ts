import create from "zustand"
import { getDoc, DocumentReference } from "firebase/firestore"
import { getStorage, getDownloadURL, ref } from "firebase/storage"

// type Entry = Promise<Object>
export interface Entry {
  downloadURL: string,
  prompt: string,
}

interface EntriesLib {
  [key: string]: Promise<Entry>
}

interface EntriesState {
  lib: EntriesLib,
  setLib: Function,
  addEntryToLib: Function,
  entry: Function,
  getEntryDoc: Function,
}

const useEntriesStore = create<EntriesState>()((set, get) => {
  return {
    lib: {},
    setLib(lib: EntriesLib) { set({ lib }) },

    addEntryToLib(entryRef: DocumentReference) {
      const storage = getStorage()
      const { setLib, lib, getEntryDoc } = get()
      setLib({
        ...lib,
        [entryRef.id]: getEntryDoc()
      })
    },

    async getEntryDoc(entryRef: DocumentReference) {
      const storage = getStorage()
      try {
        const entry = await getDoc(entryRef)
        const entryData = entry.data()
        if (!entryData) {
          throw `Entry data undefined for ${entryRef.id}`
        }
        const downloadURL = await getDownloadURL(ref(storage, entryData.storagePath))
        const fin = { ...entryData, downloadURL }
        return fin
      } catch(err) {
        console.error(err)
        return err
      }
    },

    async entry(id: string) {
      const { lib } = get()
      const entry = await lib[id]
      return entry
    }
  }
})

export default useEntriesStore