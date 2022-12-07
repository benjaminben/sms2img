import create from "zustand"
import { midnightToday } from "@/utils"

interface UiState {
  filterDateStart: Date
}

const useUiStore = create<UiState>()((set, get) => {
  return {
    // filterDateStart: midnightToday()
    filterDateStart: new Date("1993-03-16")
  }
})

export default useUiStore