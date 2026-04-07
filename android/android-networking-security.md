# Android Networking, Security & Data — Senior

## Networking (Retrofit, OkHttp, APIs)

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

**OkHttp `Interceptor` vs `Authenticator`** — when do you refresh tokens, and how do you avoid **infinite 401 loops**?

### Answer

**Interceptors** run on **every** request/response and are ideal for **adding** headers (e.g. `Authorization: Bearer …`), **logging** (redacted), **metrics**, and **generic** retries you fully control.

**`Authenticator`** is invoked when a response is **unauthorized** (typically **401**) so you can **obtain a new access token** and **retry the failed request** with a fresh header—this keeps **refresh** logic **centralized** instead of scattering it across call sites.

**Production safeguards:**  
- **Single-flight refresh:** if ten calls get 401, only **one** refresh runs (mutex / synchronized / actor); others await the same result.  
- **Retry cap:** if refresh fails or the **same** request already retried once, **stop**—return **`null`** from `Authenticator` or bubble **logout**.  
- **Detect auth loops:** track **`responseCount`** / custom flag so you never apply a **new** token to the **same** failing endpoint forever.

**OkHttp cache:** attach a **`Cache`** to the client for **GET** responses honoring **`Cache-Control`** / **`ETag`**; separate **auth** from **cache policy** (many APIs disable caching on private resources).

### Key takeaway

> Use **`Authenticator`** for **401 refresh**, **`Interceptor`** for **always-on** headers; **single-flight** refresh + **hard stop** prevents **retry storms**.

---

### Question

**Certificate pinning** with OkHttp — what breaks in production?

### Answer

Pin **SPKI hashes** (not only full cert) when possible and plan **rotation** (multiple pins, overlap with backend). A bad pin bricks **all** installs until an app update—**monitor** TLS changes and keep an **escape hatch** (remote config to disable pinning only if your threat model allows).

### Key takeaway

> Pinning is **strong MITM defense** with **operational risk**—design **rotation**, not a single hash forever.

---

### Question

**Networking layer** with Retrofit — how do you wire **Clean Architecture** end-to-end?

### Answer

**UI** → **ViewModel** → **use case** (optional) → **repository** → **remote data source** (Retrofit service) backed by a **shared `OkHttpClient`**. The UI never sees **Retrofit** types; the repository maps **DTO → domain** and decides **cache vs network**. One **`OkHttpClient`** (timeouts, interceptors, cache, SSL) can feed **multiple `Retrofit` instances** only when **base URLs** truly differ—usually inject a **single** Retrofit via **DI**.

### Key takeaway

> **Repository** owns **policy**; **Retrofit** is a **transport** detail behind an interface.

---

### Question

**Retrofit** — why return **`Response<T>`** (or **`Result`**) instead of bare **`T`**?

### Answer

**`Response<T>`** exposes **HTTP status**, **headers**, and **error body**—needed when **200 ≠ business success** (envelope: `{ "success": false, "errorCode": "…" }`). Parse the body in the **data layer** and map to **`Result`/sealed** types; never push **raw HTTP** exceptions to Compose.

### Code example

```kotlin
@GET("user/{id}")
suspend fun getUser(@Path("id") id: String): Response<UserDto>
```

### Key takeaway

> Fintech and enterprise APIs often **lie in the body**—the **status code** is not enough.

---

### Question

**Application** vs **network** **interceptors** — when does each run?

### Answer

**Application interceptors** see the request first and the response last—good for **auth headers**, **logging**, **metrics**. **Network interceptors** sit closest to the wire—good for **rewriting cache headers**, **SSL pinning** visibility, sometimes **retry** (use carefully). **Token refresh** belongs in **`Authenticator`** (401 path) with **single-flight**, not an unbounded **interceptor** loop—see earlier **`Authenticator`** card.

### Key takeaway

> **Add headers** early; **pin/cache at the network edge**; **refresh** via **`Authenticator`**, not spaghetti **intercept** chains.

---

### Question

How do you **map API errors** for the UI (without leaking **Retrofit**)?

### Answer

Catch **`IOException`** (no network), **`HttpException`** (4xx/5xx), **parse timeouts**, and map to a **domain sealed** type (`NoNetwork`, `Timeout`, `ApiError(code, message)`, `Unknown`). **Repository** returns **`Result`** or **`Flow`** of domain states; **ViewModel** turns that into **`UiState`**. For **business errors** inside **200**, parse the envelope and emit **`DomainError.InsufficientBalance`** etc.

### Key takeaway

> One **mapping function** at the repository boundary keeps **UI** stable when **transport** changes.

---

### Question

**Offline caching** — **OkHttp `Cache`** vs **Room** as **source of truth**?

### Answer

