# JSON CRDT collaborative presence

This package provides real-time presence/awareness tracking for `json-joy` JSON
CRDT documents. Presence means UI indications showing _which users_ are actively
collaborating and _what they are doing_ — their cursor positions, text
selections, and generic node selections.

The design is **transport-agnostic**: the package owns the data model,
serialisation, selection construction helpers, and the reactive in-memory
presence manager. It does **not** own networking; the application layer is
responsible for broadcasting/receiving `PeerPresence` messages.

## Funding

This project is funded through [NGI Zero Core](https://nlnet.nl/core), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more at the [NLnet project page](https://nlnet.nl/project/JSON-Joy-Peritext).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGI0_tag.svg" alt="NGI Zero Logo" width="20%" />](https://nlnet.nl/core)
