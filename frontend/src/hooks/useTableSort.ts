import { useState, useMemo } from 'react'

type SortDirection = 'asc' | 'desc'

interface SortConfig<T> {
  key: keyof T
  direction: SortDirection
}

interface UseTableSortReturn<T> {
  sortedItems: T[]
  sortConfig: SortConfig<T> | null
  requestSort: (key: keyof T) => void
}

/**
 * Generic hook for client-side table column sorting.
 *
 * Supports strings, numbers, dates (as ISO strings), booleans, and null/undefined values.
 * Null/undefined values are always sorted to the end regardless of direction.
 *
 * @param items - The array of items to sort
 * @param defaultSort - Optional default sort configuration
 * @returns sortedItems, current sortConfig, and requestSort function
 */
function useTableSort<T>(
  items: T[],
  defaultSort?: SortConfig<T>
): UseTableSortReturn<T> {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(defaultSort || null)

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items

    return [...items].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      // Null/undefined always go to the end
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      let comparison = 0

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal, 'fr', { sensitivity: 'base' })
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        comparison = (aVal === bVal) ? 0 : aVal ? -1 : 1
      } else {
        // Fallback: convert to string and compare
        comparison = String(aVal).localeCompare(String(bVal), 'fr', { sensitivity: 'base' })
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [items, sortConfig])

  const requestSort = (key: keyof T) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' as const : 'asc' as const }
      }
      return { key, direction: 'asc' as const }
    })
  }

  return { sortedItems, sortConfig, requestSort }
}

export { useTableSort }
export type { SortConfig, SortDirection }