**OkHttp `Cache`** respects **`Cache-Control`** / **CDN**—great for **short-lived GET** assets and **reducing** duplicate calls; it is **opaque** (no queries) and lives under **app cache** eviction. **Room** (or DataStore) gives **structured** offline data, **pagination**, **search**, and **migrations**—typical pattern: **Room = SSOT** for user-meaningful data; **OkHttp cache** as an **optional** HTTP layer. **Private** responses with **sensitive** data often use **`Cache-Control: no-store`** and cache **only** in **encrypted** storage you control.

### Key takeaway

> **HTTP cache** = quick **GET** reuse; **Room** = **product** offline behavior.

---

### Question

**Pagination** with Retrofit — **`PagingSource`** and duplicate loads?

### Answer

Use **backend-driven** pages or **cursors** (prefer **cursor** when lists are huge/unstable). **`PagingSource`** loads **`LoadParams`** and returns **`LoadResult.Page`**; **Paging 3** manages **prefetch** and **invalidation**. Avoid **double fetches** by not firing **manual** loads while **`LoadState`** is **`Loading`**, and design **idempotent** APIs where **retry** is safe.

### Key takeaway

> **Paging library** + **stable keys** beat hand-rolled “page++” **race** bugs.

---

### Question

**Retry** — what is safe to retry, and what is **never** retried blindly?

### Answer

