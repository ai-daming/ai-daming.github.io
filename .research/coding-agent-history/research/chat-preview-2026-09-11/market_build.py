"""Build human-readable market evidence; no browser data export."""
from pathlib import Path
import json,html,collections,re,shutil
ROOT=Path(__file__).resolve().parent
PRIVATE_INPUT=ROOT.parent/'market-adoption-sample-2026-09-11/sample.json'
DATA=json.loads(PRIVATE_INPUT.read_text()) if PRIVATE_INPUT.exists() else None
SOURCES=DATA['sources'] if DATA else {};RECORDS=DATA['records'] if DATA else []
def esc(s):return html.escape(str(s),quote=True)
def t(zh,en,lang):return en if lang=='en' else zh
METRICS={'工作采用率':'Adoption at work','单一最常用工具占比':'Primary-tool share','CSAT 满意度':'CSAT satisfaction','NPS 推荐值':'NPS score','编码场景 LLM API 支出份额估算':'Estimated coding LLM API spend share','厂商披露 users':'Vendor-reported users','ARR':'ARR','annualized revenue':'Annualized revenue','run-rate revenue':'Run-rate revenue'}
NAMES={'Anthropic（模型提供商）':'Anthropic (model provider)','OpenAI（模型提供商）':'OpenAI (model provider)'}
def value(r,lang):
 v=r['value'];q={'greater_than':'>','approximate':'≈','estimated':'≈'}.get(r['qualifier'],'')
 if r['unit']=='percent':return q+str(v)+'%'
 if r['unit']=='score_-100_100':return str(v)+t(' 分',' points',lang)
 if r['unit']=='users':return q+(f'{v/10000:g} 万人' if lang=='zh' else f'{v/1000000:g}M users')
 return q+(f'{v/100000000:g} 亿美元/年' if lang=='zh' else f'${v/1000000000:g}B / year')
def period(r):return r['statistic_from'] if r['statistic_from']==r['statistic_to'] else r['statistic_from']+' — '+r['statistic_to']
def label(r,lang):return NAMES.get(r['object_label'],r['object_label']) if lang=='en' else r['object_label']
NOTES_EN={
'JB-JAN':'January 2026 AI Pulse survey; over 10,000 professional developers worldwide. Weighted sample; question-specific N not reported. Non-exclusive adoption rates.',
'JB-MID':'May–July 2026 Developer Ecosystem survey; over 15,000 professional developers worldwide. Weighting differs from the January wave; not a respondent-level panel.',
'MS-Q3':'Vendor statement; active/paid-user definitions and a separate measurement cutoff were not specified.',
'MS-Q4':'Vendor statement; this is not a verified paid-user or monthly-active-user count.',
'CUR-C':'Vendor-reported ARR milestone; not realized annual revenue.',
'CUR-D':'Vendor used “annualized revenue”; do not silently join it to an ARR series.',
'CC-BUN':'Milestone reached in November and disclosed in December; annualized run-rate, not actual annual revenue.',
'CC-G':'Vendor-reported run-rate; not audited annual revenue.',
'MENLO':'495 US enterprise decision-makers surveyed November 7–25, 2025. December estimates of provider/API spending, not tool-user share; publication date unverified. Menlo has an investment relationship with Anthropic.'}
def note(sid,lang):
 if lang=='en':return NOTES_EN[sid]
 s=SOURCES[sid]
 if sid.startswith('JB-'):return s['collection']+'；全球职业开发者，调查总样本 '+s['sample_total']+'，单题有效 N 未单列。'+('使用率可重叠，不能凑成100%。' if sid=='JB-JAN' else '与1月不是同一批人的追踪，加权方法也有差异。')
 return {'MS-Q3':'厂商自述 users；活跃、付费定义和独立统计截止日未说明。','MS-Q4':'厂商自述 users；不能当作付费人数或 MAU。','CUR-C':'厂商披露 ARR，不是实际年度收入。','CUR-D':'原文改称 annualized revenue，不与 ARR 无说明拼线。','CC-BUN':'11月达到，12月公布；年化运行收入不等于实际年收入。','CC-G':'厂商自述的年化运行收入，不是审计后的年度收入。','MENLO':'495位美国企业决策者；按 API 使用和企业规模估算模型提供商支出份额。不是 Claude Code/Codex 的用户份额，公布日期待核；Menlo 与 Anthropic 存在投资关系。'}[sid]
def details(rows,month,lang):
 title=(month.replace('-','.')+' · ' if month else '')+t('市场采用与竞争','Market adoption & competition',lang)
 out='<h2>'+esc(title)+'</h2>'
 if month:out+='<p>'+esc(t('位置按公布月份对齐；统计时间另列。','Positioned by disclosure month; measurement periods are shown separately.',lang))+'</p>'
 else:out+='<p>'+esc(t('以下两条公布月份尚未核定，暂不放进时间轴。','The disclosure month of these two records is unverified; they are not plotted on the timeline.',lang))+'</p>'
 for sid in dict.fromkeys(r['source_id'] for r in rows):
  group=[r for r in rows if r['source_id']==sid];s=SOURCES[sid]
  out+='<section><h3>'+esc(s['publisher'])+'</h3><p>'+esc(note(sid,lang))+'</p><table><thead><tr>'+''.join('<th>'+x+'</th>' for x in ([t('对象','Object',lang),t('指标','Metric',lang),t('数值','Value',lang),t('统计时间','Measurement period',lang)]))+'</tr></thead><tbody>'
  for r in group:out+='<tr>'+''.join('<td>'+esc(x)+'</td>' for x in [label(r,lang),METRICS.get(r['metric'],r['metric']) if lang=='en' else r['metric'],value(r,lang),period(r)])+'</tr>'
  out+='</tbody></table><p><a href="'+esc(s['url'])+'" target="_blank" rel="noopener noreferrer">'+t('原始报告 / 公告','Original report / announcement',lang)+'</a></p></section>'
 if month=='2026-08':
  out+='<section><h3>'+t('与上一波调查对照','Comparison with the previous survey wave',lang)+'</h3><p>'+t('同一发布方的两波调查，加权方法不同；仅作描述性对照，不能证明用户迁移或变化原因。','Two surveys from the same publisher with different weighting methods: descriptive comparison only, not evidence of user migration or causality.',lang)+'</p><table><thead><tr><th>'+t('工具','Tool',lang)+'</th><th>2026-01</th><th>2026-05—07</th></tr></thead><tbody>'
  for c in DATA['comparison']:out+='<tr><td>'+esc(c['object'])+'</td><td>'+str(c['jan_2026_percent'])+'%</td><td>'+('≈' if c['object']=='Claude Code' else '')+str(c['may_jul_2026_percent'])+'%</td></tr>'
  out+='</tbody></table><p><a href="'+SOURCES['JB-JAN']['url']+'" target="_blank" rel="noopener noreferrer">'+t('上一波报告','Previous report',lang)+'</a></p></section>'
 return out

