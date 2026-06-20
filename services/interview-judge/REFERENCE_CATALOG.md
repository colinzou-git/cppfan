# Executable interview catalog

The `catalog-fixtures-*.json` files are the server-held visible and hidden test catalog for all 60 original interview problems. They define a stable stdin/stdout contract, problem version, test category, and raw worker fixtures.

`reference-solutions.cpp.gz.b64.*` is a generated, compressed copy of the reviewed reference dispatcher. It is split only to keep repository writes and reviews manageable. `scripts/verify-interview-catalog.mjs` concatenates, decodes, and decompresses it in a temporary directory, then:

1. compiles it with GCC and Clang under C++17 and C++20;
2. executes every visible and hidden fixture with the canonical GCC/C++20 build;
3. fails on compile errors, crashes, timeouts, or output mismatches;
4. deletes the reconstructed source and binaries after verification.

The raw hidden fixtures stay server-side. Web-facing judge requests contain only test names, categories, hidden flags, and SHA-256 fixture hashes.

To verify locally or in Codespaces:

```bash
pnpm verify:interview-catalog
```

The command is also part of `pnpm verify` and `pnpm verify:codespace`.
