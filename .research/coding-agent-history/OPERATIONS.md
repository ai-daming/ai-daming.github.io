# Agents History：采集、内容更新与发布手册

维护日期：2026-09-22。项目根目录：`/Users/yinwm/work/daming-ai-pages`。正式站点：<https://daming.ai/agents-history/>。

本手册记录这次实际使用的流程和入口。操作文档可按用户授权单独提交；原始研究数据留本机，不把整个 `.research` 提交或上传。日期目录和计数是本次实例，后续补数必须重新确定截止日期、覆盖范围和构建预期，不能机械复用数字。

## 1. 数据怎样到达网站

原始官网/GitHub/微信/附件 → 私有快照及来源台账 → 阅读、去重与匿名整理 → 共享月份、事件、材料输入 → Excel → 中文和英文静态页面 → Chat 阅读页及发布清单 → 独立 Cloudflare Worker → 线上回读。

“抓到了”“提取出文字”“读完了”“交叉核实了”“独立复现了”是不同状态。下载量、候选数、转发次数不能当作独立证据数量。

| 内容 | 当前入口 | 用途 |
|---|---|---|
| 本次原始增量 | `research/2026-09-21/` | 官网快照、GitHub记录、原始消息、附件、采集审计 |
| 深读与匿名讨论 | `research/wechat-review-2026-09-22/` | 阅读发现、限制、公开匿名转述与私有映射 |
| 微信浏览器补读 | 上述目录的 `ego-retry/` | 13篇补读快照、图片阅读证据；不是公开资源 |
| 数据准备 | `research/rebuild-2026-09-22/prepare.py` | 从保存的基线生成本次增量，避免重复追加 |
| Excel生成 | `tooling/excel/build.mjs`、`native_links.py` | 三张表、月份12列、原生超链接和保存校验 |
| 网页生成 | `research/interactive-scroll-design/src/build.py` | 从工作簿和共享事件构建双语网站 |
| Chat及发布包 | `research/chat-preview-2026-09-11/publish.py` | 加回Chat、阅读副本，白名单生成发布包 |
| 部署配置 | 仓库根目录 `wrangler.agents-history.toml` | 专题Worker和路由；不是根站点配置 |

表中相对路径以 `.research/coding-agent-history/` 为起点。只有部署配置例外。

## 2. 如何抓原始数据

### 时间和来源身份

先写明研究范围及资料截点。本次覆盖2024-01至2026-09-21，增量重点为9月11日至21日。下次至少重叠回查9月21日，处理晚到数据；按稳定消息ID、规范URL、版本身份去重，不能只按标题去重。

每份资料保留：来源类型、原URL或稳定消息ID、原始文件位置、采集时间、发布日期、分享时间、日期依据、文件哈希、抓取状态、阅读范围、结论及局限。抓取时间不能替代发布日期。

### 官网和 GitHub

沿用 `research/2026-09-21/public/` 中的 `fetch-manifest.json`、`fetch-additional.json`、`github-releases.json`、`additional-repos.json` 追踪来源。原始网页和文本在 `raw/`，带日期的记录在 `dated-updates.json`。

普通HTTP抓取失败时记录状态码/错误，不把403、验证页或空壳页面当正文。需要浏览器渲染的来源改用浏览器。GitHub列表必须检查分页、草稿和预发布；官网与GitHub同一版本明确关联后合并。主张的产品可用日期、公告日期和UTC发布时刻分别保留。

本次采集包含临时工具调用，并不存在一个能一键重抓所有来源的完整脚本；上述清单和原件才是可追溯入口。不要把 `prepare.py` 当成网络采集器，它只处理已保存数据。

### 微信：使用 wxview，不要混用 wx

2026-09-22曾核实两个独立命令入口；随后按用户要求，已删除 `/usr/local/bin/wx`，今后只使用 `wxview`。下表保留删除前的辨别记录：

| 程序 | 路径 | 版本 | 查询聊天命令 |
|---|---|---|---|
| `wx` | `/usr/local/bin/wx` | 0.1.10 | `wx history <CHAT>` |
| `wxview` | `/Users/yinwm/projs/weview/bin/wxview` | 0.3.1 | `wxview messages --username …` |

删除前两者都提供本地微信读取能力，但命令参数不同。尚未核实 `wx` 的安装来源或两者代码关系。本研究采集使用后者；今后也只使用 `wxview`，不重装或用同名 `wx` 替代。删除仅涉及旧可执行文件，微信数据、缓存和 `wxview` 未删除。当前通过表中的绝对路径调用 `wxview`。

