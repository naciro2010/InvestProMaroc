import { useCallback, useEffect, useState } from 'react'

/**
 * « Consultés récemment » : les 4 dernières conventions ou marchés ouverts,
 * persistés en localStorage et synchronisés entre composants et onglets.
 */

export interface RecentRecord {
  /** Clé unique, ex. `convention-12` */
  key: string
  type: 'convention' | 'marche'
  code: string
  label: string
  path: string
}

const STORAGE_KEY = 'investpro_recents_v1'
const CHANGE_EVENT = 'investpro:recents-change'
const MAX_RECENTS = 4

const read = (): RecentRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as RecentRecord[]).slice(0, MAX_RECENTS) : []
  } catch {
    return []
  }
}

const write = (records: RecentRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    /* stockage indisponible : la liste reste en mémoire */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Ajoute (ou remonte) une fiche en tête de liste. */
export const pushRecentRecord = (record: RecentRecord) => {
  const next = [record, ...read().filter(r => r.key !== record.key)].slice(0, MAX_RECENTS)
  write(next)
}

/** Liste réactive des fiches consultées récemment. */
export function useRecentRecords(): RecentRecord[] {
  const [records, setRecords] = useState<RecentRecord[]>(read)

  useEffect(() => {
    const sync = () => setRecords(read())
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return records
}

/**
 * Enregistre la fiche ouverte dès que ses données sont chargées.
 * Passer `null` tant que la fiche n'est pas disponible.
 */
export function useTrackRecentRecord(record: RecentRecord | null) {
  const key = record?.key
  const code = record?.code
  const label = record?.label
  const track = useCallback(() => {
    if (record) pushRecentRecord(record)
  }, [key, code, label]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { track() }, [track])
}
