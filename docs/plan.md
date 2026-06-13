# FLOODLIGHT
## Implementation Blueprint & Technical Execution Plan

Version: 1.0
Hackathon Duration: 7 Days
Track: AI for Social Impact
Team Size: 4
Project Name: Floodlight

Tagline:
"Clarity when the water rises."

> Implementation Status: Phase 1 & 2 COMPLETE. See [status.md](status.md) for full progress.
> Backend is operational. Frontend is scaffolded. Optimization stubs are in place.

---

# 1. PROJECT VISION

Floodlight is an offline-first AI-powered disaster operations copilot for urban flood response.

Its purpose is to help emergency responders:

- understand unfolding situations
- prioritize emergencies
- allocate limited resources
- optimize rescue routes
- predict operational bottlenecks
- coordinate effectively during floods

The MVP focuses exclusively on:

Bengaluru Urban Flood Scenario

---

# 2. SUCCESS CRITERIA

A judge should be able to understand:

1. What problem is solved
2. Why current systems fail
3. How Floodlight improves response
4. How AI is actually useful
5. Why optimization matters

within 2 minutes.

---

# 3. MVP SCOPE

## Included

✓ Citizen reporting

✓ AI triage

✓ Duplicate incident fusion

✓ Live crisis map

✓ Rescue optimization

✓ Shelter capacity management

✓ Command intelligence

✓ Offline queueing

✓ Predictive escalation

---

## Excluded

✗ Satellite imagery

✗ Real weather feeds

✗ Real emergency dispatch integration

✗ Drone systems

✗ Mesh networking

✗ Large-scale ML training

✗ Multi-disaster support

---

# 4. SYSTEM ARCHITECTURE

┌──────────────────────┐
│ Citizen PWA          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ FastAPI Gateway      │
└──────────┬───────────┘
           │
 ┌─────────┼─────────┐
 ▼         ▼         ▼

AI      Crisis     Optimization
Engine  Engine      Engine

 ▼         ▼         ▼

Gemini   PostgreSQL Wolfram
Whisper  Redis      NetworkX

           │
           ▼

┌──────────────────────┐
│ Command Layer        │
└──────────┬───────────┘
           │
           ▼

┌──────────────────────┐
│ Operator Dashboard   │
└──────────────────────┘

---

# 5. FRONTEND STACK

React
TypeScript
Vite
TailwindCSS
Mapbox GL JS
Framer Motion
TanStack Query
Zustand

---

# 6. BACKEND STACK

Python 3.12

FastAPI

WebSockets

Pydantic

SQLAlchemy

PostgreSQL

Redis (Optional)

NetworkX

Wolfram Client

---

# 7. AI STACK

Gemini API

Used For:

- report understanding
- urgency reasoning
- command assistant
- operational explanations

---

Whisper

Used For:

- voice transcription

---

Embeddings

Used For:

- duplicate detection
- incident clustering

---

# 8. DATABASE SCHEMA

## reports

id

created_at

report_type

text

latitude

longitude

status

source

severity

credibility

---

## incidents

id

title

description

severity

location

status

merged_reports

priority_score

created_at

updated_at

---

## rescue_units

id

name

unit_type

status

current_lat

current_lng

capacity

availability

---

## shelters

id

name

capacity

current_occupancy

latitude

longitude

risk_level

---

## routes

id

incident_id

unit_id

eta

distance

status

---

## optimization_runs

id

timestamp

algorithm

input_snapshot

result

---

# 9. FRONTEND STRUCTURE

src/

components/

maps/

dashboard/

incidents/

resources/

shelters/

command/

offline/

ui/

pages/

CitizenPortal/

OperationsDesk/

Admin/

services/

api/

websocket/

state/

hooks/

types/

utils/

---

# 10. BACKEND STRUCTURE

app/

api/

reports.py

incidents.py

resources.py

optimization.py

command.py

services/

triage/

optimization/

prediction/

command/

offline/

database/

models/

schemas/

utils/

prompts/

tests/

---

# 11. MODULE 1

CITIZEN REPORTING

Features:

Text report

Voice report

GPS capture

Offline queue

Image upload (optional)

---

Workflow

Citizen submits report

↓

Stored locally if offline

↓

Synced when online

↓

Backend receives

↓

AI Triage

---

# 12. MODULE 2

AI TRIAGE ENGINE

Inputs

Voice

Text

Location

Image (optional)

---

Outputs

Severity

Credibility

Priority

Category

---

Severity Logic

P0

Life threatening

P1

Critical

P2

Major

P3

Informational

---

Example Prompt

Analyze flood emergency report.

Return:

{
 severity,
 credibility,
 summary,
 category,
 reasoning
}

---

# 13. INCIDENT FUSION

Purpose

Merge duplicate reports.

Example

5 reports:

"Water rising in Whitefield"

↓

1 incident

with

5 confirmations

---

Implementation

Embedding similarity

+

GPS proximity

+

LLM validation

---

# 14. MODULE 3

LIVE CRISIS MAP

