import { describe, expect, it } from 'vitest'

import {
  SEVERITY_COLOR,
  UNIT_STATUS_COLOR,
  createDot,
  createPulseMarker,
  popupHtml,
  shelterColor,
} from '../markerStyles'

describe('SEVERITY_COLOR', () => {
  it('maps each severity to the expected dot color', () => {
    expect(SEVERITY_COLOR.P0).toBe('bg-red-500')
    expect(SEVERITY_COLOR.P1).toBe('bg-orange-500')
    expect(SEVERITY_COLOR.P2).toBe('bg-yellow-400')
    expect(SEVERITY_COLOR.P3).toBe('bg-blue-500')
  })
})

describe('UNIT_STATUS_COLOR', () => {
  it('maps unit statuses to colors', () => {
    expect(UNIT_STATUS_COLOR.available).toBe('bg-green-400')
    expect(UNIT_STATUS_COLOR.on_scene).toBe('bg-cyan-400')
    expect(UNIT_STATUS_COLOR.returning).toBe('bg-gray-400')
  })
})

describe('shelterColor', () => {
  it('returns green below 60% occupancy', () => {
    expect(shelterColor(0)).toBe('bg-green-500')
    expect(shelterColor(0.59)).toBe('bg-green-500')
  })

  it('returns amber between 60% and 90%', () => {
    expect(shelterColor(0.6)).toBe('bg-amber-500')
    expect(shelterColor(0.89)).toBe('bg-amber-500')
  })

  it('returns red at or above 90%', () => {
    expect(shelterColor(0.9)).toBe('bg-red-500')
    expect(shelterColor(1)).toBe('bg-red-500')
  })
})

describe('createDot', () => {
  it('creates a div with the color class', () => {
    const el = createDot('bg-red-500')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('bg-red-500')
    expect(el.className).toContain('rounded-full')
  })

  it('appends extra classes', () => {
    const el = createDot('bg-red-500', 'rotate-45')
    expect(el.className).toContain('rotate-45')
  })
})

describe('createPulseMarker', () => {
  it('creates a wrapper with a ping ring and core', () => {
    const el = createPulseMarker('bg-orange-500')
    expect(el.children).toHaveLength(2)
    expect(el.innerHTML).toContain('animate-ping')
    expect(el.innerHTML).toContain('bg-orange-500')
  })
})

describe('popupHtml', () => {
  it('renders the title and rows', () => {
    const html = popupHtml('Incident', [['Severity', 'P0']])
    expect(html).toContain('Incident')
    expect(html).toContain('Severity')
    expect(html).toContain('P0')
  })

  it('escapes HTML special characters', () => {
    const html = popupHtml('<script>', [['key', '<b>&"']])
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('&lt;b&gt;&amp;&quot;')
  })
})
