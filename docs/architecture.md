# FLOODLIGHT ARCHITECTURE

Version: 1.0

> Implementation Status: Phases 1–7 COMPLETE. All components are implemented —
> database, API, AI triage + fusion, optimization, prediction, command
> intelligence, WebSockets, offline support, and simulation — with rule-based
> fallbacks where API keys are absent. See [status.md](status.md).

---

# SYSTEM OVERVIEW

Floodlight is an AI-powered disaster operations copilot that transforms citizen flood reports into actionable intelligence for emergency responders.

The system follows a pipeline architecture:

Citizen Report
    ↓
AI Triage
    ↓
Incident Fusion
    ↓
Risk Prediction
    ↓
Optimization Engine
    ↓
Command Intelligence
    ↓
Operations Dashboard

---

# HIGH LEVEL ARCHITECTURE

+----------------------+
| Citizen PWA          |
+----------+-----------+
           |
           v
+----------------------+
| FastAPI API Gateway  |
+----------+-----------+
           |
+----------+-----------+
|                      |
v                      v

AI Engine         Crisis Engine

|                      |

v                      v

Optimization     Database

           |
           v

+----------------------+
| Command Layer        |
+----------+-----------+
           |
           v

+----------------------+
| Operator Dashboard   |
+----------------------+

---

# COMPONENTS

## 1. Citizen Reporting Service

Purpose:
Collect emergency reports.

Inputs:
- Text
- Voice
- GPS
- Images (optional)

Outputs:
Report Object

Responsibilities:
- Validation
- Offline queue
- Sync

---

## 2. AI Triage Service

Purpose:
Determine urgency.

Inputs:
Report

Outputs:
Priority Assessment

Responsibilities:
- STT
- Classification
- Severity Scoring
- Credibility Analysis

Example:

{
  "severity": "P0",
  "credibility": 4,
  "priority_score": 92
}

---

## 3. Incident Fusion Service

Purpose:
Merge duplicates.

Method:

Embedding Similarity +
Geospatial Distance +
LLM Verification

---

Example

5 reports

↓

1 incident

with

5 confirmations

---

## 4. Predictive Escalation Engine

Purpose:
Estimate future risk.

Inputs:
- Existing incidents
- Water levels
- Shelter occupancy

Outputs:
Escalation Score

---

Formula

Risk Score =
(Severity × Weight)
+
(Proximity × Weight)
+
(Trend × Weight)

---

## 5. Optimization Engine

Purpose:
Recommend actions.

Inputs:
- Incidents
- Resources
- Roads
- Shelters

Outputs:
Deployment Plan

---

Algorithms

Dijkstra

A*

Min-Cost Assignment

Weighted Graph Search

---

## 6. Command Intelligence Layer

Purpose:
Answer operational questions.

Examples:

"Which shelter will overflow first?"

"Which rescue unit is overloaded?"

"Which area needs evacuation?"

---

Workflow

Question
↓
Retrieve Context
↓
Retrieve Optimization Results
↓
Gemini Reasoning
↓
Response

---

# EVENT FLOW

Citizen Report Submitted

↓

AI Analysis

↓

Incident Created

↓

Map Updated

↓

Optimization Triggered

↓

Resource Assigned

↓

Dashboard Updated

---

# WEBSOCKET EVENTS

report_created

incident_created

incident_updated

route_generated

resource_assigned

risk_changed

shelter_updated

optimization_complete

---

# SECURITY

Authentication:

JWT

Authorization:

RBAC

Roles:

Citizen

Operator

Commander

Admin

---

# DEPLOYMENT

Frontend:
Vercel

Backend:
Railway

Database:
Neon PostgreSQL

AI:
Gemini API

Optimization:
Python + Wolfram
