# FLOODLIGHT

Version: 1.0
Project Type: Hackathon MVP
Duration: 7 Days
Track: AI for Social Impact
Team: Boolean Bandits

Tagline:
"Clarity when the water rises."

---

# PROJECT OVERVIEW

Floodlight is an offline-first AI-powered disaster operations copilot designed for urban flood response.

Floodlight transforms chaotic citizen reports into a single operational picture that helps responders:

- Understand the situation
- Prioritize emergencies
- Allocate resources
- Optimize rescue routes
- Monitor shelter capacity
- Make informed decisions

The system is designed around Bengaluru urban flood scenarios.

Floodlight is NOT:

- A chatbot
- A weather app
- A flood prediction platform
- A citizen social network

Floodlight IS:

- An operational intelligence platform
- A crisis coordination system
- A decision support engine
- A resource optimization platform

---

# PRIMARY PRODUCT PHILOSOPHY

The product should answer:

"What should responders do next?"

NOT:

"What happened?"

Floodlight must always move from:

Data → Intelligence → Action

Never:

Data → Dashboard → Human Guessing

---

# CORE PRINCIPLES

## Principle 1

Every feature must support operational decisions.

If a feature does not improve:

- prioritization
- coordination
- optimization
- allocation

it should not exist.

---

## Principle 2

Optimization beats automation.

Floodlight wins because it helps allocate limited resources.

Not because it summarizes text.

---

## Principle 3

Operational Intelligence > Chatbots

Never market Floodlight as:

- AI assistant
- AI chatbot

Always market as:

- Operational Copilot
- Crisis Intelligence Platform
- Decision Support System

---

## Principle 4

One Scenario Done Perfectly

Supported scenario:

Urban Flooding

Primary region:

Bengaluru

Avoid adding:

- earthquakes
- wildfires
- tsunamis
- cyclones

during MVP development.

---

## Principle 5

Visual Clarity Wins

A judge should understand the platform within 15 seconds.

The map is the centerpiece.

Everything else supports the map.

---

# FLOODLIGHT MODULES

## Module 1

Citizen Reporting

Responsibilities:

- Text report intake
- Voice report intake
- GPS attachment
- Offline queueing

Outputs:

Incident object

---

## Module 2

AI Triage Engine

Responsibilities:

- STT transcription
- Classification
- Urgency scoring
- Credibility scoring
- Duplicate merging

Outputs:

Prioritized incident

---

## Module 3

Live Crisis Map

Responsibilities:

- Visualize incidents
- Show rescue units
- Show shelters
- Show blocked roads

Outputs:

Shared operational picture

---

## Module 3.5

Predictive Escalation Engine

Responsibilities:

- Forecast risk
- Predict incident growth
- Estimate shelter overload

Outputs:

Future operational risk

This module is a key differentiator.

---

## Module 4

Optimization Engine

Responsibilities:

- Resource allocation
- Route planning
- Shelter balancing

Outputs:

Action recommendations

---

## Module 5

Command Layer

Responsibilities:

- Operational Q&A
- Situation summaries
- Decision recommendations

Outputs:

Actionable intelligence

---

# NON-GOALS

Do not build:

- Social networking
- Citizen chat
- Real emergency dispatch systems
- Real satellite integration
- Real drone integration
- Heavy ML training
- Custom foundation models

---

# AI DESIGN RULES

All AI must be explainable.

Bad:

"Deploy Boat Team A."

Good:

"Deploy Boat Team A because:
- medical emergency detected
- closest available unit
- shortest safe route
- ETA 5 minutes"

Every recommendation requires reasoning.

---

# AI TRIAGE RULES

Severity Levels:

P0 = Immediate Life Threat

Examples:

- trapped family
- drowning risk
- medical emergency

---

P1 = Critical

Examples:

- stranded citizens
- rapidly rising water

---

P2 = Serious

Examples:

- blocked roads
- moderate flooding

---

P3 = Informational

Examples:

- water accumulation
- traffic disruption

---

# OPTIMIZATION RULES

Optimization must always prioritize:

1. Human life
2. Medical emergencies
3. Rescue efficiency
4. Resource utilization

Never optimize solely for shortest travel distance.

---

# WOLFRAM INTEGRATION RULES

Wolfram is used for:

- graph analysis
- route optimization
- risk scoring
- shelter balancing
- simulations

Wolfram is NOT used for:

- UI logic
- API orchestration
- data storage

---

# USER TYPES

## Citizen

Can:

- submit reports
- attach media
- use offline mode

Cannot:

- view operations dashboard

---

## Operator

Can:

- view map
- view incidents
- view recommendations

---

## Commander

Can:

- ask operational questions
- view predictive analytics
- approve recommendations

---

# UI PRINCIPLES

Design language:

Emergency Operations Center

Avoid:

- playful interfaces
- excessive animations
- gaming aesthetics

Prefer:

- dark dashboards
- high contrast indicators
- operational maps
- concise information

---

# MAP RULES

Map is primary.

Every critical action should be visible on the map.

Map must display:

- incidents
- severity
- rescue teams
- shelters
- flood zones
- optimized routes

---

# ENGINEERING STANDARDS

Language:

Frontend:
TypeScript

Backend:
Python

No JavaScript allowed in frontend.

No inline styles.

No hardcoded API endpoints.

No business logic inside React components.

---

# CODE QUALITY

Every function must:

- have single responsibility
- contain type hints
- include documentation

Maximum preferred function length:

50 lines

Maximum preferred file length:

500 lines

---

# API RULES

REST endpoints:

/reports
/incidents
/resources
/routes
/command
/optimization

Response format:

{
  "success": true,
  "data": {},
  "timestamp": ""
}

---

# DATABASE RULES

Source of truth:

PostgreSQL

Never store operational state only in frontend memory.

---

# LOGGING

All actions must be logged.

Examples:

- report submitted
- incident merged
- route generated
- optimization executed

---

# TESTING REQUIREMENTS

Required:

- API tests
- optimization tests
- route generation tests

Optional:

- UI integration tests

---

# SECURITY

Never expose:

- API keys
- admin endpoints
- optimization internals

All secrets via environment variables.

---

# GIT WORKFLOW

Branches:

main
develop
feature/*

No direct commits to main.

PR required for merge.

---

# HACKATHON PRIORITY ORDER

Priority 1:
Map

Priority 2:
Optimization

Priority 3:
AI Triage

Priority 4:
Command Layer

Priority 5:
Offline Support

If time runs out:

Ship in this order.

---

# SUCCESS METRIC

A judge should be able to say:

"I understand exactly how this helps rescue teams."

within 60 seconds.

If not:

The design is too complicated.

---

END OF CLAUDE.MD