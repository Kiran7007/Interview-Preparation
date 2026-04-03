# Android Security & API Hardening — Senior

---

### Question

Why **SSL certificate pinning** — and how does it work?

### Answer

- **Deep explanation:** Pins expected server/public key material to block MITM with rogue CAs on compromised devices.
- **Internal working:** Embed SPKI hashes / pins in network stack (OkHttp `CertificatePinner`) + rotation strategy.
- **Trade-offs:** Breaks if pins misconfigured; need update path (backup pins, remote config).
- **Real-world example:** Banking apps pinning API gateways; still combine with proper CA trust store updates.

### Useful links

- https://medium.com/@anuj.rai2489/ssl-pinning-254fa8ca2109  
- https://dzone.com/articles/encryption-and-signing  
- https://www.netguru.com/codestories/3-ways-how-to-implement-certificate-pinning-on-android  
- https://www.raywenderlich.com/10056112-securing-network-data-tutorial-for-android  
- https://appmattus.medium.com/android-security-ssl-pinning-1db8acb6621e  

### Key takeaway

> Pinning is **defense in depth**, not a substitute for solid auth.

---

### Question

**Symmetric vs asymmetric encryption** — where does each belong?

### Answer

- **Symmetric:** fast bulk encryption; key distribution problem.
- **Asymmetric:** key exchange/signing; combine with hybrid schemes (TLS).
- **Video:** https://youtu.be/AQDCe585Lnc  

### Key takeaway

> Production systems are almost always **hybrid**.

---

### Question

How do you **encrypt data in Java/Android**?

### Answer

- `javax.crypto.Cipher` with correct modes (prefer AEAD like GCM), secure random IVs, never hardcode keys.
- **Sample commit:** https://github.com/vamsitallapudi/Coderefer-Java-Projects/commit/443c4f7700fd68391da2ccf40f85a7e3bccd573d#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26  

### Key takeaway

> **Mode + IV + key management** matter more than algorithm name-dropping.

---

### Question

**Android Keystore** — how do you store passwords/secrets?

### Answer

- Use Keystore-backed keys, avoid plaintext shared prefs; consider EncryptedFile/EncryptedSharedPreferences (Security crypto).
- **Links:**
  - https://developer.android.com/privacy-and-security/keystore  
  - https://medium.com/@josiassena/using-the-android-keystore-system-to-store-sensitive-information-3a56175a454b  
  - https://source.android.com/docs/security/features/keystore  
  - https://www.linkedin.com/feed/update/urn:li:activity:7240434808684716032/  
  - App data encryption: https://blog.mindorks.com/how-to-encrypt-data-safely-on-device-and-use-the-androidkeystore  

### Key takeaway

> **Keys out of app data**, enforce biometric/passcode gates when required.

---

### Question

Detecting **rooted/tampered** devices?

### Answer

- Heuristics + `su` binaries + RootBeer library; understand false positives; prefer server-side risk signals.
- **Links:**
  - RootBeer: https://github.com/scottyab/rootbeer  
  - Code snippet: https://stackoverflow.com/a/35628977/3424919  

### Key takeaway

> Treat root detection as **risk scoring**, not hard block unless policy demands.

---

### Question

**Permission protection levels** (`normal`, `dangerous`, `signature`, `signature|privileged`)

### Answer

- Understand runtime prompts, install-time grants, partner-only permissions.
- **Uses-permission vs permission element:** https://stackoverflow.com/questions/14450839/uses-permission-vs-permission-for-android-permissions-in-the-manifest-xml-file  

### Key takeaway

> Dangerous permissions need **UX + fallback paths**.

---

### Question

**Scoped storage** migration story

### Answer

- Prefer SAF/MediaStore; no broad external access; handle legacy paths.
- **Link:** https://blog.mindorks.com/understanding-the-scoped-storage-in-android  

### Key takeaway

> Design **content://** first file pipelines.

---

### Question (FAANG add-on)

**WebView** security checklist

### Answer

- Disable JS bridge unless needed; validate URLs; no mixed content; keep WebView updated; file access off by default.

### Key takeaway

> WebView is **browser-grade attack surface**.

---

### Question (FAANG add-on)

**Supply chain security** for Gradle dependencies

### Answer

- Lockfiles (`dependency locking`), verify checksums, private repos, Dependabot, R8 mapping protection, reproducible builds.

### Key takeaway

> **Dependency graph is part of threat model**.
