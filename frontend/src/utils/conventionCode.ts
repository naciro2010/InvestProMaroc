const incrementAlphabetic = (value: string): string => {
  const chars = value.toUpperCase().split('')
  let carry = 1

  for (let i = chars.length - 1; i >= 0; i -= 1) {
    if (!carry) break
    const code = chars[i].charCodeAt(0) - 65 + carry
    if (code >= 26) {
      chars[i] = 'A'
      carry = 1
    } else {
      chars[i] = String.fromCharCode(65 + code)
      carry = 0
    }
  }

  if (carry) {
    chars.unshift('A')
  }

  return chars.join('')
}

const incrementAlphaNumeric = (value: string): string => {
  const normalized = value.toUpperCase()
  const parsed = parseInt(normalized, 36)
  if (Number.isNaN(parsed)) return value
  const next = (parsed + 1).toString(36).toUpperCase()
  return next.padStart(value.length, '0')
}

export const incrementConventionCode = (lastCode: string): string => {
  const match = lastCode.match(/([0-9A-Za-z]+)$/)
  if (!match || match.index === undefined) {
    return `${lastCode}-01`
  }

  const suffix = match[1]
  const prefix = lastCode.slice(0, match.index)

  if (/^\d+$/.test(suffix)) {
    const padded = (parseInt(suffix, 10) + 1).toString().padStart(suffix.length, '0')
    return `${prefix}${padded}`
  }

  if (/^[A-Za-z]+$/.test(suffix)) {
    return `${prefix}${incrementAlphabetic(suffix)}`
  }

  if (/^[0-9A-Za-z]+$/.test(suffix)) {
    return `${prefix}${incrementAlphaNumeric(suffix)}`
  }

  return `${lastCode}-01`
}
