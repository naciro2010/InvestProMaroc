export const stripHtml = (value: string): string =>
  value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

export const getPlainTextLength = (value: string): number =>
  stripHtml(value).length