**Retry** (with **backoff** and **max attempts**): **timeouts**, **DNS/transient** failures, some **5xx** **GET**/**idempotent** reads. **Do not** blindly retry **POST** **payments** or **non-idempotent** writes—**double submit** risk; **4xx** (**401** aside from one **refresh** path) usually **no**. Prefer **idempotency keys** on the **server** if the client must **retry** money flows.

### Key takeaway

> **Retry** is a **business** decision for **writes**—default **off** for **payments**.

---

### Question (behavioral)

**STAR** — “**backend returned 200 but payment failed**”?

### Answer

Tell a **true** story: how you **detected** envelope parsing, **stopped** false retries, **aligned** with backend on **codes**, and **measured** outcome. Avoid **invented** “**30%**” metrics unless they are **yours**.

### Key takeaway

> Interviewers want **instrumentation + contract** fixes, not **blame**.

---

## Security & API Hardening

---

### Question

Why **SSL certificate pinning** — and how does it work?

### Answer

**Pinning** means your app remembers the **expected server certificate** (or public key hash) and **rejects** connections if someone presents a different one—even if a **rogue certificate authority** on a compromised device would otherwise trust it.

You configure pins in the network stack (for example **OkHttp `CertificatePinner`**). You need a **rotation plan**: **backup pins** and a way to **update** pins (remote config, app update) so you do not brick clients when certs change.

**Example:** Banking apps often pin API gateways while still keeping **normal TLS** hygiene and **auth** strong.

### Useful links

- https://medium.com/@anuj.rai2489/ssl-pinning-254fa8ca2109  
- https://dzone.com/articles/encryption-and-signing  
- https://www.netguru.com/codestories/3-ways-how-to-implement-certificate-pinning-on-android  
- https://www.raywenderlich.com/10056112-securing-network-data-tutorial-for-android  
- https://appmattus.medium.com/android-security-ssl-pinning-1db8acb6621e  

### Key takeaway

> Pinning is **extra defense**—it does not replace **good auth** and **solid server design**.

---

### Question

**Symmetric vs asymmetric encryption** — where does each belong?

### Answer

**Symmetric** encryption uses one shared key; it is **fast** for bulk data but you must solve **how both sides get the key safely**. **Asymmetric** uses a public/private pair—great for **key exchange** and **signatures**, slower for huge payloads.

Real systems (like **TLS**) are usually **hybrid**: asymmetric to set up a session, symmetric for the heavy lifting.

### Useful links

- https://youtu.be/AQDCe585Lnc  

### Key takeaway

> Production setups are almost always **hybrid**, not “only RSA” or “only AES.”

---

### Question

How do you **encrypt data in Java/Android**?

### Answer

Use **`javax.crypto.Cipher`** with a **modern mode** (prefer **AEAD** such as **GCM**), a **random IV** every time, and **keys you do not hardcode** in source. Store keys in **Android Keystore** when possible.

### Useful links

- https://github.com/vamsitallapudi/Coderefer-Java-Projects/commit/443c4f7700fd68391da2ccf40f85a7e3bccd573d#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26  

### Key takeaway

> **Mode + IV + key storage** matter more than naming a cipher on slides.

---

### Question

**Android Keystore** — how do you store passwords/secrets?

### Answer

Put **keys** in the **Android Keystore** so raw key material is harder to extract. For **small secrets** at rest, use **EncryptedSharedPreferences** or **EncryptedFile** (AndroidX Security) instead of **plain SharedPreferences**.

### Useful links

- https://developer.android.com/privacy-and-security/keystore  
- https://medium.com/@josiassena/using-the-android-keystore-system-to-store-sensitive-information-3a56175a454b  
- https://source.android.com/docs/security/features/keystore  
- https://www.linkedin.com/feed/update/urn:li:activity:7240434808684716032/  
- https://blog.mindorks.com/how-to-encrypt-data-safely-on-device-and-use-the-androidkeystore  

### Key takeaway

> Keep **keys out of app data dirs**; add **biometric / passcode** gates when the threat model says so.

---

### Question

Detecting **rooted/tampered** devices?

### Answer

**Heuristics** (e.g. **`su`**, unusual partitions) plus libraries like **RootBeer** can hint at **root** or **tampering**. Expect **false positives** and **false negatives**—many teams treat this as **risk scoring** on the server, not a hard block, unless policy requires otherwise.

### Useful links

- https://github.com/scottyab/rootbeer  
- https://stackoverflow.com/a/35628977/3424919  

### Key takeaway

> Root detection is usually **risk scoring**, not a perfect gate.

---

### Question

**Permission protection levels** (`normal`, `dangerous`, `signature`, `signature|privileged`)

### Answer

- **Normal:** granted at install; low risk.
- **Dangerous:** needs **runtime** prompt and a **clear UX** reason.
- **Signature / privileged:** for **same signing key** or **system** partners—not for random third-party apps.

Know the difference between **`<uses-permission>`** (your app requests) and declaring a **custom `<permission>`** for other apps.

### Useful links

- https://stackoverflow.com/questions/14450839/uses-permission-vs-permission-for-android-permissions-in-the-manifest-xml-file  

### Key takeaway

> **Dangerous** permissions need **user trust** and a **fallback** if denied.

---

### Question (FAANG add-on)

**WebView** security checklist

### Answer

Treat **WebView** like a small browser: **disable JavaScript bridges** you do not need, **validate** URLs before loading, avoid **mixed content**, **update** WebView/System WebView, and keep **file access** off unless required.

### Key takeaway

> WebView is a **real attack surface**—lock it down by default.

---

### Question (FAANG add-on)

**Supply chain security** for Gradle dependencies

### Answer

Use **dependency locking** or reproducible resolution, verify **checksums** where possible, **private** artifact repos, bots for **updates**, and treat **R8 mapping** as sensitive. Know what **transitive** libraries you ship.

### Key takeaway

> Your **dependency graph** is part of the **threat model**.

---

### Question

**Layered defense** — how do you protect **sensitive data** at rest, in memory, and in transit?

### Answer

**In transit:** **HTTPS** only, **TLS** modern config, **`networkSecurityConfig`** to block **cleartext**; consider **pinning** for high-risk apps. **Tokens** short-lived; **refresh** on server patterns you trust.

**At rest:** no secrets in **plain** `SharedPreferences` or world-readable files—**EncryptedSharedPreferences** / **EncryptedFile** (AndroidX Security) with **Keystore-backed** keys; **Room** encryption (**SQLCipher** / supported APIs) when the DB holds **PII**.

**In memory:** avoid logging **tokens**; clear **sensitive** buffers when done; be careful with **screenshots** on sensitive screens (`FLAG_SECURE`) in regulated UX.

**Third-party SDKs:** they often cause **leaks**—audit **data collection**, **init** timing, and **ProGuard** rules.

### Key takeaway

> Security is **layers**—**TLS + encrypted storage + no logging + SDK audit**, not one checkbox.

---

### Question

Can you **stop reverse engineering** of an Android app?

### Answer

You **cannot** make an APK impossible to inspect—you **raise cost**: **R8/ProGuard** (real rules, tested on release), **remove debug logs** in release, **no hardcoded secrets** (assume extraction), **server-side** validation of business rules, optional **tamper / signature checks** for **high-risk** apps knowing **false positives**.

### Key takeaway

> Goal is **deterrence + server truth**, not **perfect secrecy** on the client.

---

### Question

**Android Keystore** — **KeyMint/Keymaster**, **TEE**, **StrongBox**, and how do you know a key is **hardware-backed**?

### Answer

Keystore is an API over **KeyMint/Keymaster**; crypto may run in **software**, **TEE**, or **StrongBox** (dedicated chip). **Hardware-backed** means key material does not leave that boundary for **private** ops. **Do not assume:** query **`KeyInfo.isInsideSecureHardware`** (and **StrongBox** availability if you require it) after creation; **telemetry** fragmentation on low-end devices. **Trade-off:** HW keys can be **slower** and **limited** count; handle **fallback** product policy.

### Key takeaway

> **Verify** backing—Android may **silently** use **software**.

---

### Question

**Keystore** mistakes and **biometric** / **lock screen** changes?

### Answer

Storing **tokens** in **plain** prefs; treating Keystore as “**storage**” instead of **crypto provider**; ignoring **invalidation**. Keys can be **invalidated** when biometrics **re-enroll** or policy changes—expect **`KeyPermanentlyInvalidatedException`**, **delete** alias, **wipe** dependent ciphertext, **force** re-auth. Use **`setInvalidatedByBiometricEnrollment`** / **`setUserAuthenticationRequired`** when product demands **step-up**.

### Key takeaway

> Keys can **disappear**—design **recovery**, not **crash**.

---

### Question

**OAuth2 + PKCE** and **JWT** on mobile — what does the **client** actually do?

### Answer

Prefer **authorization code + PKCE** for third-party IdPs. **JWT** is often just the **access token shape**—**do not** “verify signature” with **embedded secrets** on device (secrets **extract**); **trust** **exp**/**nbf** only for **UX** hints, **enforce** authorization **server-side**. **Store** tokens in **EncryptedSharedPreferences** or equivalent (**android-storage.md**); **refresh** via **OkHttp `Authenticator`** with **single-flight** (**android-networking.md**). **Refresh failure** → **clear** session, **login** again—no **silent** loops.

