# Android Release Engineering & CI/CD — Senior

---

### Question

**ProGuard vs R8 vs DexGuard**

### Answer

- **ProGuard:** classic shrink/obfuscate; rules ecosystem.
- **R8:** default shrinker/obfuscator + desugaring integration; faster builds.
- **DexGuard:** commercial hardening (encrypt/strings/anti-tamper)—evaluate cost vs threat model.
- **Real-world example:** Enable R8 full mode in release; maintain keep rules for reflection (Retrofit, Gson types).

### Key takeaway

> Shrinker breaks **reflection**—rules are part of source code.

---

### Question

**Build types vs product flavors vs build variants**

### Answer

- **Build type:** debug/release instrumentation, minify, signing config.
- **Flavor:** dimensions (free/pro, region).
- **Variant:** cross product.

### Key takeaway

> Matrix explosion is a **CI cost**—prune unused variants.

---

### Question

**Gradle `implementation` vs `api`**

### Answer

- `implementation` hides transitive types from consumers → faster compile; `api` leaks classpath.
- **Link:** https://medium.com/mindorks/implementation-vs-api-in-gradle-3-0-494c817a6fa  

### Key takeaway

> Default **`implementation`** in libraries.

---

### Question

**Gradle wrapper** purpose

### Answer

- Reproducible builds across machines/CI; pins Gradle version.

### Key takeaway

> Commit **wrapper**—always.

---

### Question

**AAPT2 / build pipeline** (high level)

### Answer

- Resources compiled to `resTables`, dexing via D8/R8, packaged into AAB/APK; understand incremental compilation benefits.

### Key takeaway

> Know enough to debug **resource merge** failures.

---

### Question

**ABI splits / ABI filters**

### Answer

- Ship per-arch APKs or use App Bundles; understand native lib packaging.
- **NDK ABI doc:** https://developer.android.com/ndk/guides/abis  

### Key takeaway

> Native SDKs explode **artifact size**—split thoughtfully.

---

### Question

**CI/CD for Android**

### Answer

- GitHub Actions, Jenkins+Docker, Bitrise, caching Gradle, deterministic signing, Play internal tracks, automated tests (Firebase Test Lab).
- **Links:**
  - https://blog.mindorks.com/github-actions-for-android/  
  - https://www.unosquare.com/blog/how-to-setup-a-ci-cd-pipeline-for-android-using-jenkins-and-docker-part-2/  

### Key takeaway

> Cache **Gradle deps + build cache** aggressively.

---

### Question

**CI/CD benefits & feature branching**

### Answer

- Faster releases, automated quality gates, reduced rollout risk; GitFlow/trunk-based with feature flags.

### Key takeaway

> **Trunk-based + flags** scales better than long-lived branches.

---

### Question

**Signing, Play App Signing, key rotation**

### Answer

- Use Play App Signing; protect upload key; document disaster recovery.

### Key takeaway

> **Key loss** = business continuity incident.
