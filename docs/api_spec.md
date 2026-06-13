# FLOODLIGHT API SPECIFICATION

Version: 1.0

Base URL

/api/v1

> Implementation Status: All 12 endpoints are implemented and responding.
> Endpoints for optimization and command return stub data — real logic in Phase 5.
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

# INCIDENTS

GET /incidents

Returns all incidents.

Response

[
  {
    "id": "INC-001",
    "severity": "P0",
    "priority_score": 91
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

Returns results.

Response

{
  "deployment_plan": []
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

# HEALTH

GET /health

Response

{
  "status": "healthy"
}
