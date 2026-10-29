# Changelog

## 1.0.0 — 2026-10-29
First shared build. Rules v1: shared-pool drafting, crews, caps, materials, zones, reputation tiers, HQ, talent fair, bigger events, draw/discard piles, landscape layout, rival AI with turn replay.

Fixes found during the refactor:
- Poach was reusable and could drain the rival's deck to zero. Now one-shot and floor-respecting.
- One-shot cards (Site Office, Crane, Poach) removed the wrong card when they carried an Expediter charm, leaving Site Office in play forever. Now removed explicitly.
