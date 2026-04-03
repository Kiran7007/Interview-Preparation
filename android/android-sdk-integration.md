# Android SDK & Third-Party Integration — Senior

---

### Question

Integrating **Firebase** end-to-end — what do staff engineers watch?

### Answer

- **Realtime Database vs Firestore:** different **consistency**, **offline**, and **security rules** ergonomics—pick for your **query patterns** and scale.
- **FCM:** **token** rotation, avoid **topic** abuse, know **background delivery** changes by Android version.
- **Analytics / Crashlytics:** **PII** boundaries, **sampling**, upload **mapping/dSYM** so stack traces deobfuscate.
- **Remote Config:** ship **safe defaults** and **kill switches** so bad values do not brick users.

**Example:** Regulated apps combine **auth**, **messaging**, and **analytics** with **compliance** reviews—not “drop in SDK and forget.”

### Key takeaway

> Firebase is **fast to adopt** and **easy to mis-govern** without rules, reviews, and ownership.

---

### Question

**Google Maps** & geo features at scale

### Answer

Plan for **marker clustering**, **geofencing**, **background location** policy, **billing**, and **API key restriction** (by app signing + package). Snapshot or **visual** tests help **map overlays** not drift.

### Key takeaway

> **Lock down API keys** and **respect Play policy**—non-negotiable for maps at scale.

---

### Question (FAANG)

**Third-party SDK risk management**

### Answer

Review **vendor security**, audit **data leaving the device**, measure **startup cost** of SDK init, watch **transitive permissions**, add **feature-flag kill switches**, and track an **SBOM**-style inventory of what you ship.

### Key takeaway

> Every SDK is **risk and bytes**—budget it like headcount.

---

### Question (FAANG)

**CMS-driven mobile UI** — architecture?

### Answer

Treat server payloads as **untrusted**: **version** your schema, ship **fallback** bundles, **sign** or **validate** payloads, support **incremental sync**, and guard **A/B** experiments. **Cache** templates for **offline**.

### Key takeaway

> CMS JSON is **input**—validate, version, and fail safe.

---

### Question

**Play Billing / IAP** (add-on)

### Answer

**Acknowledge** purchases, make the **backend idempotent**, run **fraud checks**, and use **server notifications**—never trust the client as the only source of truth for money.

### Key takeaway

> **Server validation** owns the business truth for purchases.
