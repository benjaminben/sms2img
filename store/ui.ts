import create from "zustand"
import { midnightToday } from "@/utils"
import useSubmissionsStore from "./submissions"

interface UiState {
  filterDateStart: Date,
  spotlightIndex: number,
  setSpotlightIndex: Function,
  spotlightNext: Function,
  // doUpdate: Function,
  // setDoUpdate: Function,
}

const useUiStore = create<UiState>()((set, get) => {
  return {
    filterDateStart: midnightToday(),
    // filterDateStart: new Date("1993-03-16"),

    spotlightIndex: 0,
    setSpotlightIndex(update: number | Function) {
      const { spotlightIndex } = get()
      let next = spotlightIndex
      if (typeof update === "number") {
        next = update
      } else {
        next = update(spotlightIndex)
      }
      set({ spotlightIndex: next })
    },
    spotlightNext() {
      const { spotlightIndex, setSpotlightIndex } = get()
      const { submissions } = useSubmissionsStore.getState()
      const next = spotlightIndex === 0
        ? submissions.length - 1
        : spotlightIndex - 1
      setSpotlightIndex(next)
    }
  }
})

export default useUiStore