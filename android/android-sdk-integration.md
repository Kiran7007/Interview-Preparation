# Android SDK & Third-Party Integration — Senior

### Question

Integrating **Firebase** end-to-end — what do staff engineers watch?

### Answer

- **Realtime Database vs Firestore:** consistency models, offline, security rules complexity.
- **FCM:** token rotation, topic misuse, background delivery changes.
- **Analytics/Crashlytics:** PII boundaries, sampling, dSYM/mapping uploads for deobfuscation.
- **Remote Config:** safe defaults + kill switches.
- **Real-world example (from mock notes):** Banking + clinician apps combining auth, messaging, analytics with compliance constraints.

### Key Takeaway

Firebase is **fast to ship**, hard to **govern** without rules + reviews.

---

### Question

**Google Maps** & geo features at scale

### Answer

- Markers clustering, geofencing, background location policies, billing/API key restriction, snapshot testing for map overlays.
- **Example domains:** banking location services, clinician routing, bus tracking.

### Key Takeaway

**API key restriction** + **Play policy** are non-negotiable.

---

### Question (FAANG)

**Third-party SDK risk management**

### Answer

- Vendor security review, data exfiltration audit (proguard keep rules), init cost on startup, transitive permissions, kill switch via feature flags, SBOM tracking.

### Key Takeaway

Every SDK is **a liability budget**.

---

### Question (FAANG)

**CMS-driven mobile UI** — architecture?

### Answer

- Server-driven UI schema versioning, fallback bundles, incremental sync, signed payloads, strict validation, A/B testing guards, offline cached templates.

### Key Takeaway

Treat CMS payloads like **untrusted input**.

---

### Question

**Play Billing / IAP** (add-on)

### Answer

- Acknowledge purchases, idempotent backend, fraud checks, server notifications—don’t trust client alone.

### Key Takeaway

**Server validation** is the product truth.
