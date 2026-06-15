# FLOODLIGHT API SPECIFICATION

Version: 1.0

Base URL

/api/v1

> Implementation Status: All endpoints implemented with real logic (AI features
> fall back to deterministic rules without API keys). Plus a WebSocket feed.
> Swagger UI available at http://localhost:8000/docs

---

# REPORTS

POST /reports

Create report.

Request

{
  "text": "Water level reached first floor",
  "latitude": 12.98,
  "longitude": 77.72
}

Response

{
  "success": true,
  "report_id": "REP-001"
}

---

GET /reports

Retrieve reports.

Response

[
  {
    "id": "REP-001",
    "severity": "P1"
  }
]

---

POST /reports/voice

Create a report from a voice recording (multipart form). Transcribes the audio
via Whisper, then runs the same triage pipeline. Returns 503 if
`WHISPER_API_KEY` is not configured, 413 if the upload exceeds 25 MB.

Form fields: `latitude`, `longitude`, `audio` (file)

Response

{
  "success": true,
  "report_id": "REP-002"
}

---

# INCIDENTS

GET /incidents

Returns all incidents.

Response

[
  {
    "id": "INC-001",
    "title": "Whitefield rooftop rescues",
    "severity": "P0",
    "priority_score": 91,
    "status": "active",
    "latitude": 12.9698,
    "longitude": 77.75
  }
]

---

GET /incidents/{id}

Returns incident details.

Response

{
  "id": "INC-001",
  "title": "Whitefield Flooding",
  "severity": "P0"
}

---

# RESOURCES

GET /resources

Returns rescue units.

Response

[
  {
    "id": "UNIT-001",
    "status": "AVAILABLE"
  }
]

---

POST /resources/assign

Assign resource.

Request

{
  "resource_id": "UNIT-001",
  "incident_id": "INC-001"
}

Response

{
  "success": true
}

---

# OPTIMIZATION

POST /optimization/run

Triggers optimization.

Response

{
  "success": true,
  "run_id": "OPT-001"
}

---

GET /optimization/{run_id}

Returns results, including the reasoned deployment plan and shelter advice.

Response

{
  "id": "OPT-001",
  "algorithm": "networkx+scipy",
  "deployment_plan": [
    {
      "unit_id": "UNIT-001",
      "incident_id": "INC-001",
      "distance_km": 1.2,
      "eta_minutes": 2,
      "reasoning": "Boat Team Alpha -> P0 incident: assigned at 1.2 km ...",
      "route_coordinates": [[12.97, 77.59], [12.97, 77.75]],
      "route_safe": true
    }
  ],
  "shelter_advice": [
    {
      "name": "Jayanagar Community Complex",
      "occupancy_ratio": 0.96,
      "overflow_risk": 0.96,
      "recommendation": "Near capacity (96%); redirect new arrivals to ..."
    }
  ]
}

---

# SHELTERS

GET /shelters

Returns shelters.

Response

[
  {
    "name": "Shelter A",
    "occupancy": 150,
    "capacity": 200
  }
]

---

GET /shelters/risk

Returns risk predictions.

Response

[
  {
    "name": "Shelter A",
    "overflow_probability": 0.83
  }
]

---

# COMMAND

POST /command/query

Request

{
  "query":
  "Which area is highest risk?"
}

Response

{
  "answer":
  "Whitefield has highest escalation risk."
}

---

# PREDICTION

GET /prediction/risk

Returns forecasted risk zones (clustered active incidents). The projection is
computed by Wolfram when `WOLFRAM_APP_ID` is set, or a local logistic model.

Response

[
  {
    "center_lat": 12.9698,
    "center_lon": 77.75,
    "radius_km": 1.5,
    "risk_score": 99.2,
    "predicted_risk_score": 100.0,
    "escalation_probability": 0.99,
    "incident_count": 3,
    "reasoning": "3 active incident(s); ... Wolfram projects 100 within 45 min."
  }
]

---

# SIMULATION

POST /simulation/run

Injects a scripted "heavy rain" scenario (escalating reports) through the live
triage -> fusion -> WebSocket pipeline. Used for demos and tests.

Response

{
  "success": true,
  "scenario": "heavy_rain",
  "reports_created": 7,
  "report_ids": ["REP-101", "REP-102"]
}

---

# REAL-TIME

WS /ws

WebSocket event feed. The server pushes JSON events as operational data
changes; clients read them to update the map in real time.

Event

{
  "type": "incident_updated",
  "data": { "incident_id": "INC-001", "severity": "P0", "priority_score": 98 },
  "timestamp": "2026-06-15T02:00:00Z"
}

Event types: `report_created`, `incident_created`, `incident_updated`,
`resource_assigned`, `optimization_complete`.

---

# HEALTH

GET /health

Response

{
  "status": "healthy"
}
