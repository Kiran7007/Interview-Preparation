# Android Networking (Retrofit, OkHttp, Location, Realtime) — Senior

### Question

**Retrofit vs AsyncTask** — why Retrofit?

### Answer

- Type-safe API surface; integrates with coroutines/Call adapters; centralizes serialization/interceptors.
- **Link:** https://stackoverflow.com/a/16903205/3424919  

### Key Takeaway

AsyncTask is **obsolete**—structured concurrency + cancellable calls win.

---

### Question

**Retrofit vs Volley**

### Answer

- Retrofit: type-safe, great with OkHttp interceptors.
- Volley: built-in memory/disk cache layers historically stronger by default.
- **Trade-offs:** For greenfield, Retrofit+OkHttp cache patterns are standard.

### Key Takeaway

Discuss **caching** explicitly in interviews.

---

### Question

**Volley advantages** (when it still matters)

### Answer

- Elaborate cache pipeline for some workloads; understand image pipeline legacy.
- **Real-world example:** Maintain legacy module—justify migration plan to OkHttp cache + Coil.

### Key Takeaway

**Migration narrative** > religious wars.

---

### Question

**Multiple network calls** with Retrofit

### Answer

- `async`/`await` + structured concurrency; `zip` in Rx if legacy; rate-limit and backoff at OkHttp layer.
- **Real-world example:** Dashboard aggregating 3 endpoints—use `coroutineScope { awaitAll }` with timeouts.

### Key Takeaway

Always specify **timeout + cancellation** per screen.

---

### Question

**Multipart** and **image upload** with Retrofit 2

### Answer

- `@Multipart`, `MultipartBody.Part`, progress via `CountingRequestBody` patterns.
- **Links:**
  - https://stackoverflow.com/questions/34562950/post-multipart-form-data-using-retrofit-2-0-including-image  
  - https://stackoverflow.com/questions/39953457/how-to-upload-an-image-file-in-retrofit-2  

### Key Takeaway

**Stream large files**—don’t read entire file into heap.

---

### Question

**OkHttp interceptors** — use cases

### Answer

- Auth header injection, logging (debug-only), retry, certificate pinning, metrics.
- **Link:** https://outcomeschool.com/blog/okhttp-interceptor  

### Key Takeaway

Keep **logging interceptor out of release** or scrub aggressively.

---

### Question

**HTTP polling vs WebSocket vs SSE**

### Answer

- Choose based on directionality, infra cost, battery; mobile prefers push + delta sync.
- **Link:** https://outcomeschool.com/blog/http-request-long-polling-websocket-sse  

### Key Takeaway

**Battery + radio** decide transport, not hype.

---

### Question

Continuous **location** like Maps — constraints?

### Answer

- Fused location provider; batching; foreground service when required; privacy disclosures.
- **Link:** https://stackoverflow.com/a/41500910/3424919  

### Key Takeaway

**User trust** + **Google Play policies** are part of design.

---

### Question

**Geofences**

### Answer

- Geofencing API + pending intents; handle unreliable triggers—design confirmation UX.
- **Link:** https://code.tutsplus.com/how-to-work-with-geofences-on-android--cms-26639t  

### Key Takeaway

Treat geofences as **hints**, not guarantees.

---

### Question

**WorkManager vs AlarmManager**

### Answer

- WorkManager for deferrable constraints; exact alarms restricted—use `AlarmManager` only with justification + permissions on newer APIs.
- **AlarmManager:** see Android platform documentation for scheduling semantics.

### Key Takeaway

Default to **WorkManager** for maintenance tasks.

---

### Question

**JobScheduler** / scheduling background work

### Answer

- System merges jobs; declare constraints (charging, unmetered).
- **Link:** http://www.vogella.com/tutorials/AndroidTaskScheduling/article.html  

### Key Takeaway

Batch work to survive **Doze**.
