import { useState, useEffect, FocusEvent } from 'react'
import { TextField, TextFieldProps } from '@mui/material'

interface DecimalInputProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: number
  onChange: (value: number) => void
  decimalPlaces?: number
  min?: number
  max?: number
}

/**
 * Smart decimal input component that behaves like Odoo/Excel cells
 *
 * Features:
 * - Accepts both comma (,) and dot (.) as decimal separator
 * - Automatically formats to 2 decimal places on blur
 * - Allows natural typing experience (no forced formatting while typing)
 * - Handles copy/paste from Excel
 * - Clean visual feedback
 * - Validates min/max ranges
 */
const DecimalInput = ({
  value,
  onChange,
  decimalPlaces = 2,
  min,
  max,
  ...props
}: DecimalInputProps) => {
  // Internal state for the displayed string (allows natural typing)
  const [displayValue, setDisplayValue] = useState<string>('')
  const [isFocused, setIsFocused] = useState(false)

  // Initialize display value from prop value
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value, decimalPlaces))
    }
  }, [value, decimalPlaces, isFocused])

  /**
   * Format number for display (French format with spaces and comma)
   * Example: 1234567.89 → "1 234 567,89"
   */
  const formatNumber = (num: number, decimals: number): string => {
    if (isNaN(num)) return '0' + ',00'.substring(0, decimals + 1)

    return num.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  /**
   * Parse string to number (accepts both comma and dot)
   * Handles: "1 234,56", "1234.56", "1,234.56", etc.
   */
  const parseNumber = (str: string): number => {
    if (!str || str.trim() === '') return 0

    const trimmed = str.trim()
    if (trimmed.startsWith('=')) {
      const computed = evaluateExpression(trimmed.slice(1))
      return Number.isNaN(computed) ? 0 : computed
    }

    // Remove all spaces
    let cleaned = trimmed.replace(/\s/g, '')

    // Replace comma with dot for parsing
    cleaned = cleaned.replace(',', '.')

    // Remove any non-numeric characters except dot and minus
    cleaned = cleaned.replace(/[^\d.-]/g, '')

    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  const evaluateExpression = (expression: string): number => {
    const cleaned = expression.replace(/\s/g, '').replace(',', '.')
    if (!/^[\\d+\\-*/().]+$/.test(cleaned)) {
      return NaN
    }

    try {
      // eslint-disable-next-line no-new-func
      return Function(`\"use strict\"; return (${cleaned});`)() as number
    } catch (error) {
      return NaN
    }
  }

  /**
   * Validate and constrain number to min/max
   */
  const constrainNumber = (num: number): number => {
    if (min !== undefined && num < min) return min
    if (max !== undefined && num > max) return max
    return num
  }

  /**
   * Handle input change while typing
   * Allow natural typing without forced formatting
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Allow empty input
    if (inputValue === '') {
      setDisplayValue('')
      return
    }

    // Allow natural typing: digits, comma, dot, spaces, minus, operators, equal sign
    if (/^[=\d\s,.\-+*/()]*$/.test(inputValue)) {
      setDisplayValue(inputValue)
    }
  }

  /**
   * Handle focus - show raw editable value
   */
  const handleFocus = () => {
    setIsFocused(true)
    // Convert formatted value back to simple decimal for editing
    const numValue = parseNumber(displayValue)
    setDisplayValue(numValue.toString().replace('.', ','))
  }

  /**
   * Handle blur - parse, validate, format, and update parent
   */
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)

    // Parse the input value
    const parsed = parseNumber(displayValue)

    // Constrain to min/max
    const constrained = constrainNumber(parsed)

    // Round to specified decimal places
    const rounded = Math.round(constrained * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)

    // Update parent component
    onChange(rounded)

    // Format for display
    setDisplayValue(formatNumber(rounded, decimalPlaces))

    // Call original onBlur if provided
    if (props.onBlur) {
      props.onBlur(e)
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter key - blur to trigger formatting
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }

    // Tab key - let default behavior handle blur

    // Call original onKeyDown if provided
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
      inputProps={{
        ...props.inputProps,
        inputMode: 'decimal',
        style: {
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          ...props.inputProps?.style,
        },
      }}
    />
  )
}

export default DecimalInput
