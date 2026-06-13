# FLOODLIGHT DATABASE DESIGN

Database:
PostgreSQL

> Implementation Status: All 8 tables implemented as SQLAlchemy models in `backend/app/models/`.
> Indexes on severity, priority_score, created_at, (lat, lng) are in place.
> Tables auto-created on startup (SQLite fallback). Use Alembic for production.

---

# TABLE: reports

Purpose:
Raw citizen submissions

Columns

id UUID PK

text TEXT

latitude FLOAT

longitude FLOAT

source VARCHAR

created_at TIMESTAMP

severity VARCHAR

credibility INTEGER

status VARCHAR

Indexes

created_at

severity

location

---

# TABLE: incidents

Purpose:
Merged operational incidents

Columns

id UUID PK

title VARCHAR

description TEXT

severity VARCHAR

priority_score INTEGER

status VARCHAR

created_at TIMESTAMP

updated_at TIMESTAMP

location GEOGRAPHY

Indexes

severity

priority_score

location

---

# TABLE: incident_reports

Purpose:
Many-to-many mapping

Columns

incident_id UUID

report_id UUID

---

# TABLE: rescue_units

Columns

id UUID PK

name VARCHAR

type VARCHAR

status VARCHAR

latitude FLOAT

longitude FLOAT

capacity INTEGER

last_updated TIMESTAMP

---

# TABLE: shelters

Columns

id UUID PK

name VARCHAR

capacity INTEGER

current_occupancy INTEGER

latitude FLOAT

longitude FLOAT

risk_score FLOAT

---

# TABLE: routes

Columns

id UUID PK

incident_id UUID

unit_id UUID

distance FLOAT

eta INTEGER

status VARCHAR

created_at TIMESTAMP

---

# TABLE: optimization_runs

Columns

id UUID PK

algorithm VARCHAR

input_snapshot JSONB

result JSONB

created_at TIMESTAMP

---

# TABLE: command_queries

Columns

id UUID PK

query TEXT

response TEXT

timestamp TIMESTAMP

---

# RELATIONSHIPS

reports
   |
   |
   v

incident_reports

   ^
   |
   |

incidents

---

incidents
   |
   |
   v

routes

   ^
   |
   |

rescue_units

---

# INDEXING STRATEGY

Priority Indexes

severity

priority_score

created_at

location

---

# FUTURE TABLES

weather_data

evacuation_zones

drone_feeds

satellite_data

citizen_profiles

government_integrations

Not required for MVP.
