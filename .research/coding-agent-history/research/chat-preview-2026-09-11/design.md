# Local-only reading-page chat prototype

User accepted: expose readable content but not downloadable organized databases; chat reads page text; own OpenAI-compatible URL/key; initially hidden; new conversations. User now authorizes local implementation/preview with their DeepSeek configuration. No publication, commit, push or real API call using an agent-discovered key is authorized.

Baseline: 8c6da227add75b0fb16d1e8a41c4532e8bc0d50e. Input is existing sanitized public HTML, not private research data. Generate a separate private local preview directory from the static reading content. Remove JSON, application data scripts, data-* fields and source/event IDs. Keep human-visible headings and public links. No full-database file or API is exposed by the local server. Main site remains untouched. Local serving is a positive allowlist on 127.0.0.1:8771 with no directory listings/proxy or credential handling.

Client owns page navigation, DOM text extraction and ephemeral chat/config state. Clicks load only public HTML pages; conversational context retrieval is bounded to current/relevant linked reading pages. Token/character budget bounded; source labels and preview are shown to user. Model sees only selected reading text plus chat turns; no API key enters prompts. Retrieved text is untrusted source data, never instructions. Answers use safe text rendering and only validated local source links; no HTML evaluation or arbitrary model-triggered tools.

Connection configuration: HTTPS URLs or loopback HTTP, no username/password/query/fragment. Base /v1 supported and /chat/completions appended only once. Editable model, DeepSeek official compatible default. Key held only in memory/password input; never persisted or written to files/logs; clear-key button. No automatic API calls/model discovery; sending is user-triggered and billed by configured provider. No silent server fallback. CORS/auth/rate errors are shown without secrets or raw provider bodies.

Chat lifecycle: ready -> retrieve -> sending -> streaming -> complete/error/cancel. One AbortController and monotonically increasing request id; new conversation/clear/stop abort current request, stale callbacks cannot update another conversation. Timeout 120 seconds. Streaming SSE and non-stream JSON supported; incomplete responses marked and excluded from future assistant history. No automatic retry. Conversation tabs kept only in memory, newest question names them. Page navigation stays same-document so active conversation and credentials survive; reload clears both. Theme only may persist.

Verification: no structured bundle routes; no credential persistence or proxy; page reading/history navigation; default collapsed chat, config validation, source preview, SSE parser and cancellation via explicitly labeled local simulated transport; mobile and keyboard controls. Real DeepSeek call awaits user's own key input; do not claim live provider verification without it.

Implementation Gate: READY
Work: local-reading-chat-prototype
Verification: full delta for ephemeral client Chat, reused public presentation boundaries
Architecture source: user-accepted discussion and current local-preview authorization, this implementation detail
Algorithm coverage: complete
Data-structure coverage: complete
Open material items: none
Implementation authority: local preview only
Next action: implement and validate locally; open for user

kind: VerifiedDesignReceipt
version: 1
work_id: local-reading-chat-prototype
baseline_sha: 8c6da227add75b0fb16d1e8a41c4532e8bc0d50e
scope: separate local reading-only pages and user-configured browser-direct chat
architecture:
  artifacts: [design.md]
  acceptance_source: current conversation
  acceptance_evidence: 对，基于现在的情况，你现在在本地也给我弄一个这个页面，我看一下
coverage:
  algorithms: local HTML navigation, bounded DOM retrieval, streaming, abort/version guard
  data_structures: transient config, conversation/message list, source fragments, request controller
  cross_trace: above lifecycle and ownership
  invariants: no database bundle, no key persistence, no background requests or backend proxy
  failures_recovery: cancel on new chat, stale callbacks ignored, safe error text, no automatic retries
  migration: separate local artifact, no production modification
open_material_items: []
verified_by: Codex
verified_at: 2026-09-11
verdict: READY

## User correction: original UI must remain unchanged

Implementation Gate: READY (delta against the original accepted site). User explicitly requires only an additive Chat and rejects the replacement reading UI. Reuse original HTML/assets unchanged; remove all Chat-owned page routing, theme binding and page layout selectors. Scope Chat CSS/keyboard events to the floating panel. Chat retrieves separate reading HTML; original renderer continues its existing data loading. This supersedes the earlier no-bundle claim for the whole local preview: data-distribution restructuring is deferred, not secretly completed. Authorization remains local-only. Exact baseline remains 8c6da227add75b0fb16d1e8a41c4532e8bc0d50e.

## Markdown rendering fix
Implementation Gate: READY (delta; user requests Markdown instead of literal syntax). Same local-only Chat scope and original-site invariants. Use installed Marked 17.0.5 lexer, then build allowlisted DOM nodes; never insert generated HTML. Raw HTML is inert text; links only HTTP(S), remote images not fetched. Supports lists, emphasis, headings, code, tables, blockquotes and validated citation links. Observe current answer nodes to upgrade them without clearing keys/conversation. Original scripts/layout remain untouched.

## Reading context affordance correction
Implementation Gate: READY (delta). User accepts explicit current-page context, automatic sending, optional inspection and actual-source display. Only Chat-owned transient UI state changes. A context banner follows original navigation via read-only body/title observations. Prepared previews are invalidated on question/scope/page changes; sent-source labels remain separate. Preview does not mutate conversational source memory. New requests include current reading identity and retain current-page snippets; failed current-page reads stop before API dispatch. No original UI/router or credential state is modified. Current tabs can receive the label-only compatibility module without reload; new client behavior is exercised in a fresh preview.