### Key takeaway

> Mobile client is **not** a **JWT authority**—**backend** is.

---

### Question

**MITM** beyond **TLS** — what layers do high-risk apps add?

### Answer

**Certificate pinning** (with **backup pins**—see earlier card). Optional **request signing** (**HMAC**, **nonce**, **timestamp**) for **anti-replay**—**server** validates. **Device binding** / **integrity** signals (**Play Integrity**) feed **risk** decisions **server-side**. **Cleartext** blocked in **`networkSecurityConfig`**.

### Key takeaway

> **TLS** is **baseline**, not the whole **fraud** story.

---

### Question

**HTTP caching** for **authenticated** APIs — rules?

### Answer

Use **`Cache-Control: no-store`** (or equivalent) on **auth** and **PII** responses when **OkHttp** disk cache is enabled; **never** cache **refresh** endpoints. For **safe** public **GET**s, respect **server** **ETag**/**max-age**. **Sensitive** offline copies belong in **encrypted** storage you control, not **shared** HTTP cache dirs.

### Key takeaway

> **Disk cache** = **another** data store—**classify** endpoints.

---

### Question

**Exported** components — common **attack** surface?

### Answer

**Services**, **receivers**, **activities** with **`exported=true`** (or **implicit** intents) can be **invoked** by other packages—**default** **`exported=false`** unless needed; **permission**-protect **IPC**; **explicit** intents. **Deep links** validate **hosts/paths**; **WebView** **URL** allowlists.

### Key takeaway

> Every **export** is a **mini public API**—review like one.

---

### Question

**APK tampering** and **integrity** — beyond **root** checks?

### Answer

**Play Integrity** / **SafetyNet** era patterns: **integrity** verdicts for **high-value** flows; **signature** checks for **debug** / **unexpected** installers where policy allows. **Expect** bypass on **root**—combine with **server** **risk** scoring, not **client-only** **block** unless compliance demands.

### Key takeaway

> **Client integrity** is **signal**, not **proof**.

---

### Question

**Permissions** — secure **runtime** habits?

### Answer

**Just-in-time** requests with **clear** rationale; **re-check** before **sensitive** ops (user can **revoke** in settings); **degrade** gracefully. **Custom** permissions for **signature** **partners** only with **clear** docs.

### Key takeaway

> **Grant** state is **volatile**—never **cache “forever granted”** in your head.

---

### Question (TL)

**Android security strategy** in one **layered** picture?

### Answer

**Keystore** + **encrypted** prefs/files/DB → **TLS** + optional **pinning** → **minimal** **secrets** on device → **R8** + **runtime** **hardening** where justified → **logout** and **revocation** → **manifest** **hygiene** → **server** **truth** for **money** and **authorization**. **Blast radius** reduction beats **perfect** **client**.

### Key takeaway

> Say **layers + failure modes**—staff interviews reward **honesty** about **limits**.

---

### Question (interview framing)

**Google vs Amazon vs fintech** — how do you **pitch** the same fact?

### Answer

**Google-style:** go **deeper** on **internals** (Keystore, cipher modes, **why** not verify JWT locally). **Amazon-style:** **STAR** with **your** **incident** and **owned** metrics. **Fintech-style:** **threat** walkthrough (**replay**, **MITM**, **repackaged** APK)—**mitigation** + **server** role. **Do not** memorize **fake** **PCI**/**audit** outcomes.

### Key takeaway

> Match **depth**, **story**, or **attack** lens to the **panel**—same **engineering**, different **packaging**.

---

## Storage & Data Persistence

---

### Question

`apply()` vs `commit()` in `SharedPreferences`

### Answer

**`commit()`** writes **right away** (blocking) and returns **true/false** so you know if disk write succeeded. **`apply()`** saves **in the background**—better when you are on the **main thread** and do not need an immediate result.

If an **`apply()`** is still in flight and you call **`commit()`**, the **`commit()`** can **wait**—worth knowing in hot paths.

**Example:** Feature flags toggled from the UI → usually **`apply()`**. Tests that must read back immediately might use **`commit()`** in test doubles.

