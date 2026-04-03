# Android Storage & Data — Senior

---

### Question

`apply()` vs `commit()` in `SharedPreferences`

### Answer

- **`commit()`** synchronous; returns boolean; can block UI if abused.
- **`apply()`** asynchronous commit; no return; batches writes—preferred for UI thread callers.
- **Interaction:** outstanding `apply()` can block a following `commit()`—document ordering in hot paths.
- **Real-world example:** Feature flags written on main → `apply()`; critical gating config read-back in tests → `commit()` in test doubles only.

### Key takeaway

> Default **`apply()`**; understand **fsync timing** for crash consistency requirements.

---

### Question

What is a **ContentProvider** — when do you still build one?

### Answer

- **Deep explanation:** Cross-process structured data API with URI permissions; integrates with `ContentResolver`.
- **Internal working:** CRUD via URIs; enforce permissions in manifest + runtime checks.
- **Trade-offs:** Heavy boilerplate; prefer app-internal Room for private data; providers shine for **secure sharing** and **CursorLoader-era interop** (legacy).
- **Real-world example:** Sharing patient read-only slices to a partner app under signature permission.

### Useful links

- https://medium.com/@sanjeevy133/an-idiots-guide-to-android-content-providers-part-1-970cba5d7b42  
- Official basics: https://developer.android.com/guide/topics/providers/content-provider-basics  
- Diagram image: `/assets/content-provider-diagram.png`  

### Key takeaway

> Treat providers as **API surfaces** with ACLs.

---

### Question

**Room** — migrations, encryption, testing

### Answer

- Strongly typed SQL; migration tests mandatory; SQLCipher/SQLite encryption options for sensitive domains.
- **Links:** see `android-architecture.md` Room link bundle (official docs + samples).

### Key takeaway

> Ship **migration tests** with every schema bump.

---

### Question

**Scoped storage** & MediaStore strategy

### Answer

- No wholesale file path scanning; use SAF for user files; cache in app-specific dirs.
- **Link:** https://blog.mindorks.com/understanding-the-scoped-storage-in-android  

### Key takeaway

> **User data** vs **app cache** paths drive UX + privacy.

---

### Question

How do you ensure **DB security & integrity** (health/finance examples)?

### Answer

- Encryption at rest, validated schemas, authenticated access, backups encrypted, tamper detection on critical tables, least-privilege content providers.

### Key takeaway

> Pair **client encryption** with **server-side authorization**.