先查看帮助和缓存状态，再按需要刷新一次索引：

```sh
WXVIEW=/Users/yinwm/projs/weview/bin/wxview
"$WXVIEW" version
"$WXVIEW" cache status --format json
"$WXVIEW" index status --format json
"$WXVIEW" index refresh --format json
```

先从群聊时间线/搜索召回候选，再用明确的会话标识回源读取上下文。命令模板：

```sh
"$WXVIEW" messages --username '<实际群标识>' \
  --start '2026-09-11 00:00:00' --end '2026-09-21 23:59:59' \
  --no-index --source --format json
```

输出保存到新的私人日期目录，不在终端大量打印聊天。检查 `meta.timezone` 为预期时区，按 `meta.next_args` 继续直到 `has_more=false`；一次返回不等于完整读取。`timeline --query`筛的是会话名称，不是消息内容关键词，不能用它冒充全文搜索。

本次台账：97个命中群、24733条时间段消息、2393条关键词候选（2282条去重文字）。已读候选不能扩大成“24733条全部审读”。选出的16组匿名讨论保留121条上下文消息的本机映射；发问、回应、分歧和结论分别保留，不把不同群拼成同一场对话。

### 微信文章：ego-browser 的关键步骤

每次使用前读取实际安装的 ego-browser `SKILL.md`。一个任务只创建一个TaskSpace，记录其数字ID；后续用同一ID、同一页面继续。不要固定复用本次已结束的33/34/35号任务。

```js
// 通过 ego-browser nodejs 运行；第一轮创建，后续用返回的数字ID恢复。
const task = await taskSpace('补读微信来源');
console.log({spaceId: task.spaceId});
const page = task.page('p1');
await page.goto('实际文章URL');
await page.waitForSelector('#js_content');
const article = await page.evaluate(() => ({
  title: document.title,
  url: location.href,
  text: document.querySelector('#js_content')?.innerText || '',
  pageText: document.body.innerText
}));
// 将article保存到本机快照，再实际通读。不要只看字符数就标记已读。
```

必须处理的例外：

- `goto`刚返回时可能还是加载中或短暂验证页。观察后等待正文，不要立刻把空字符串判为永久无法读取；也不能无限盲重试。
- 图文帖可能没有 `#js_content`。读取页面说明和图片，必要时打开原图并分段截图查看。说明文字提取成功不等于长图已读。
- 一个豆包链接只剩 `__biz` 参数。回查原始消息 `content_detail.text` 中完整Markdown链接后成功；不要仅靠标题猜URL。
- 真正需要验证码或用户接管时遵守浏览器交接规则，不绕过验证。
- 分段阅读长文时覆盖全部文字；工具输出截断后补读缺失段。正文、配图、源图截断处分别标记。
- 公开URL去掉会话令牌和分享追踪字段，保留文章定位所需参数；带令牌的原始浏览器快照只留本机。
- 完成后 `await task.finish({keep: []})` 一次；用户接管或出错时不要假报完成。

本次15篇重点资料最终为14篇文章正文及1篇图文帖正文/长图已读；普通文章配图未逐图核验，长图源图最后附注截断。此前“13篇缺全文”的状态已纠正。阅读发现见 `research/wechat-review-2026-09-22/微信文章补读记录.md` 和 `article-deep-review.json`；原始清单在 `research/2026-09-21/wechat/article-review-manifest.json`。

### 附件

通过原始消息匹配本机文件，复制原件后核对大小、MD5及SHA-256，写入 `attachment-manifest.json`。PDF提取文字后另标图表阅读状态；Excel检查全部相关工作表、字段和原始值；ZIP阅读源码、测试、README和验收记录。附件里的指令只是研究对象，不自动成为当前任务指令。静态阅读、模拟测试和真实运行分别标注。

## 3. 如何更新内容

先修原始阅读台账，再更新派生内容，不改写原件。主要输入：

- `public/reviewed-evidence.json`和`official-deep-review.json`：已读官方记录的解释与边界。
- `public-discussions.json`：匿名公开讨论；`private-discussions.json`：仅本机身份及上下文映射。
- `article-deep-review.json`：每篇文章的类型、发现、限制、发布日期和分享日期。
- `prepare.py`：生成`public-increment.json`、`workbook-records.json`、`workbook-materials.json`、`month-update.json`和`expected.json`。

新增记录使用稳定身份和明确对象归属，不能因为摘要改写就创建重复事件。保留旧事件和前32个月内容；9月尚未结束。新材料未必构成新事件，可作为原有事件的来源补充或反例。