def build_market():
 if DATA is None:
  for lang in ['zh','en']:
   src=ROOT.parents[3]/'agents-history/chat-assets'/('market-'+lang+'.html')
   dst=ROOT/'site/preview-assets'/src.name;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
  return {}
 valid=[r for r in RECORDS if r['published_at']];missing=[r for r in RECORDS if not r['published_at']]
 groups=collections.defaultdict(list)
 for r in valid:groups[r['published_at'][:7]].append(r)
 assert len(valid)==19 and len(missing)==2 and len(groups)==8
 for lang in ['zh','en']:
  out='<!doctype html><html lang="'+('en' if lang=='en' else 'zh-CN')+'"><head><meta charset="utf-8"><meta name="robots" content="noindex"></head><body><section id="market-content"><h1>'+t('市场采用与竞争','Market adoption & competition',lang)+'</h1>'
  for month,rows in sorted(groups.items()):
   adoption=[r for r in rows if r['metric']=='工作采用率']
   out+='<article id="market-'+month+'" class="market-month"><h3>'+month.replace('-','.')+'</h3>'
   if adoption:
    out+='<p class="market-caption">'+esc(t('工作采用率','Adoption at work',lang)+' · '+period(adoption[0]))+'</p><ul class="market-bars">'
    for r in sorted(adoption,key=lambda r:-r['value']):
     out+='<li><span class="market-name">'+esc(r['object_label'])+'</span><span class="market-bar"><i style="width:'+str(r['value'])+'%"></i></span><strong>'+value(r,lang)+'</strong></li>'
    out+='</ul><p class="market-foot">JetBrains · '+t('多工具可同时使用','Multiple tools may be used',lang)+'</p>'
   else:
    for r in rows:out+='<p class="market-milestone"><span>'+esc(r['object_label'])+'</span><strong>'+esc(value(r,lang))+'</strong><small>'+esc(METRICS.get(r['metric'],r['metric']) if lang=='en' else r['metric'])+'</small></p>'
   out+='<details class="market-detail"><summary>'+t('展开数据与口径','Details & methodology',lang)+'</summary><div class="market-detail-body">'+details(rows,month,lang)+'</div></details></article>'
  out+='<section id="market-notes"><h2>'+t('读图方式','How to read this track',lang)+'</h2><p>'+t('比例条各自按0–100%显示，不相加为100%；没有披露的月份留白。收入、用户数只作里程碑，满意度与推荐值不混入采用率。','Each bar uses its own 0–100% scale. These are not parts of a whole. Months without disclosures remain blank. Revenue, user counts, satisfaction and NPS are separate metrics.',lang)+'</p>'+details(missing,None,lang)+'</section></section></body></html>'
  target=ROOT/'site/preview-assets'/('market-'+lang+'.html');target.parent.mkdir(parents=True,exist_ok=True);target.write_text(out)
 return groups
if __name__=='__main__':build_market()

def reading_market(route,lang):
    if DATA is None:
        suffix=route.removeprefix('/agents-history/')
        name=suffix+'index.html' if not suffix or suffix.endswith('/') else suffix+'.html'
        source=ROOT.parents[3]/'agents-history/reading'/name
        text=source.read_text()
        found=re.search(r'<!--market-reading-start-->(.*?)<!--market-reading-end-->',text,re.S)
        return found[1] if found else ''
    # The unchanged Chat can read the same newly visible evidence as ordinary text.
    selected=RECORDS
    if '/months/' in route and not route.endswith('/'):selected=[r for r in RECORDS if r['published_at'] and r['published_at'][:7]==route.rsplit('/',1)[-1]]
    elif '/objects/' in route and not route.endswith('/'):selected=[r for r in RECORDS if r['object_id']==route.rsplit('/',1)[-1]]
    if not selected:return ''
    out='<section><h2>'+t('市场采用与竞争：公开证据','Market adoption & competition: public evidence',lang)+'</h2>'
    for r in selected:
        pub=r['published_at'] or t('待核','unverified',lang);sid=r['source_id'];s=SOURCES[sid]
        text=(label(r,lang)+' · '+(METRICS.get(r['metric'],r['metric']) if lang=='en' else r['metric'])+'：'+value(r,lang)+'。'+t('统计时间：','Measured: ',lang)+period(r)+'；'+t('公布时间：','Disclosed: ',lang)+pub+'。'+s['publisher']+'：'+note(sid,lang))
        out+='<p>'+esc(text)+' <a href="'+esc(s['url'])+'">'+t('原始报告','Original report',lang)+'</a></p>'
    return out+'</section>'
