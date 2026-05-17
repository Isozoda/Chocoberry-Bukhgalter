import { useState } from 'react'

export function usePagination(defaultLimit = 20) {
  const [page, setPage] = useState(1)
  const [limit] = useState(defaultLimit)

  const nextPage = () => setPage((p) => p + 1)
  const reset = () => setPage(1)

  return { page, limit, nextPage, reset }
}
