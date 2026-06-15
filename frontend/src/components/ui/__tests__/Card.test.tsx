import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Card } from '../Card'

describe('Card', () => {
  it('renders the title when provided', () => {
    render(<Card title="Incidents">content</Card>)
    expect(screen.getByText('Incidents')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <Card title="Panel">
        <p>child content</p>
      </Card>,
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('omits the title heading when no title is given', () => {
    const { container } = render(<Card>body</Card>)
    expect(container.querySelector('h3')).toBeNull()
    expect(screen.getByText('body')).toBeInTheDocument()
  })

  it('applies an extra className', () => {
    const { container } = render(<Card className="custom-class">x</Card>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