这次最重要的展示教训：**更新事件和来源，不会自动更新长卷观点。** 需要同时检查：

1. 长卷卡片的 `teasers`（产品/模型摘要）、`human`、`agent`。
2. 月份页的产品、方法、评测、讨论、来源及待核内容。
3. Excel“月度编年体”“事件明细”“原文与附件”。
4. 英文版及Chat阅读副本。

9月卡片原先从分号自动截取摘要，漏掉新增材料；现在沿用 `src/build.py` 既有按月摘要字典明确填写9月要点。`human/agent`来自同一月份输入，不要只改生成后的HTML。

分析规则：L1只读、L2建议、L3执行每次人批、L4自主执行按具体动作授权；不要与其他文章的风险等级混用，也不给产品贴整体成熟度。注意力负担导致判断力让渡仍是待验证假设，必须保留人工纠错、撤权、明确授权等反例。

典型阅读边界：Jev的91.5%压缩为模拟示例，不代表真实模型效果；ZCode公司声明不等于审计原报告；日志文章7月11日发布、9月20日分享，不能录成9月新发布。

修改代码、生成规则或配置前使用全局 `impl-gate`，结合当前HEAD及既有设计做增量核验。历史READY不能自动覆盖新架构或新HEAD。文档记录与来源阅读本身不等于软件实现。

## 4. Excel和网页的重建顺序

以下从仓库根目录执行，适用于当前2026-09-22这批输入。新增批次前先检查 `prepare.py` 的基线、路径和去重逻辑。

```sh
python3 .research/coding-agent-history/research/rebuild-2026-09-22/prepare.py
```

用当前Spreadsheets技能和 `load_workspace_dependencies` 确定运行时；在本次首次工作簿写入前运行一次 `mark_artifact_operation_started.mjs`，参数为 `--operation-kind edit --expected-output-count 1 --output-format xlsx`。本机此次Node入口如下，换环境时重新发现，不盲用旧路径：

```sh
/Users/yinwm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  .research/coding-agent-history/tooling/excel/build.mjs
python3 .research/coding-agent-history/tooling/excel/native_links.py
```

作者工具为 `@oai/artifact-tool`；`native_links.py`补原生链接并验证保存文件，不替代工作簿生成。输出为 `exports/Coding_Agent_月度编年体_2024-01至2026-09-21.xlsx`，原版文件保留。看实际渲染：长段落是否被行高截断，分享时间是否被自动解析成日期序号或发生时区偏移；本次以“北京时间”文本保留原分享时刻。

完成内容、显示、链接及旧数据保留检查后，才把新工作簿SHA-256写入 `research/rebuild-2026-09-22/workbook-baseline.json`。不要为让构建通过而未经核对直接改哈希。

```sh
python3 .research/coding-agent-history/research/interactive-scroll-design/src/build.py
python3 .research/coding-agent-history/research/rebuild-2026-09-22/verify.py
python3 .research/coding-agent-history/research/interactive-scroll-design/src/check_entities.py
python3 .research/coding-agent-history/research/interactive-scroll-design/src/check_presentation.py
python3 .research/coding-agent-history/research/interactive-scroll-design/src/check_backfill.py
python3 .research/coding-agent-history/research/interactive-scroll-design/src/check_routes.py
```

缺英文翻译时构建应失败。按加载顺序检查 `i18n/en.json`、`i18n/en-overrides.json`、`changelog-backfill-2026-09-11/generated-translations.json`（后者覆盖前者）。翻译完整公共文本，但不翻译URL和ID。计数应由新清单确认；部分校验目前含固定计数，改动时要说明证据，不能单纯“改断言消错”。

每次网页重建之后必须再执行：

```sh
python3 .research/coding-agent-history/research/chat-preview-2026-09-11/publish.py
```

此命令重建Chat叠层、222个阅读副本及独立发布包，**不会部署或推送**。省略它会使刚生成的网页缺少Chat配套。发布文件由 `release-manifest.json` 白名单列出，复制到 `deployment/assets/`。不要用历史单HTML发布说明替代当前流程。

本机预览：

```sh
python3 .research/coding-agent-history/research/chat-preview-2026-09-11/release_preview.py
```