### Key takeaway

> Prefer **`apply()`** for normal UI saves; know **`commit()`** when you need a **confirmed** write.

---

### Question

What is a **ContentProvider** — when do you still build one?

### Answer

A **ContentProvider** exposes **structured data** to other processes through **`content://` URIs** with **permissions**. The system routes queries/updates through **`ContentResolver`**.

They are **verbose** to build. For **data only your app uses**, **Room** is simpler. Providers still matter when you **share data securely** with another app or need the old **CursorLoader**-style patterns.

**Example:** Read-only health data shared with a partner app under a **signature-level** permission.

### Useful links

- https://medium.com/@sanjeevy133/an-idiots-guide-to-android-content-providers-part-1-970cba5d7b42  
- https://developer.android.com/guide/topics/providers/content-provider-basics  
- Diagram: `/assets/content-provider-diagram.png`  

### Key takeaway

> Think of a provider as a **small public API** with **access control**, not “free database.”

---

### Question

**Room** — migrations, encryption, testing

### Answer

**Room** is SQLite with **compile-time query checking** and **migration** APIs. **Ship a migration test** whenever you bump the schema. For sensitive domains, consider **SQLCipher** or other **encryption** options on top of SQLite.

### Useful links

- See Room link bundle in `android-architecture.md` (official docs + samples).

### Key takeaway

> Every **schema change** should include a **migration test**.

---

### Question

**Scoped storage** & MediaStore strategy

### Answer

Avoid assuming **full filesystem** access. Use **MediaStore** for shared media, **SAF** when the user picks files, and **app-specific** directories for caches and internal files.

### Useful links

- https://blog.mindorks.com/understanding-the-scoped-storage-in-android  

### Key takeaway

> Separate **user-visible files** from **app-private cache**—privacy and UX depend on it.

---

### Question

How do you ensure **DB security & integrity** (health/finance examples)?

### Answer

Use **encryption at rest** when required, **validate** inputs and schemas, enforce **auth** on the server (never trust the client alone), **encrypt backups**, and use **least privilege** for any shared providers.

### Key takeaway

> **Client-side encryption** pairs with **server authorization**—one without the other is weak.

---

### Question

**Local storage threat model** — why is “app sandbox” not enough for **fintech / health**?

### Answer

Assume **root**, **backup extraction**, **physical access**, **malware**, and **debuggable** builds. **Plaintext** prefs/files, **HTTP cache** of **PII**, and **world-readable** paths are common leaks. **Defense:** encrypt **meaningful** data, **disable** risky **backup** for sensitive prefs, treat **cache** as **untrusted**.

### Key takeaway

> **Sandbox** stops normal apps—not **compromised** devices or **misconfig**.

---

### Question

**EncryptedSharedPreferences** — when and how (Jetpack Security)?

### Answer

For **small** secrets (tokens, flags) under ~**1–2 MB** total. **MasterKey** lives in **Android Keystore**; values use **AES-GCM** with random IVs; **keys** of entries use **SIV-style** deterministic encryption for lookup. **Slower** than plain prefs—do not store **large** blobs. **Never** log values.

### Code example

```kotlin
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val securePrefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
)
```

### Key takeaway

> Jetpack Crypto = **Keystore-wrapped keys** + **AES**—not a separate “magic vault.”

---

### Question

**Room + SQLCipher** (or encrypted SQLite) — pattern?

### Answer

Default **Room** DB file is **readable** if extracted. **SQLCipher** (or vendor equivalent) encrypts the **file**; passphrase often derived from **Keystore** material you control—**never** hardcode in APK. **Migrations** still required; **logout** may **wipe** DB or **drop** tables for zero-trust. Test **migration** + **open** on **low-RAM** devices.

### Key takeaway

> **Encrypted DB** + **server auth** = depth; neither replaces the other.

---

### Question

**EncryptedFile** for sensitive **PDFs / exports**?

### Answer

Use **`EncryptedFile`** (AES-GCM, HKDF chunking) under **`filesDir`**, not **world-readable** external storage. **Delete** temp files after **share/upload**; **clear** on **logout**.

### Key takeaway

> Encrypt **before** write; assume **copied** files are **hostile** if plaintext.

---

### Question

**Cache vs persistent** — what never belongs in **cache**?

### Answer

**Http** / **image** / **Coil** caches can hold **tokens**, **account numbers**, **PHI** in JSON—**TTL**, **encryption**, or **exclude** sensitive endpoints. **Logout:** `cacheDir` cleanup (and **coil**/`OkHttp` cache **evict** where applicable). **Persistent** structured data → **Room** with policy; **sensitive** → **encrypted**.

### Key takeaway

> **Cache is readable**—design as if **postmortem** includes **strings** dump.

---

### Question

**Secure logout** — what do you clear, and `apply()` vs `commit()`?

### Answer

