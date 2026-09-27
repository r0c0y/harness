---
name: dns-tls-diagnostics
description: DNS TLS certificate-chain hostname-mismatch
---

# DNS and TLS diagnostics

1. Record the hostname, resolver result, certificate subject/issuer, and exact client error.
2. Separate DNS failure, TCP reachability, TLS negotiation, hostname mismatch, and expiry.
3. Check authoritative configuration and certificate chain with approved read-only tools.
4. Do not disable certificate validation as a fix.
5. If network inspection is unavailable, explain what evidence is needed instead of guessing.
