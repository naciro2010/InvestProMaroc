export const formatDateInput = (value: Date | string | null | undefined): string => {
  if (!value) return ''
  if (typeof value === 'string') return value.split('T')[0]
  return value.toISOString().split('T')[0]
}

export const addMonths = (date: Date, months: number): Date => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const target = new Date(year, month + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(day, lastDay))
  return target
}

export const calculateDurationMonths = (start: Date, end: Date): number => {
  const startYear = start.getFullYear()
  const startMonth = start.getMonth()
  const endYear = end.getFullYear()
  const endMonth = end.getMonth()
  let months = (endYear - startYear) * 12 + (endMonth - startMonth)
  if (end.getDate() < start.getDate()) {
    months -= 1
  }
  return Math.max(months, 0)
}
