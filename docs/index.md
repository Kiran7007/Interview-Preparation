# Interview Preparation (Senior Android Engineer / Tech Lead)

## Study with intention

These notes are designed for recall, not passive reading. Pick one topic, read the prompt before expanding the answer in your mind, then use the takeaway to check whether you can explain the idea in your own words.

1. Start with **Android Core** and **Kotlin** for platform fundamentals.
2. Practice **DSA** and **System Design** aloud, with time limits.
3. Use **Career** before mocks to sharpen your introduction and stories.

Each interview prompt is visually separated from its answer, examples, and further reading so you can pause naturally instead of scanning a wall of text.

## Local documentation site

This repository is powered by [MkDocs Material](https://squidfunk.github.io/mkdocs-material/). The existing Markdown files remain the source of truth; `mkdocs.yml` supplies the navigation, search, responsive layout, code-copy buttons, and light/dark theme.

```bash
python -m pip install -r requirements.txt
mkdocs serve
```

Open the local address printed by MkDocs (normally `http://127.0.0.1:8000`). Use `mkdocs build --strict` before publishing to validate links and configuration.

## Android

- [Android Core](android/android-core.md) — lifecycle, components, views, threading, intents, services, IPC, Parcelable, Dagger, DSA stubs
- [Architecture & Testing](android/android-architecture.md) — MVVM / MVP / MVI / Clean / DI / Compose / SOLID + unit / UI / Espresso / Compose testing
- [Networking, Security & Data](android/android-networking-security.md) — Retrofit / OkHttp / APIs + Keystore / pinning / auth + Room / SharedPrefs / encryption + BLE
- [Engineering — Performance, Release & Leadership](android/android-engineering.md) — battery / profiling / jank + CI/CD / Fastlane / signing + SDK integration + SDLC / behavioral

## Kotlin

- [Kotlin interview notes](kotlin/kotlin.md) — language fundamentals, advanced Kotlin, coroutines, and Flow

## Java

- [Java Core](java/java-core.md)

## DSA

- [Arrays](dsa/arrays.md)
- [Trees](dsa/trees.md)
- [Graphs](dsa/graphs.md)
- [Dynamic Programming](dsa/dp.md)
- [Patterns](dsa/patterns.md)

## System design

- [Mobile system design](system-design/mobile-system-design.md)

## Cross-platform

- [Flutter](cross-platform/flutter.md)

## Behavioral

- [STAR method for interviews](https://www.testgorilla.com/blog/star-method-interviews/)

## Career & interview prompts

- [Master prompts & intro cheat sheet](career/interview-master-prompts.md)
