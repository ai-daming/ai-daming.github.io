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
