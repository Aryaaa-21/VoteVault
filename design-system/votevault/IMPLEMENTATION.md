# VoteVault visual direction — curated implementation

The UI/UX Pro Max search was run for `private community eligibility product editorial forest lake` with subtle motion and balanced variance. Its generated baseline recommended a dark utility interface, but the product brief calls for an editorial forest-and-water identity. This implementation keeps the verified interaction rules (contrast, visible focus, semantic controls, 44px targets, responsive breakpoints, reduced motion) and deliberately rejects the baseline's slate/cyan treatment.

## Identity

- **Position:** a quiet public ledger surface for private eligibility passes.
- **Voice:** plain, calm, exact. Say what the chain can verify and where privacy ends.
- **Signature:** warm ivory pages, forest green utility surfaces, copper rules and action marks, and one atmospheric lake/forest image rather than decorative data graphics.

## Tokens

- Warm ivory `#F3EEE3` / surface `#FBF8F0`
- Deep forest `#18352B` / primary `#17634F`
- Copper `#AF6545` / dark-mode copper `#DB956D`
- Moss `#A6C488` for dark-mode primary and positive status
- Body `DM Sans`; display `Playfair Display`; hashes and metadata `IBM Plex Mono`

## Layout and behavior

- Sidebar workspace shell on desktop, off-canvas navigation under 1050px.
- Hero pairs a left-aligned serif statement with a locally hosted landscape image; no fake counters or social-proof claims.
- Public record is a truthful empty/loading/error-capable ledger view.
- Privacy notes explain salted credential commitments, Merkle path membership, threshold, nullifier, and limits around timing, small anonymity sets, and remote provers.
- Buttons, selects, inputs, and icon controls are at least 44px high; all focus rings use copper; no hover-only actions.
- Day/night preference is stored only under `VOTEVAULT_THEME`; network preference belongs to config's network-scoped API.
- `prefers-reduced-motion: reduce` disables decorative motion and preserves content visibility.

## Image and type provenance

See `frontend/public/images/ATTRIBUTION.md`. Images are downloaded and served locally; no remote image request is needed at runtime. Font files are self-hosted from Google Fonts.