**Server** revoke **refresh** first when possible; then **clear** **EncryptedSharedPreferences** (`commit()` if you must **guarantee** disk before showing logged-out UI), **delete** **Keystore** keys you use for local crypto, **clear** **Room**/encrypted DB or **user** tables, **cancel** **WorkManager** user jobs, **wipe** **cache**, drop **in-memory** singletons holding **PII**. **Partial** logout = **session restore** bugs and **audit** failures.

### Key takeaway

> Logout is **data destruction**, not **NavController** pop.

---

### Question

**Key rotation** for local encryption?

### Answer

**Version** key aliases (`storage_v2`); on upgrade **re-encrypt** data with **new** key or **wipe** and **resync** from server. Plan **Keystore** cleared (user cleared credentials)—**force** re-login and **reprovision**.

### Key takeaway

> Rotation is a **migration**—test **upgrade** path like any **schema** change.

---

## BLE (Bluetooth Low Energy)

---

### Question

What is **BLE** and when do you pick it over **classic Bluetooth**?

### Answer

**BLE (Bluetooth Low Energy)** is designed for **short bursts** of small data with **low average power**—wearables, sensors, medical peripherals, smart home. **Classic Bluetooth** targets **higher throughput** sustained links (audio streaming, legacy serial-style profiles).

**In plain terms:** BLE trades continuous bandwidth for **battery-friendly** intermittent communication. Product choice is driven by **protocol**, **latency**, and **power**, not “BLE is always slower”—throughput can be tuned with **MTU**, **connection interval**, and **write types**.

### Key takeaway

> **BLE** = low-power, small payloads; **classic** = streaming / legacy high-throughput use cases.

---

### Question

Explain **GATT**, **GAP**, **services**, **characteristics**, and **descriptors** on Android.

### Answer

- **GAP (Generic Access Profile):** discovery, connection establishment, advertising—what you see during **scan** and **connect**.
- **GATT (Generic Attribute Profile):** structured data on the **peripheral** as a tree: **services** → **characteristics** → optional **descriptors**.
- **Service:** logical grouping (e.g. Heart Rate).
- **Characteristic:** actual value you **read**, **write**, **notify**, or **indicate**—identified by **UUID** (SIG standard or vendor-specific).
- **Descriptor:** metadata; the common one is **CCCD** (Client Characteristic Configuration) to turn **notifications/indications** on.

On Android your app is usually the **GATT client**; the device is the **GATT server**.

### Key takeaway

> Interviews expect you to say: **client/server**, **UUID**, and **CCCD** for notifications.

---

### Question

What is the typical **Android BLE flow** from scan to live data?

### Answer

1. **BluetoothManager** → **BluetoothAdapter** (ensure BT on, permissions OK).  
2. **Scan** with **`BluetoothLeScanner`** + **`ScanFilter`** / **`ScanSettings`** (power vs latency).  
3. **`device.connectGatt(context, autoConnect, callback, transport)`** — prefer **`TRANSPORT_LE`** when you mean LE-only.  
4. **`onConnectionStateChange`** → connected → **`discoverServices()`**.  
5. **`onServicesDiscovered`** → grab **service/characteristic** by UUID.  
6. **Read/write** with **`BluetoothGattCharacteristic`**; enable **`setCharacteristicNotification`** **and** write **CCCD** for notify/indicate.  
7. Receive pushes in **`onCharacteristicChanged`**.

### Key takeaway

> **Scan → GATT connect → discover services → read/write/notify** is the standard story.

---

### Question

**BLE permissions on Android 12+** — what breaks if you forget them?

### Answer

You need runtime **`BLUETOOTH_SCAN`** and **`BLUETOOTH_CONNECT`** (and sometimes **`BLUETOOTH_ADVERTISE`** if you advertise). On **older** OS versions, **fine location** was often required for **scanning** because scan results could be abused for location—**know the version matrix** for your `targetSdk`.

**Manifest + runtime request** must match your use case (never scan on a permission you do not hold). **`neverForLocation`** flag on scan when applicable documents intent.

### Key takeaway

> **Android 12+** = explicit **`BLUETOOTH_*`** runtime grants; do not assume “location permission” alone.

---

### Question

**GATT error 133** — what is it, and what do you do in production?

### Answer

**133 (`GATT_ERROR`)** is a **generic failure** from the Android BLE stack—often after **rapid connect/disconnect**, **stack** quirks, **firmware** bugs, or **stale GATT** state. It is **not** one root cause.

**Practical playbook:**  
- **`gatt.close()`** and **do not reuse** the old **`BluetoothGatt`**.  
- Short **backoff** before reconnect (e.g. hundreds of ms, then exponential cap).  
- **`connectGatt(..., false, callback, BluetoothDevice.TRANSPORT_LE)`** for direct connect in many products.  
- Rumored **`refresh()`** cache clear is **unsupported API**—use only with eyes open and **device testing**.

### Key takeaway

