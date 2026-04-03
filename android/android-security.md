# Android Security & API Hardening — Senior

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

### Question

**Scoped storage** migration story

### Answer

Apps no longer get a free pass to **scan shared disk** everywhere. Prefer **SAF** (document picker) and **MediaStore** for user content; use **app-specific** dirs for caches. Think **`content://`** in your pipelines.

### Useful links

- https://blog.mindorks.com/understanding-the-scoped-storage-in-android  

### Key takeaway

> Design file flows around **`content://` URIs** and **scoped access**, not hidden paths.

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
