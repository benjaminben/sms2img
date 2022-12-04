import create from "zustand"
import { midnightToday } from "@/utils"

interface UiState {
  filterDateStart: Date
}

const useUiStore = create<UiState>()((set, get) => {
  return {
    filterDateStart: midnightToday()
  }
})

export default useUiStore