Layers

SOS Reports

Rescue Teams

Blocked Roads

Shelters

Flood Zones

Routes

Predicted Risk Zones

---

Mapbox Features

Markers

Polylines

Heatmaps

Live Updates

---

# 15. MODULE 3.5

PREDICTIVE ESCALATION

Purpose

Forecast worsening areas.

---

Inputs

Current incidents

Road status

Shelter occupancy

Flood level

Time

---

Outputs

Risk score

Escalation probability

Predicted overload

---

Example

Zone 4

Current Risk:
72

Predicted:
91

Time:
45 mins

---

Implementation

Rule-based forecasting

Weighted risk model

Wolfram simulation

---

# 16. MODULE 4

OPTIMIZATION ENGINE

Core Differentiator

---

Inputs

Incidents

Units

Roads

Shelters

Risk

---

Outputs

Deployment plan

Safe routes

Resource assignments

---

Algorithms

Dijkstra

A*

Weighted Graph Search

Min Cost Assignment

---

NetworkX

Generate graph

Compute shortest safe route

---

Wolfram

Risk simulation

Resource optimization

Shelter balancing

---

# 17. SHELTER MANAGEMENT

Track

Current occupancy

Maximum capacity

Predicted arrivals

---

Predict

Overflow risk

Time to saturation

Alternative shelter

---

# 18. MODULE 5

COMMAND INTELLIGENCE

Purpose

Operational decision support

---

Examples

Which area is highest risk?

Which shelter will overflow?

Which rescue team is overloaded?

---

Workflow

Query

↓

Data retrieval

↓

Optimization results

↓

LLM reasoning

↓

Response

---

# 19. WEBSOCKET EVENTS

report_created

incident_updated

route_generated

resource_assigned

shelter_updated

risk_changed

optimization_complete

---

# 20. OFFLINE SUPPORT

Citizen App

Use:

IndexedDB

Service Workers

---

Capabilities

Store reports

Retry sync

Background queue

---

Operator Dashboard

Cache last state

Display degraded mode

---

# 21. TEAM ALLOCATION

MEMBER 1

AI/NLP

Whisper

Gemini

Severity Engine

Command Layer

---

MEMBER 2

Optimization

NetworkX

Wolfram

Routing

Prediction

---

MEMBER 3

Frontend

React

Mapbox

Dashboard

UI

---

MEMBER 4

Backend

FastAPI

Postgres

WebSockets

Deployment

---

# 22. IMPLEMENTATION TIMELINE

DAY 1

Project Setup

Database

Backend Skeleton

Frontend Skeleton

Map Setup

---

DAY 2

Citizen Reporting

Whisper Integration

Gemini Triage

Report Storage

---

DAY 3

Incident Fusion

Live Map

WebSockets

Severity Visualization

---

DAY 4

Optimization Engine

NetworkX

Route Planning

Resource Assignment

---

DAY 5

Wolfram Integration

Risk Scoring

Shelter Prediction

Escalation Layer

---

DAY 6

Command Layer

Offline Support

UI Polish

Testing

---

DAY 7

Simulation

Performance

Bug Fixes

Presentation

Demo Recording

---

# 23. TEST PLAN

Unit Tests

Severity Scoring

Route Generation

Optimization Logic

Shelter Prediction

---

Integration Tests

Report Flow

Incident Merge

Resource Assignment

Command Query

---

End-to-End Tests

Citizen Report

↓

Incident

↓

Optimization

↓

Dispatch

---

# 24. DEMO SCRIPT

Scene 1

Heavy Rain Simulation

---

Scene 2

Citizen Voice Report

"Water at second floor, elderly trapped."

---

Scene 3

AI Triage

P0

Credibility 5/5

---

Scene 4

Incident Appears

Map updates

---

Scene 5

Optimization

Rescue Team Assigned

Safe Route Generated

---

Scene 6

Risk Escalation

Nearby area predicted critical

---

Scene 7

Command Query

Which shelter may exceed capacity next?

---

Scene 8

AI Response

Specific recommendation

---

Scene 9

Offline Demonstration

Disconnect network

Queue reports

Reconnect

Sync automatically

---

# 25. JUDGING STRATEGY

Emphasize:

Not a chatbot

Not a dashboard

Not a flood warning system

---

Positioning

AI-Powered Disaster Operations Copilot

---

Core Differentiators

1. Operational Intelligence

2. Resource Optimization

3. Predictive Escalation

4. Offline Resilience

5. Wolfram-Powered Decision Support

---

# 26. FUTURE ROADMAP

Cyclone Response

Wildfire Response

Earthquake Response

Satellite Integration

Drone Coordination

Mesh Networking

Government API Integration

Digital Twin Simulation

Multi-City Deployment

---

# FINAL MVP DEFINITION

If time becomes limited:

Ship:

1. Reporting
2. AI Triage
3. Live Map
4. Optimization
5. Command Query

Everything else is secondary.

Winning comes from a polished end-to-end operational workflow, not from feature count.