# Android Storage & Data — Senior

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