> Treat **133** as **“reset session + backoff + clean `close()`”**, then **instrument** to learn your device’s pattern.

---

### Question

**Scan works on one phone, not another** — what do you check?

### Answer

- **Permissions** and **OS version** differences.  
- **Scan mode** (`LOW_LATENCY` vs `LOW_POWER`) and **throttling** (especially **background**).  
- **Filter** too strict (wrong service UUID).  
- **Advertising interval** very long—user must wait.  
- OEM **BLE stack** bugs—always have a **second device** and **firmware** version in bug reports.

**Stop scanning** as soon as you have a target device to save **battery** and avoid **rate limits**.

### Key takeaway

> **Permissions + scan settings + background limits + OEM**—verify on **real hardware matrix**.

---

### Question

Device **found** but **connection fails** — common causes?

### Answer

- Peripheral **already connected** elsewhere (phone, hub).  
- **Stale GATT** / need fresh **`connectGatt`** after **`close()`**.  
- Wrong **transport** (LE vs dual-mode confusion).  
- **Bonding** state mismatch or **encrypted** characteristic without bond.  
- Firmware **connection parameter** refusal—needs **logs** and **sniffer** (HCI snoop / nRF Connect).

### Key takeaway

> **Connection** failures are often **bonding**, **transport**, **already connected**, or **stack/firmware**—prove with **logs** and a **second phone**.

---

### Question

Why must many **GATT operations be serialized**? What breaks if you fire reads/writes in parallel?

### Answer

The Android **`BluetoothGatt`** API is built around **callbacks**; the controller and many devices expect **one outstanding ATT operation** at a time (or a very small window). If you **stack** writes/reads, you can see **dropped callbacks**, **silent write failures**, or **133**.

**Production pattern:** a **single-threaded queue** (or actor) that completes **operation N** before starting **N+1**, driven by **`onCharacteristicWrite`**, **`onDescriptorWrite`**, etc.

### Key takeaway

> **Queue GATT work**—parallel ATT without discipline is a top cause of **“random” BLE bugs**.

---

### Question

**MTU** — default size, how you negotiate it, and why throughput still stinks.

### Answer

Default ATT MTU is **23 bytes** (effective payload **20 bytes** without negotiation). Call **`requestMtu(517)`** (or your max); handle **`onMtuChanged`**—the **negotiated** value is the **minimum** of what **both** sides support.

Even with a higher MTU, **connection interval**, **data length extension**, **write type** (`WRITE_TYPE_NO_RESPONSE` vs default), and **firmware buffering** cap real throughput. For **bulk sync** (e.g. 1 MB history), you combine **MTU**, **interval/priority** where appropriate, **chunking**, and **application-level flow control** (ACK every N blocks).

### Key takeaway

> **MTU** raises the ceiling; **interval**, **write mode**, and **firmware** determine actual **speed**.

---

### Question

Notifications **enabled** but **no `onCharacteristicChanged`** — what did you miss?

### Answer

**Two steps:**  
1. **`setCharacteristicNotification(characteristic, true)`** (local).  
2. Write **CCCD** descriptor with **`ENABLE_NOTIFICATION_VALUE`** or **`ENABLE_INDICATION_VALUE`**, and wait for **`onDescriptorWrite`** success.

**Indication vs notification:** notification is **unacknowledged**; indication expects an **ATT ack**—slightly **heavier** but **reliable** for some stacks.

### Key takeaway

> **CCCD write** is the classic forgotten step—always verify **`onDescriptorWrite`**.

---

### Question

**Callbacks** run on which thread? How do you update **UI** safely?

### Answer

**`BluetoothGattCallback`** methods run on a **Binder / background** thread **not** guaranteed to be main. **Marshal** to **Main** with **`Handler(Looper.getMainLooper())`**, **`runOnUiThread`**, or **coroutines** (`withContext(Main)`).

**Do not** do heavy parsing on the callback thread if it contends with **GATT** sequencing—**hand off** to a **parser** queue.

### Key takeaway

> Assume **callbacks ≠ main thread**; **hop** to **Main** for UI and keep **GATT** discipline.

---

### Question

**Background** — why does BLE “die” when the app is not visible, and what are real fixes?

### Answer

Android **Doze**, **background execution limits**, and **OEM battery** savers throttle scans and tear down links. **Long-running** links usually need a **`foreground service`** with a **visible notification**, **proper permissions**, and sometimes **user education** to disable **aggressive** battery optimization.

**WorkManager** is for **deferrable** work—not a substitute for a **live** BLE telemetry session.

### Key takeaway

> Sustained BLE while backgrounded → **`foreground service`** + **policy-compliant** UX, not **hope**.

---

### Question

How do you design **multi-device** BLE (e.g. ring + watch)?

### Answer

Maintain **`Map<deviceAddress, BluetoothGatt>`** (or a small **connection pool**) with **per-device queues**. **Cap** connections—many phones **degrade** after **~3–4** simultaneous links; **radio** is shared with **Wi‑Fi**.

