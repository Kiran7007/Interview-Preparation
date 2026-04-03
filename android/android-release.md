# Android Release Engineering & CI/CD — Senior

---

### Question

**ProGuard vs R8 vs DexGuard**

### Answer

**ProGuard** was the classic **shrink + obfuscate** toolchain. **R8** is the default now: it **shrinks**, **obfuscates**, and ties into **desugaring** with generally **faster** builds. **DexGuard** adds **commercial hardening** (extra obfuscation, tamper resistance)—buy it when your **threat model** justifies cost.

**Example:** Turn on **R8 full mode** in release and maintain **keep rules** for **reflection** (Retrofit models, Gson types, etc.).

### Key takeaway

> Shrinking **breaks reflection**—**ProGuard/R8 rules** are part of your source tree.

---

### Question

**Build types vs product flavors vs build variants**

### Answer

- **Build type:** **debug** vs **release** (minify, signing, debuggable).
- **Product flavor:** different **products** (free/pro, region) along **dimensions**.
- **Variant:** one **flavor** × one **build type** (e.g. `prodRelease`).

### Key takeaway

> Many variants multiply **CI time**—delete what you do not ship.

---

### Question

**Gradle `implementation` vs `api`**

### Answer

**`implementation`** hides **transitive types** from **consumers** of your library → **faster compiles**. **`api`** **exports** those types → consumers see them on their classpath.

### Useful links

- https://medium.com/mindorks/implementation-vs-api-in-gradle-3-0-494c817a6fa  

### Key takeaway

> In libraries, default to **`implementation`** unless you intentionally expose types.

---

### Question

**Gradle wrapper** purpose

### Answer

The **wrapper** (`gradlew` + properties) pins the **Gradle version** so **CI** and every developer use the **same** build tool.

### Key takeaway

> **Commit the wrapper**—do not rely on “whatever Gradle is installed.”

---

### Question

**AAPT2 / build pipeline** (high level)

### Answer

**Resources** compile to **binary tables**; **Java/Kotlin** compiles to **DEX** via **D8/R8**; everything packs into **APK/AAB**. Incremental steps exist so small edits do not rebuild the world.

### Key takeaway

> Know enough to read **resource merge** and **AAPT** error output.

---

### Question

**ABI splits / ABI filters**

### Answer

**Native** `.so` files are **per CPU architecture**. **App Bundles** let Play deliver **split APKs** per ABI. Understand **which ABIs** you support—dropping **x86** in dev builds can speed iteration.

### Useful links

- https://developer.android.com/ndk/guides/abis  

### Key takeaway

> Native SDKs inflate **download size**—split and filter with intent.

---

### Question

**CI/CD for Android**

### Answer

Typical pieces: **GitHub Actions**, **Jenkins + Docker**, **Bitrise**, **Gradle caching**, **secure signing**, **Play internal tracks**, and **automated tests** (including **Firebase Test Lab**).

### Useful links

- https://blog.mindorks.com/github-actions-for-android/  
- https://www.unosquare.com/blog/how-to-setup-a-ci-cd-pipeline-for-android-using-jenkins-and-docker-part-2/  

### Key takeaway

> Cache **dependencies** and **build cache**—Android CI is I/O heavy.

---

### Question

**CI/CD benefits & feature branching**

### Answer

Automation gives **faster releases**, **consistent quality gates**, and **smaller rollout risk**. **Trunk-based** development with **feature flags** usually scales better than long-lived branches.

### Key takeaway

> **Short-lived branches + flags** beat months-long **integration branches**.

---

### Question

**Signing, Play App Signing, key rotation**

### Answer

Use **Play App Signing** so Google holds the **app signing key** and you manage an **upload key**. Document **recovery** if an upload key is lost.

### Key takeaway

> Losing **signing keys** is a **business continuity** problem—treat it seriously.
