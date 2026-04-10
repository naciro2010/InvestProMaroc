import { useState, useEffect, useRef, FocusEvent } from 'react'
import { TextField, TextFieldProps } from '@mui/material'
import { componentStyles } from '@/lib/designSystem'

interface DecimalInputProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: number
  onChange: (value: number) => void
  decimalPlaces?: number
  min?: number
  max?: number
  selectOnFocus?: boolean
}

/**
 * Smart decimal input - ERP/Excel-style numeric field
 *
 * Design System component for ALL numeric inputs in InvestPro.
 *
 * Behavior:
 * - Displays formatted value: "1 234 567,89" (French locale)
 * - On focus: clears "0,00" to empty, or shows raw value for editing
 * - Selects all text on focus for quick replacement
 * - Accepts comma (,) and dot (.) as decimal separator
 * - Accepts formulas: "=100+50*2"
 * - Right-aligned with tabular-nums for column alignment
 * - On blur: parses, validates min/max, rounds, formats, updates parent
 * - Enter key triggers blur (commit value)
 */
const DecimalInput = ({
  value,
  onChange,
  decimalPlaces = 2,
  min,
  max,
  selectOnFocus = true,
  ...props
}: DecimalInputProps) => {
  const [displayValue, setDisplayValue] = useState<string>('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value, decimalPlaces))
    }
  }, [value, decimalPlaces, isFocused])

  const formatNumber = (num: number, decimals: number): string => {
    if (isNaN(num)) {
      return decimals > 0
        ? '0,' + '0'.repeat(decimals)
        : '0'
    }
    return num.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  const parseNumber = (str: string): number => {
    if (!str || str.trim() === '') return 0

    const trimmed = str.trim()
    if (trimmed.startsWith('=')) {
      const computed = evaluateExpression(trimmed.slice(1))
      return Number.isNaN(computed) ? 0 : computed
    }

    let cleaned = trimmed.replace(/\s/g, '')
    cleaned = cleaned.replace(',', '.')
    cleaned = cleaned.replace(/[^\d.-]/g, '')

    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  const evaluateExpression = (expression: string): number => {
    const cleaned = expression.replace(/\s/g, '').replace(',', '.')
    if (!/^[\d+*/().-]+$/.test(cleaned)) {
      return NaN
    }
    try {
      // eslint-disable-next-line no-new-func
      return Function(`"use strict"; return (${cleaned});`)() as number
    } catch {
      return NaN
    }
  }

  const constrainNumber = (num: number): number => {
    if (min !== undefined && num < min) return min
    if (max !== undefined && num > max) return max
    return num
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === '') {
      setDisplayValue('')
      return
    }
    if (/^[=\d\s,.\-+*/()]*$/.test(inputValue)) {
      setDisplayValue(inputValue)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)

    const numValue = parseNumber(displayValue)

    // If value is 0, clear the field for fresh input (ERP behavior)
    if (numValue === 0) {
      setDisplayValue('')
    } else {
      // Show raw value without thousand separators, comma as decimal
      const raw = decimalPlaces > 0
        ? numValue.toFixed(decimalPlaces).replace('.', ',')
        : numValue.toString()
      setDisplayValue(raw)
    }

    // Select all text after state update
    if (selectOnFocus) {
      requestAnimationFrame(() => {
        inputRef.current?.select()
      })
    }
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)

    const parsed = parseNumber(displayValue)
    const constrained = constrainNumber(parsed)
    const factor = Math.pow(10, decimalPlaces)
    const rounded = Math.round(constrained * factor) / factor

    onChange(rounded)
    setDisplayValue(formatNumber(rounded, decimalPlaces))

    if (props.onBlur) {
      props.onBlur(e)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
    if (props.onKeyDown) {
      props.onKeyDown(e)
    }
  }

  return (
    <TextField
      {...props}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      inputRef={inputRef}
      sx={{
        ...componentStyles.numericInput,
        ...props.sx,
      }}
      inputProps={{
        ...props.inputProps,
        inputMode: 'decimal' as const,
        style: {
          textAlign: 'right' as const,
          fontVariantNumeric: 'tabular-nums',
          ...props.inputProps?.style,
        },
      }}
    />
  )
}

export default DecimalInput
