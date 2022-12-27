import { useContext } from "react"
import { AuthContext } from "@/context/Auth"

export default function() {
  return useContext(AuthContext)
};