# Confirmed Chat and market-track release

Current publication is explicitly authorized by the user. The earlier local-only entries below are historical verification notes.

Production: https://daming.ai/agents-history/

Build/validate/stage: run `python3 .research/coding-agent-history/research/chat-preview-2026-09-11/publish.py` from the repository root. Deploy the resulting allowlisted assets with `npx wrangler@4.131.0 deploy --config wrangler.agents-history.toml --autoconfig=false --strict`. Verify with `verify_release.py --version <Cloudflare version>`. `release_preview.py` serves the exact production paths on 127.0.0.1:8772 for local checks.

Chat resources live at /agents-history/chat-assets/ and reading copies at /agents-history/reading/. Readers are noindex and canonicalize to their original pages. API keys stay in the browser's current tab and are sent directly to the configured provider; no key, model proxy or private research is deployed. Existing original rendering/data assets are preserved. Market figures are published as readable HTML, not a market JSON export. When private study inputs are absent, rebuilding reuses the committed readable market pages; a clean-checkout hash-parity test passed for all 455 files. Rebuilding strips previous addon markers to avoid duplicate panels.

The original site's existing whole-data asset distribution remains unchanged; this release does not claim to remove it. Only newly added market data avoids a separate structured dataset export.

# Current local preview: original site + Chat overlay

The user rejected the reading-page redesign. The current build restores the original 218 pages and all original rendering assets byte-for-byte, adding only a Chat launcher, floating panel, scoped overlay CSS and overlay JS. No original router, timeline animation, search, layout, theme or month navigation is replaced. Opening Chat does not resize the underlying page.

This correction intentionally leaves the original site's data-loading architecture unchanged. The original structured data assets are still used by the original renderer. Chat itself reads /reading/... HTML and sends selected text only. Removing the original whole-site data distribution is separate unfinished work; do not claim it is done in this preview.

Open http://127.0.0.1:8771/agents-history/ . Chat is collapsed by default. Enter Base URL, model and API key in its settings. Key and conversations remain in the current tab only; no proxy or key persistence. Citation links open reading pages in a new tab without overriding original navigation.

Build: python3 build.py (uses restore_original.py)
Serve: python3 serve.py
reading_only_experiment.py is a rejected historical experiment, not the build entry point.

Validation: removing exactly the Chat injection reproduces all 218 original HTML pages; original asset hashes match. Browser confirms 33-month timeline and minimap restored, default Chat collapsed, and main/film bounds identical before and after opening Chat (1280x488 in the desktop check). Related-page preview reads three HTML pages. Original production files, commit and deployment are untouched.

Markdown fix: Marked 17.0.5 is bundled locally under its MIT license. Only lexer tokens are used; output is constructed with safe DOM nodes, not generated HTML insertion. Lists, emphasis, headings, blockquotes, fenced code, GFM tables and validated [Sx] citations are rendered. Raw HTML remains text; unsafe link schemes and remote image requests are excluded. Tests verified two list items, strong text, table, code, quote and a valid citation, with zero script/image/iframe/javascript-link nodes. Existing local tabs received only the rendering scripts/CSS without reinitializing Chat, refreshing or touching credentials. All 218 original site pages remain byte-identical after removing the Chat injection. No deploy/commit/push.

Reading-context UX correction: the input area now explicitly shows the current object/month/page and says relevant text is included automatically on Send. “预览资料” is now “查看将发送的资料”, an optional inspection action. Actual selected page links are displayed separately from current reading position; previews invalidate when the question, scope or reading location changes. Previously used sources remain labeled as previous-answer material. Direct-send simulation on Kiro verified both the current reading identity and Kiro page text in the request without clicking inspection. At least two available current-page snippets are retained, and a failed current-page read stops before dispatch. Current tabs received the UI compatibility module without reload or credential/session reset; the updated request-selection logic applies when the new overlay client is loaded. This remains a local prototype, not a claim that retrieval quality is solved. All original page bodies remain unchanged.

Market-track local prototype: a separate lower track aligns its cells to the original film's actual column geometry and scroll offset. Nineteen observations with confirmed disclosure months occupy eight month positions; empty months remain blank. Two records with unverified publication dates stay in Methods/Pending. Five independent 0–100% adoption bars are shown for each JetBrains survey; revenue/users are milestone labels. Details include measurement windows, source links, sample limitations and the qualified cross-wave comparison. Mobile follows the active month of the original vertical timeline. Other reading views hide the rail. Market HTML is rendered at build time; no market JSON export is served. Reading HTML also carries relevant evidence so a freshly loaded Chat can retrieve it without changing Chat logic. Original page assets and router are unchanged. No deployment, commit or push was performed.

Validation: 2026-08 upper/lower column alignment difference 0px after the original animated jump; chart values ≈39/21/16/12/6; detail dialog 6 observations plus 5 comparison rows; pending dialog 2 observations; 2024-01 and 2026-09 have no fabricated values. Mobile 390×844 displays only the active month's cell, no horizontal overflow; light/dark checked. Old source/render assets remain identical.

Default-collapse update: the market track starts as a 32px title bar. Clicking its title expands the existing track; clicking again collapses it and restores timeline reading space. aria-expanded and the controlled viewport's hidden state agree. Desktop verification observed 32px collapsed / 178px expanded, with the current month unchanged. Existing local tabs received the control without page reload or Chat reinitialization. Local-only; no commit/push/deploy.
