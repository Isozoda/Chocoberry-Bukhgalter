import { useState } from 'react'

export const usePagination = (defaultLimit = 20) => {
  const [page, setPage] = useState(1)
  const [limit] = useState(defaultLimit)

  const reset = () => setPage(1)

  return { page, limit, setPage, reset }
}
