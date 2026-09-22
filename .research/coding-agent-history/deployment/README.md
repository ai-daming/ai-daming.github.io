# Agents History · Cloudflare 发布

> 本文是早期发布历史。当前多页面、Chat叠层、推送与验收流程请使用[维护手册](../OPERATIONS.md#5-如何部署推送及验收)。2026-09-22发布版本为989de119-d450-4f07-890d-ba7e0d568e12，线上469项检查通过。

正式地址：https://daming.ai/agents-history/

专题Worker：daming-ai-agents-history。主站Worker daming-ai保持原版本，本专题只接管/agents-history及/agents-history/*。根域名绑定没有改动。

## 本次结果

- 发布日期：2026-09-11。
- Version ID：50d83e42-33c5-430d-9db8-764b70277599。
- Deployment ID：1974c842-86cd-4286-bf6e-3b77c38dab8d。
- 静态资产：仅agents-history/index.html，1,773,743字节。
- HTML SHA-256：f7f938765e44290185ca747fbcf23535c7910c59cc0a81900fd5c37f36566a89。
- 公网首页、无尾斜线地址、index.html地址均可达，规范化到/agents-history/。
- 主站首页、About、两篇原文章均200且内容哈希不变。
- 根域名与专题下的.research测试路径均404；未知专题路径404。
- 公网浏览器验证：默认长卷2024-01、33个月；目录73对象；OpenClaw侧栏位置861.5保持；返回首页正常；无JS错误/警告。

完整请求与哈希结果见live-verification.json；发布文件清单见manifest.json。

## 后续更新命令

从daming-ai-pages项目根目录执行：

    python3 .research/coding-agent-history/research/interactive-scroll-design/src/build.py
    python3 .research/coding-agent-history/deployment/prepare.py
    npx wrangler@4.131.0 deploy --config wrangler.agents-history.toml --dry-run --autoconfig=false
    npx wrangler@4.131.0 deploy --config wrangler.agents-history.toml --autoconfig=false --strict --message "Update Agents History"

发布前prepare.py会运行展示隐私和对象关系检查，然后正向白名单复制一个HTML；资产目录若混入其他文件则失败。不要直接把研究目录或整个仓库作为本专题assets上传。

发布后用Wrangler读取新的Version ID，作为verify_live.py的--version-id参数传入，再核对正式URL。live-verification.json记录的是本次版本，不把旧记录当新发布验收。主站内容如果发生正常更新，重新保存当次发布前的home/about快照，不使用旧快照误判。

本机首次使用Wrangler可能需要Cloudflare登录；不要将OAuth文件或访问令牌放进项目。

## 项目内的维护位置

- 公开成品：agents-history/index.html。
- 兼容旧本机入口：coding-agent-history/index.html，由同一构建生成。
- 独立专题配置：项目根目录wrangler.agents-history.toml。
- 网页源码、对象目录、设计和测试：.research/coding-agent-history/research/interactive-scroll-design/。
- 私人研究、Excel、原附件等仍在.research/coding-agent-history/，被Git及主站静态资产排除。

本次已部署Cloudflare，但没有Git提交或推送。原有首页和文章文件未修改；原wrangler.toml保留。
