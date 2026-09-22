# Coding Agent 月度编年体资料

本目录仅供本机研究维护，不是公开网站内容。已经在仓库.gitignore和静态资产.assetsignore中排除。不要强制加入Git或直接上传本目录。

## 入口

> 当前操作入口：[采集、内容更新与发布手册](OPERATIONS.md)。以下保留历史记录；当前版本已于2026-09-22部署并推送，旧的“未部署”“单HTML”等描述不代表当前状态。


- [截至 2026-09-21 的新版 Excel 与网页重建](research/rebuild-2026-09-22/README.md)：已重建并发布；最新状态见操作手册。

- [原始资料补充至 2026-09-21](research/2026-09-21/README.md)：官方更新、群聊原文、附件及覆盖缺口；展示层重建见上一入口。

- [正式长卷首页](https://daming.ai/agents-history/)
- [Cloudflare发布与后续更新说明](deployment/README.md)
- [长卷首页](../../agents-history/index.html)：默认入口。
- [对象目录](../../agents-history/index.html#month=2024-01&view=catalog)：从长卷进入的辅助目录，首批73个对象。
- [Excel原版](exports/Coding_Agent_月度编年体_2024-01至2026-09.xlsx)：33个月、12列，包含私人来源位置，不能当作已清理的展示材料外发。
- [编年体总目录](wechat/coding-agent-chronicle.md)
- [33个月连续阅读版](wechat/coding-agent-chronicle-full.md)
- [公开发布研究底稿](research/2026-09-10/monthly-timeline.md)
- [交互设计与实现](research/interactive-scroll-design/design.md)
- [展示信息清理与验证记录](research/interactive-scroll-design/verification.md)
- [复制和路径调整清单](relocation-manifest.json)
- [原始附件目录](wechat/sources/attachments/originals/)：14份实际选读材料，复制前按大小/MD5重新核验。
- [归档检查结果](relocation-check.json)

## 内容布局

- research/：公开事件底稿、过程记录、设计图、网页源码和装饰资产。
- wechat/：逐月及分年群聊研究、公开原文读取副本、14份原始附件及提取文本、引用消息与完整候选压缩数据。这些是私人证据，不能因网页已清理就整包公开。
- exports/：已生成的Excel原文件，保留原字节和哈希。原版内部来源路径反映生成时的位置，不作静默改写。
- tooling/excel/：Excel生成脚本、月份内容、原始链接选择清单及原生链接补充脚本。重建工作簿需要现有@oai/artifact-tool运行环境。

## 在这个目录重建网页

从仓库根目录运行：

    python3 .research/coding-agent-history/research/interactive-scroll-design/src/build.py
    python3 .research/coding-agent-history/research/interactive-scroll-design/src/check_presentation.py
    python3 .research/coding-agent-history/research/interactive-scroll-design/src/check_entities.py

规范输出为仓库内 agents-history/index.html，同时生成 coding-agent-history/index.html 兼容副本。两者来自同一份源码。脚本用相对自身的位置读取此目录的Excel和资源，不依赖旧up100或/tmp工作目录。

构建仍校验原Excel哈希。若主动更新研究Excel，先检查数据和展示过滤边界，再更新构建基线，不要跳过校验。

## 本机预览

    python3 .research/coding-agent-history/research/interactive-scroll-design/src/preview.py

访问 http://127.0.0.1:8768/agents-history/ 。预览只服务展示HTML，其他文件路径返回404，不开放研究目录。端口已有预览进程时，不重复启动。

## 归档边界

初次归档仅做本地整理；后续已按用户授权部署专题到Cloudflare，见发布说明。没有Git提交或推送。旧资料仍保留。Markdown导航已更新为新位置；原始JSON、压缩候选及Excel保持原始证据，不改写其中的历史来源元数据。

当前展示HTML保留33个月12类概述、177条公开事件、62项公开文章来源，不嵌入本机路径、私有逐条聊天、群名或原资料ID。

对象目录配置位于 research/interactive-scroll-design/entities.json；对象页引用同一批事件，不复制事件正文。维护说明与验证结果见 [对象页面检查](research/interactive-scroll-design/entity-verification.md)。

静态排除机制依据：[Cloudflare官方说明](https://developers.cloudflare.com/workers/static-assets/binding/#ignoring-assets)。

## 2026-09-11: bilingual static routes, themes and analytics

Public output now consists of 218 complete Chinese/English HTML pages under agents-history/, plus content-hashed CSS/JS/ribbon assets and sitemap.xml. Chinese base is /agents-history/; English base is /agents-history/en/. Leaf routes are months/YYYY-MM and objects/slug. Old hash navigation is not supported, per user instruction. Full text is generated before JavaScript runs; the existing timeline progressively enhances it. Each page has its own canonical URL and reciprocal language links. Light/dark preference follows the system initially and is remembered after a manual choice. GA G-K1TQ51VBZB loads only on daming.ai.

Authoritative implementation: research/interactive-scroll-design/src/{build.py,seo.py,app.js,entity-ui.js,shell.html,style.css,enhancements.css}. English public-text translations are cached in i18n/en.json; reviewed terminology/UI overrides are in i18n/en-overrides.json. Translation happens at build time, never in the visitor's browser. No source URLs or event IDs are translated. Missing translations fail the build. English is a translated edition, not an independent historical source review.

Build: python3 .research/coding-agent-history/research/interactive-scroll-design/src/build.py
Check: python3 .research/coding-agent-history/research/interactive-scroll-design/src/check_routes.py
Stage: python3 .research/coding-agent-history/deployment/prepare.py
Preview: python3 .research/coding-agent-history/research/interactive-scroll-design/src/preview.py (127.0.0.1:8768)
Deploy: pinned Wrangler with --config wrangler.agents-history.toml --autoconfig=false --strict.

Only route-manifest.json allowlisted files are staged. Deployment records and readback checks stay in deployment/. Never deploy .research or copy it to public directories. Actual indexing or GA dashboard receipt is not established by installing the tag. No Git commit/push was performed for this release.

## 2026-09-11: official changelog backfill

The source audit now feeds public source panels for all 73 objects. The backfill adds 5,077 dated official update index entries across 31 objects and all 33 months, retaining all 177 original event records unchanged (5,254 total). Entries expose version/date, source links, release/prerelease status and topic labels. Topic labels are indexing aids, not claims that every mentioned capability was newly added. Curated explanations were added for directly checked Cursor Projects/Harness, TraeWork and WorkBuddy changes and the MiniMax M3 release.

Authoritative augmentation: research/changelog-backfill-2026-09-11/public-augmentation.json. Evidence, exclusions and source pagination state: coverage.json, collected*.json and pages/ in that directory. Internal builds, nightly/canary channels, unconfirmed dates and records outside 2024-01-01 through 2026-09-10 are excluded. Partial source history is explicitly disclosed in each object page. GitHub release timestamps are UTC publication times, not inferred availability dates. One Claude Code documentation/GitHub date discrepancy is retained in the public record and private evidence.

The build uses src/changelog_data.py to add explicit event/object associations; src/public_data.py reads the shared content-hashed data asset for validation. Data JS is shared across pages to avoid embedding the full collection in every HTML. Every route still carries full server-visible content. Browser failure or disabled JS leaves readable static content.

Validation adds src/check_backfill.py: original-record preservation, source coverage, date cutoff, source attribution, locale parity and curated milestones. Deployment prepare.py runs this check plus the existing entity, presentation and route checks. Local-only research remains excluded from Git and publishing; the public site contains neither raw research files nor local paths.