**Threading:** serialize **per GATT**; avoid two callbacks mutating the **same** repository without **synchronization**. Consider **lowering** **`requestConnectionPriority`** for **non-critical** links when the radio is **contended**.

### Key takeaway

> **Few stable connections** beat **many flaky** ones—**per-device queues** + **realistic** radio expectations.

---

### Question

**Pairing vs bonding** — why does it matter for **medical** devices?

### Answer

**Pairing** establishes keys for a session; **bonding** **persists** keys (e.g. **LTK**) so reconnects can **encrypt** without repeating UX. MedTech often needs **bonding** for **trusted** peripherals and **encrypted** characteristics.

**Implementation detail:** bonding flows can **fail** across **OEM** stacks—test **forgot device**, **re-pair**, and **key rotation** policies.

### Key takeaway

> **Bonding** = **encrypted reconnect** without constant user friction—critical for **regulated** products.

---

### Question

**Secure BLE** in an interview — what do you actually say?

### Answer

- Prefer **LE Secure Connections** / **resolvable** privacy where applicable (firmware-dependent).  
- **Bond** when the **threat model** requires **confidentiality** beyond **plain** ATT.  
- **Whitelist** expected **UUIDs** / **device identity** (serial, cert) to reduce **rogue** peripherals.  
- **Validate** payloads (**length**, **CRC**, **sequence**)—transport security ≠ **application** integrity.  
- **Never** log **PHI** or **keys** from BLE payloads in **release**.

### Key takeaway

> **Bonding + UUID discipline + payload validation**—and align with **firmware** and **regulatory** expectations.

---

### Question

**Debugging BLE** in the field — what tools and artifacts?

### Answer

- **nRF Connect** (mobile) to inspect **services/UUIDs** and **raw** payloads.  
- **Developer options → Bluetooth HCI snoop log** + **Wireshark** for **packet**-level truth.  
- Structured **app logs** around **state machine**: scan → connect → discover → subscribe → stream.  
- Compare **firmware version**, **phone model**, **Android version**.

### Key takeaway

> **HCI snoop + nRF** beat guessing when **callbacks** lie.

---

### Question

**Release** build behaves differently from **debug** for BLE — why?

### Answer

**R8/ProGuard** can strip or rename code **reflectively** used by some SDKs—add **keep rules** for **Bluetooth** glue if needed. **Timing** changes (no debugger) expose **race** bugs: **service discovery** too early, **missing delay** before **`discoverServices()`** on some peripherals.

### Key takeaway

> **Test BLE on `release`** with **minify on**—timing and **shrinking** both break **fragile** stacks.

---

### Question

**Architecture** — how do you structure BLE in a **Clean / MVVM** app?

### Answer

**UI** → **ViewModel** (intents, UI state) → **use cases** → **`BleManager` / repository** owning **GATT**, **queue**, **reconnect policy**, parsing. **Expose** domain models via **`Flow`/`StateFlow`**; **never** leak **`Activity` Context** into long-lived BLE holders—use **`Application`** context with **care**.

**Single responsibility:** scanning, connection lifecycle, and **byte protocol** parsing are **separate** test seams where possible.

### Key takeaway

> **`BleManager` + queue + domain streams** keeps **UI** thin and **testable**.

---

### Question

Scenario: **1 MB** health history sync over BLE takes **minutes** — how do you speed it up?

### Answer

Negotiate **MTU**, tune **connection parameters** / **`requestConnectionPriority(HIGH)`** when appropriate, use **write-without-response** where the protocol allows **burst** + **app-level** ACK windows, **chunk** with **sequence/CRC**, and **pipeline** safely without **overflowing** device RAM. Always measure **negotiated MTU** and **actual** throughput.

### Key takeaway

> **Bulk BLE** = **MTU + interval + write mode + flow control**—all **firmware-coupled**.

---

### Question

Scenario: **OTA/DFU** fails mid-transfer on many phones — what goes wrong?

### Answer

**Link drops**, **133**, **bootloader** switching **address** or **GATT table** (treat as **new** device), **bonding** cache showing **stale services**—**`close()`**, **rescan**, **refresh** strategy (risky hidden APIs), **PRN/flow control** so the device **RAM** is not overrun. **Foreground** + **keep-awake** policy during DFU.

### Key takeaway

> **DFU** is a **state machine** problem: **bootloader transition**, **cache**, and **flow control** dominate.

---

### Useful links

- BLE demo (author reference in source material): https://github.com/KiranDhiyad/BLE_Demo  
- Android BLE overview: https://developer.android.com/develop/connectivity/bluetooth/ble/ble-overview  

### Key takeaway (overall)

> Senior BLE is **half protocol + queue discipline**, **half Android lifecycle + radio reality**—speak with **debug** stories and **metrics**.
