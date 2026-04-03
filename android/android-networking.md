# Android Networking (Retrofit, OkHttp, Location, Realtime) — Senior

---

### Question

**Retrofit vs AsyncTask** — why Retrofit?

### Answer

**AsyncTask** is deprecated and was never great for **cancellation**, **errors**, or **composition** of multiple calls. **Retrofit** gives you a **typed API** (interfaces), plugs into **OkHttp** (timeouts, interceptors, caching), and works cleanly with **coroutines** or **RxJava**.

### Useful links

- https://stackoverflow.com/a/16903205/3424919  

### Key takeaway

> Prefer **structured concurrency** and **cancellable** network calls—not **AsyncTask**.

---

### Question

**Retrofit vs Volley**

### Answer

**Retrofit** pairs with **OkHttp** and shines when you want **typed endpoints**, **interceptors**, and modern **async** styles. **Volley** historically had a stronger **default cache story** for some workloads.

For **new apps**, Retrofit + OkHttp (with explicit cache policy) is the common default.

### Key takeaway

> In interviews, mention **caching** and **timeouts**, not only “we use Retrofit.”

---

### Question

**Volley advantages** (when it still matters)

### Answer

Older codebases may still use **Volley** for its **request queue** and **memory/disk cache** behavior. If you maintain that code, know **why** it was chosen and have a **migration** story (OkHttp cache, Coil for images, etc.).

### Key takeaway

> A calm **migration plan** beats arguing “our stack is always best.”

---

### Question

**Multiple network calls** with Retrofit

### Answer

With **coroutines**, use **`async`/`await`** or **`coroutineScope { awaitAll(...) }`** so calls run in parallel when safe, and still **cancel** with the same scope. With **RxJava**, **`zip`** is the classic pattern.

Always set **timeouts** and **cancellation** per screen so a slow endpoint does not strand the user.

**Example:** A dashboard that needs three endpoints—launch them together, fail fast with clear UX if one is required.

### Key takeaway

> Every screen should define **timeout + cancellation** for its network work.

---

### Question

**Multipart** and **image upload** with Retrofit 2

### Answer

Use **`@Multipart`** and **`MultipartBody.Part`** for file fields. For **progress**, wrap the request body (e.g. **counting** wrapper) so you can report bytes sent.

### Useful links

- https://stackoverflow.com/questions/34562950/post-multipart-form-data-using-retrofit-2-0-including-image  
- https://stackoverflow.com/questions/39953457/how-to-upload-an-image-file-in-retrofit-2  

### Key takeaway

> **Stream** large uploads—do not read a huge file fully into memory first.

---

### Question

**OkHttp interceptors** — use cases

### Answer

**Interceptors** sit in the OkHttp chain. Common uses: add **auth headers**, **retry** with backoff, **pinning**, **metrics**, and **debug logging** (usually **debug-only** or heavily redacted).

### Useful links

- https://outcomeschool.com/blog/okhttp-interceptor  

### Key takeaway

> Do not ship **verbose logging** of bodies/headers to production without **redaction**.

---

### Question

**HTTP polling vs WebSocket vs SSE**

### Answer

- **Polling:** simple but **wakes the radio** often—bad for battery if frequent.
- **WebSocket:** **two-way** channel; good for chat or live control—needs **reconnect** logic.
- **SSE:** **server → client** stream over HTTP; one-way updates.

Pick based on **direction**, **battery**, and what your **backend** supports.

### Useful links

- https://outcomeschool.com/blog/http-request-long-polling-websocket-sse  

### Key takeaway

> **Battery and radio cost** matter as much as “real-time” buzzwords.

---

### Question

Continuous **location** like Maps — constraints?

### Answer

Use the **Fused Location Provider**, **batch** updates when you can, and use a **foreground service** when the platform requires it for continuous tracking. Be **transparent** in the UI about **why** you need location and respect **Play policy**.

### Useful links

- https://stackoverflow.com/a/41500910/3424919  

### Key takeaway

> Location is **trust + policy + UX**, not only an API call.

---

### Question

**Geofences**

### Answer

**Geofencing** fires when the user enters or leaves regions. Triggers can be **delayed** or **missed** by OS optimization—design **confirmation UX** (e.g. open app to refresh) instead of assuming perfect firing.

### Useful links

- https://code.tutsplus.com/how-to-work-with-geofences-on-android--cms-26639t  

### Key takeaway

> Treat geofences as **best-effort hints**, not hard real-time guarantees.

---

### Question

**WorkManager vs AlarmManager**

### Answer

**WorkManager** is for **deferrable** work with constraints (network, charging). The OS can **batch** it with other jobs—good for sync and cleanup.

**AlarmManager** is for **exact** timing in narrower cases; newer Android versions add **permissions** and restrictions—use only when you truly need it and document **why**.

### Key takeaway

> Default to **WorkManager** for “run later” maintenance tasks.

---

### Question

**JobScheduler** / scheduling background work

### Answer

The system **merges** jobs from many apps to save battery. You declare **constraints** (unmetered network, charging). It is the backbone idea behind **WorkManager** on modern APIs.

### Useful links

- http://www.vogella.com/tutorials/AndroidTaskScheduling/article.html  

### Key takeaway

> Batching helps apps survive **Doze** and **App Standby**.
