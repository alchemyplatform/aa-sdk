import { useState } from "react"
import { Authentication } from "./Authentication"

export const Configuration = () => {
  const [tab, setTab] = useState<'authentication' | 'style'>('authentication')

  return tab === "authentication" ? <Authentication /> : <div />
}