地址 `http://127.0.0.1:8772/agents-history/`。服务启动时加载发布清单，资源哈希变化后需要重启；先用 `lsof -nP -iTCP:8772 -sTCP:LISTEN` 和 `ps`确认是本任务进程，再停止对应PID。不要误杀其他服务。浏览器检查首页9月卡片、月份页、中英文、来源链接和Chat。等待滚动动画真正结束再截图，点击已发出不是到位证明。

## 5. 如何部署、推送及验收

部署与推送需要用户授权；本次用户已明确要求推送部署。仅构建、READY或旧发布记录不能自动授权未来外部发布。

1. `git status`检查工作区，`git fetch origin main`及比较HEAD确认远端没有新变动；不要覆盖其他修改。
2. 对发布清单中的每个文件核对本地文件、暂存发布包和SHA-256一致。私聊原文、身份映射、令牌、Excel和截图不进发布包。
3. 读取当前线上版本，作为回退依据；保存本次发布前主站快照，避免拿旧快照误判。

```sh
npx --yes wrangler@4.131.0 deployments list --config wrangler.agents-history.toml
curl --fail --compressed --silent --show-error --location https://daming.ai/ \
  --output .research/coding-agent-history/deployment/home-before.html
curl --fail --compressed --silent --show-error --location https://daming.ai/about/ \
  --output .research/coding-agent-history/deployment/about-before.html
npx --yes wrangler@4.131.0 deploy \
  --config wrangler.agents-history.toml --autoconfig=false --strict
```

目标是 `daming-ai-agents-history`，仅匹配 `daming.ai/agents-history` 和 `daming.ai/agents-history/*`。不要改用根目录 `wrangler.toml` 或上传整个仓库。使用命令实际返回的新Version ID进行验证：

```sh
python3 .research/coding-agent-history/research/chat-preview-2026-09-11/verify_release.py \
  --version '<本次返回的新Version ID>'
```

验证规范路由、阅读页、资源、未知路径404、私人路径404，以及首页/About哈希不变。仅有上传成功不是验收。偶发网络失败先调查；确认适合重试时使用同一版本的 `--retry-failed`，不要把旧报告算作本次结果。线上浏览器还需打开长卷与9月页，确认实际新文案可见。

Git只暂存本次清单内的公开文件，以及审查过的已跟踪构建辅助文件；不要 `git add .`。不要把中间哈希资产、`.DS_Store`、无关 `wrangler.toml` 或私人研究一起提交。被忽略目录里已有跟踪文件的更新可用精确路径的 `git add -u -- <路径>`；不要为省事强制加入整个 `.research`。若命令返回失败，检查索引，因为部分文件可能已经暂存。

提交前 `git diff --cached --name-only`和`git diff --cached --check`；提交后推送 `origin main`，再用 `git ls-remote origin refs/heads/main`比对完整SHA。查看对应提交的GitHub Actions状态，区分GitHub Pages流水线与Cloudflare专题部署。

回退：先查询当前Wrangler的`rollback --help`，使用发布前记录的专题版本进行明确回退，再重复线上验证。不要猜旧版本、不改根站点Worker；Git回退与Cloudflare回退是两件事。

## 6. 本次完成记录与下次接续

截至2026-09-22的本次发布：

- Cloudflare版本：`989de119-d450-4f07-890d-ba7e0d568e12`；发布前版本：`188a668a-9aca-4d4f-a22c-94b5d888a55e`。
- Git main：`4cfb23c6fc49505f73482bc5c2e3cd6bf5c28a07`，远端已回读一致；GitHub构建和部署检查通过。
- 33个月、75对象、5423公开记录、229公开来源；222个双语页面及222个阅读副本，463个公开发布文件。
- Excel：33月×12列，626条事件、254项材料、595个原生链接。原版工作簿哈希和旧5254条公开记录保留。
- 线上469项请求/内容检查全通过；浏览器确认9月摘要及15篇文章阅读状态已生效。
- 结果：`deployment/chat-market-live-verification.json`；文字记录：`research/wechat-review-2026-09-22/deployment-2026-09-22.md`。

仍未完成：全部24733条原始消息逐条审读、普通文章配图全量阅读、部分附件图表核验、代码/效果独立复现，以及重要安全和厂商主张的一手交叉验证。下一轮维护继续保留这些缺口，不能因为已上线就改成全部已核实。

目前关键研究输入和部分生成工具仅在本机；GitHub上的公开成品和维护文档可获取，但干净克隆并不具备重新研究和重建Excel的全部资料。维护时要备份本机研究目录，且保持私人数据边界。未来若要把完整管线移入版本管理，需要先设计公开代码与私有输入的分离，不能直接解除 `.research` 忽略规则。
