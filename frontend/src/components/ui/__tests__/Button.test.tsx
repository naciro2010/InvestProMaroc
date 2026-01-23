import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Button } from '@mui/material'
import userEvent from '@testing-library/user-event'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)

    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
  })

  it('should apply variant styles', () => {
    render(<Button variant="contained" color="primary">Primary Button</Button>)

    const button = screen.getByRole('button', { name: /primary button/i })
    expect(button).toHaveClass('MuiButton-contained')
  })
})
