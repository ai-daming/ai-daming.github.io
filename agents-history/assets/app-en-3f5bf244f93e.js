function createEntityUI(config){
 'use strict';
 const {data:D,el,button:btn,record,onOpen,onMonth,onHome,onBack,onCatalog,onMonthScroll,onScrollMonth}=config;
 const entities=D.entities,byId=new Map(entities.map(e=>[e.id,e])),events=new Map(D.events.map(e=>[e.id,e])),months=D.months;
 const catalog=document.getElementById('catalog-view'),side=document.getElementById('entity-sidebar'),scroller=document.getElementById('entity-scroll');
 const norm=s=>String(s).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
 let category="All",query='',currentId=null,scrollFrame=0,sidebarKind=null;
 const sidebarPositions=new Map();
 const literal=entities.flatMap(e=>e.aliases.map(a=>({text:a.toLowerCase(),id:e.id,priority:2})));
 const variants=[
  ['gpt-family',/GPT[- ]?\d[\w.-]*(?:\s+(?:Astra|Sol|Terra|Luna))?/gi],
  ['claude-family',/(?:Claude\s*\d(?:\.\d+)*(?:\s*(?:Sonnet|Opus|Haiku))?|(?:Opus|Sonnet|Haiku|Fable|Mythos)\s*\d(?:\.\d+)*)/gi],
  ['gemini-family',/Gemini\s*\d(?:\.\d+)*(?:\s*(?:Pro|Flash|Thinking))?/gi],
  ['deepseek-family',/DeepSeek(?:[- ]?(?:Coder[- ]?)?(?:V|R)?\d[\w.-]*)/gi],
  ['qwen-family',/(?:CodeQwen|Qwen)\s*\d[\w.-]*/gi],
  ['kimi-family',/Kimi\s*K\d(?:\.\d+)*/gi],
  ['glm-family',/GLM[- ]?\d(?:\.\d+)*(?:-Flash)?/gi],
  ['minimax-models',/MiniMax\s*M\d(?:\.\d+)*/gi]
 ];
 function tokens(text){
  text=String(text);const lower=text.toLowerCase(),found=[],urlSpans=[...text.matchAll(/https?:\/\/[^\s，；）)]+/g)].map(m=>[m.index,m.index+m[0].length]);
  function add(start,end,id,priority){
   const before=text[start-1]||'',after=text[end]||'';
   if(urlSpans.some(([a,b])=>start>=a&&start<b))return;
   if(/[A-Za-z0-9_]/.test(text[start])&&/[A-Za-z0-9_@]/.test(before))return;
   if(/[A-Za-z0-9_]/.test(text[end-1])&&/[A-Za-z0-9_]/.test(after))return;
   found.push({start,end,id,priority});
  }
  for(const a of literal){let i=0;while((i=lower.indexOf(a.text,i))!==-1){add(i,i+a.text.length,a.id,a.priority);i+=a.text.length;}}
  for(const [id,re] of variants){re.lastIndex=0;for(const m of text.matchAll(re))add(m.index,m.index+m[0].length,id,1);}
  found.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start)||b.priority-a.priority);
  const selected=[];let end=0;
  for(const m of found)if(m.start>=end){selected.push(m);end=m.end;}
  return selected;
 }
 function linkify(node,text,month){
  node.replaceChildren();text=String(text);let pos=0;
  for(const m of tokens(text)){
   node.append(document.createTextNode(text.slice(pos,m.start)));
   const a=el('a','entity-link',text.slice(m.start,m.end));a.href=document.documentElement.dataset.base+'objects/'+m.id;a.title="View "+byId.get(m.id).name+" history";
   a.addEventListener('click',ev=>{if(ev.button||ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey)return;ev.preventDefault();ev.stopPropagation();onOpen(m.id,month);});
   node.append(a);pos=m.end;
  }node.append(document.createTextNode(text.slice(pos)));return node;
 }
 function search(q){
  const key=norm(q),matched=new Set(tokens(q).map(x=>x.id));
  return entities.filter(e=>!key||norm([e.name,e.owner,e.kind,...e.aliases,e.about].join(' ')).includes(key)||matched.has(e.id));
 }
 function counts(e){return {direct:e.events.filter(x=>x.role==="Direct event").length,context:e.events.filter(x=>x.role!=="Direct event").length};}
 function entityButton(e,cls=''){const b=el('a',cls,e.name);b.href=document.documentElement.dataset.base+'objects/'+e.id;b.addEventListener('click',ev=>{if(ev.button||ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey)return;ev.preventDefault();onOpen(e.id);});b.dataset.entity=e.id;return b;}
 function renderCatalog(q=query){
  query=q;catalog.replaceChildren();
  const head=el('header','catalog-heading');head.append(el('h1','',"Follow an object through its history"),el('p','',"Products, models, protocols, methods and research, connected through shared monthly events. Coverage: January 2024 – September 10, 2026."));
  catalog.append(head);
  const filters=el('nav','entity-filters');filters.setAttribute('aria-label',"Filter by object type");
  for(const kind of ["All",...new Set(entities.map(e=>e.kind))]){const b=btn(kind,()=>{category=kind;renderCatalog(query);},category===kind?'active':'');b.setAttribute('aria-pressed',String(category===kind));filters.append(b);}
  catalog.append(filters);
  const found=search(query).filter(e=>category==="All"||e.kind===category);
  catalog.append(el('p','catalog-count',"Archive: "+entities.length+" objects · Showing "+found.length+""+(query?" · Search: "+query:'')));
  if(!found.length){catalog.append(el('p','entity-empty',"No matching objects. Clear the search or select another object type."));return;}
  const list=el('div','entity-directory');
  for(const e of found){
   const c=counts(e),entry=el('article','entity-entry');
   const meta=el('div','entity-meta');meta.append(el('span','entity-kind',e.kind),el('span','',e.owner));
   entry.append(meta);const h=el('h2');h.append(entityButton(e));entry.append(h,el('p','',e.about));
   entry.append(el('p','entity-entry-foot',c.direct+" direct records · "+e.firstRecordedMonth+' — '+e.lastRecordedMonth+(c.direct===1?" · Limited coverage":'')));
   list.append(entry);
  }catalog.append(list);
 }
 function evidenceLinks(parent,eventIds){
  const urls=new Set();
  for(const id of eventIds)for(const u of events.get(id).url.split('\n'))if(/^https?:\/\//.test(u))urls.add(u);
  [...urls].slice(0,3).forEach((u,i)=>{const a=el('a','',i?"Source "+(i+1):"Relationship evidence");a.href=u;a.target='_blank';a.rel='noopener noreferrer';a.referrerPolicy='no-referrer';parent.append(a);});
 }
 function objectMonth(e,m){
  const refs=e.events.filter(r=>events.get(r.id).month===m.id),section=el('section','entity-month'+(!refs.length?' empty':''));
  section.id='entity-month-'+m.id;section.dataset.month=m.id;
  const title=el('div','entity-month-title');title.append(el('h2','',m.id.replace('-','.')));
  const back=btn("Monthly industry context",()=>onMonth(m.id),'month-context-link');title.append(back);section.append(title);
  if(!refs.length){section.append(el('p','entity-no-record',"No events for this object have been recorded for this month."));return section;}
  for(const ref of refs){
   const wrapper=el('div','entity-event '+(ref.role==="Related context"?'context-event':''));
   wrapper.append(el('span','event-role',ref.role),record(events.get(ref.id)));section.append(wrapper);
  }
  const lens=el('details','entity-month-context');lens.append(el('summary','',"Human–agent collaboration that month (industry-wide)"));
  const content=el('div');content.append(el('h3','human-text',"Human perspective"),el('p','',m.human),el('h3','agent-text',"Agent autonomy"),el('p','',m.agent),el('p','context-note',"This is industry-wide context for the month, not an evaluation of this specific object."));lens.append(content);section.append(lens);
  return section;
 }
 function renderEntity(id){
  const e=byId.get(id);if(!e)return;
  if(sidebarKind!==null)sidebarPositions.set(sidebarKind,side.scrollTop);
  currentId=id;scroller.replaceChildren();scroller.scrollTop=0;
  if(sidebarKind!==e.kind||!side.childElementCount){
   side.replaceChildren();
   side.append(btn("Timeline home",onHome,'entity-return'),btn("Return to previous view",onBack,'entity-return'),btn("All objects",onCatalog,'entity-return secondary'));
   side.append(el('p','entity-sidebar-heading',e.kind));
   for(const item of entities.filter(x=>x.kind===e.kind))side.append(entityButton(item,'entity-peer'));
   sidebarKind=e.kind;side.scrollTop=sidebarPositions.get(e.kind)||0;
  }
  side.querySelectorAll('.entity-peer').forEach(b=>{const active=b.dataset.entity===id;b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false');});
  const head=el('header','entity-heading');head.append(el('p','entity-meta',e.kind+' · '+e.owner),el('h1','',e.name),el('p','entity-about',e.about));
  const aliases=e.aliases.filter(a=>a!==e.name);
  if(aliases.length)head.append(el('p','entity-aliases',"Also known as: "+aliases.slice(0,12).join(' / ')+(aliases.length>12?" and others":'')));
  const c=counts(e);head.append(el('p','entity-coverage',c.direct+" direct records"+(c.context?' / '+c.context+" contextual records":'')+" · First direct record: "+e.firstRecordedMonth+" · Latest direct record: "+e.lastRecordedMonth));
  head.append(el('p','entity-scope-note',"The earliest recorded event is not necessarily the first release. This page reflects materials found within the current research scope. "+(c.direct<3?"Direct coverage is currently limited; early or intermediate versions may be missing.":'')));
  const controls=el('div','entity-heading-actions');controls.append(btn("Start at the first direct record",()=>onScrollMonth(e.firstRecordedMonth),'open-month'));head.append(controls);scroller.append(head);
  const relations=D.relations.filter(r=>r.from===id||r.to===id);
  if(relations.length){
   const related=el('section','entity-relations');related.append(el('h2','',"Related objects"));
   for(const r of relations){
    const other=byId.get(r.from===id?r.to:r.from),row=el('div','relation-row');
    const pair=el('p');pair.append(entityButton(byId.get(r.from),'relation-name'),document.createTextNode(' → '),entityButton(byId.get(r.to),'relation-name'));
    row.append(pair,el('p','',r.label));const actions=el('div','action-row');evidenceLinks(actions,r.eventIds);row.append(actions);related.append(row);
   }scroller.append(related);
  }
  const timeline=el('div','entity-timeline');timeline.append(el('h2','entity-timeline-title',"Monthly timeline"));
  let i=0;
  while(i<months.length){
   const m=months[i],refs=e.events.some(r=>events.get(r.id).month===m.id);
   if(refs){timeline.append(objectMonth(e,m));i++;continue;}
   let j=i+1;while(j<months.length&&!e.events.some(r=>events.get(r.id).month===months[j].id))j++;
   if(j-i>=3){
    const gap=el('details','entity-gap');gap.append(el('summary','',months[i].id+' — '+months[j-1].id+' · '+(j-i)+" months without recorded events (expand)"));
    for(let k=i;k<j;k++)gap.append(objectMonth(e,months[k]));timeline.append(gap);
   }else for(let k=i;k<j;k++)timeline.append(objectMonth(e,months[k]));
   i=j;
  }
  scroller.append(timeline);
 }
 function revealMonth(id){
  const node=document.getElementById('entity-month-'+id);if(!node)return null;
  const gap=node.closest('.entity-gap');if(gap)gap.open=true;
  return {container:scroller,top:scroller.scrollTop+node.getBoundingClientRect().top-scroller.getBoundingClientRect().top-16};
 }
 scroller.addEventListener('scroll',()=>{
  if(scrollFrame)cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(()=>{
   if(document.body.dataset.view!=='entity')return;
   const top=scroller.getBoundingClientRect().top+100;let id=null;
   for(const n of scroller.querySelectorAll('.entity-month'))if(n.getClientRects().length&&n.getBoundingClientRect().top<=top)id=n.dataset.month;
   if(id)onMonthScroll(id);
  });
 },{passive:true});
 return {byId,search,tokens,linkify,renderCatalog,renderEntity,revealMonth,get currentId(){return currentId;}};
}

(() => {
 'use strict';
 const D=JSON.parse(document.getElementById('chronicle-data').textContent);
 const months=D.months, byMonth=new Map(months.map(m=>[m.id,m]));
 const byEvent=new Map(D.events.map(e=>[e.id,e])),bySource=new Map(D.sources.map(s=>[s.id,s]));
 const fields=[['product',"Products & features"],['model',"Model progress"],['task',"Tasks & collaboration"],['method',"Engineering methods"],['evaluation',"Evaluation evidence"],['industry',"Industry & costs"],['discussion',"Community & practice"],['human',"Human perspective"],['agent',"Agent autonomy"],['sources',"Sources & materials"],['gap',"Gaps & verification"]];
 const $=id=>document.getElementById(id), film=$('film'), reading=$('reading'), mobile=matchMedia('(max-width:760px)'), reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const S={month:months[0].id,view:'overview',query:'',section:'product',entity:null,entityReturn:null};
 let explorer=null;
 function rich(node,text,month){return explorer?explorer.linkify(node,text,month):(node.textContent=text,node);}
 const fold=s=>String(s).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
 const index=new Map(months.map(m=>[m.id,fold([m.id,m.id.replace('-','.'),...Object.values(m).filter(x=>typeof x==='string'),...m.eventIds.map(id=>Object.values(byEvent.get(id)).join(' ')),...m.sourceIds.map(id=>Object.values(bySource.get(id)).join(' '))].join(' '))]));
 let matchIds=new Set(),scrollLock=0,toastTimer,frame=0,suppressClick=false;
 let motionFrame=0,motionToken=0,navigationToken=0;
 const travel=el('div','travel-status');travel.setAttribute('role','status');travel.setAttribute('aria-live','polite');travel.hidden=true;document.body.append(travel);
 function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
 function icon(kind){
  const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');
  const p=document.createElementNS(s.namespaceURI,'path');
  p.setAttribute('d',kind==='doc'?'M6 2h8l4 4v16H6z M14 2v5h4 M9 11h6 M9 15h6 M9 18h4':kind==='up'?'m6 15 6-6 6 6':'m6 9 6 6 6-6');s.append(p);return s;
 }
 function btn(text,action,cls){const b=el('button',cls,text);b.type='button';b.addEventListener('click',action);return b;}
 function link(url,text){
  try{const u=new URL(url);if(!['https:','http:'].includes(u.protocol))return null;const a=el('a','',text);a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';a.referrerPolicy='no-referrer';return a;}catch{return null;}
 }
 function announce(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);}
 const BASE=document.documentElement.dataset.base;
 const EN=document.documentElement.lang==='en';
 function parseHash(){
  const suffix=location.pathname.startsWith(BASE)?location.pathname.slice(BASE.length):'';
  if(suffix==='objects/')return {month:months[0].id,view:'catalog',entity:null};
  if(suffix==='months/')return {month:months[0].id,view:'all',entity:null};
  if(suffix.startsWith('objects/')){const id=suffix.slice(8),e=explorer.byId.get(id);if(e)return {month:byMonth.has(location.hash.slice(1))?location.hash.slice(1):e.firstRecordedMonth,view:'entity',entity:id};}
  if(suffix.startsWith('months/')){const id=suffix.slice(7);if(byMonth.has(id))return {month:id,view:'detail',entity:null};}
  return {month:months[0].id,view:'overview',entity:null};
 }
 function hashValue(){return BASE+(S.view==='entity'?'objects/'+S.entity:S.view==='detail'?'months/'+S.month:S.view==='catalog'?'objects/':S.view==='all'?'months/':'');}
 function writeHash(replace=false){
  const path=hashValue(),suffix=path.slice(BASE.length),other='/agents-history/'+(EN?'':'en/')+suffix;
  const title=S.view==='entity'?explorer.byId.get(S.entity).name+(EN?' Timeline':" Timeline"):S.view==='detail'?S.month:S.view==='catalog'?(EN?'Object directory':"Objects"):S.view==='all'?(EN?'Monthly archive':"Months"):(EN?'Timeline':"Timeline");
  document.title=title+' · Coding Agent History';
  const description=S.view==='entity'?explorer.byId.get(S.entity).about:S.view==='detail'?byMonth.get(S.month).product.slice(0,155):(EN?'A month-by-month history of coding agents, models and autonomous work.':"A month-by-month history of coding agents, models and autonomous work.");
  document.querySelector('meta[name="description"]').content=description;
  document.querySelector('link[rel="canonical"]').href='https://daming.ai'+path;
  document.querySelector('meta[property="og:title"]').content=document.title;
  document.querySelector('meta[property="og:description"]').content=description;
  document.querySelector('meta[property="og:url"]').content='https://daming.ai'+path;
  for(const node of document.querySelectorAll('link[hreflang]'))node.href='https://daming.ai/agents-history/'+(node.hreflang==='en'?'en/':'')+suffix;
  $('language-toggle').href=other;
  // Semantic navigation only: scrolling does not create history changes or pageviews.
  if(location.pathname!==path)history[replace?'replaceState':'pushState']({month:S.month,view:S.view,entity:S.entity},'',path);
 }
 function localLink(text,path,action,cls){const a=el('a',cls,text);a.href=BASE+path;a.addEventListener('click',e=>{if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();action();});return a;}
 function openEntity(id,originMonth){
  const e=explorer.byId.get(id);if(!e)return;
  if(S.view!=='entity')S.entityReturn={month:originMonth||S.month,view:['overview','detail','all'].includes(S.view)?S.view:'overview'};
  S.entity=id;navigate(e.firstRecordedMonth,'entity',{entityHero:true,focus:true});
 }
 function backFromEntity(){const back=S.entityReturn||{month:S.month,view:'detail'};navigate(back.month,back.view,{focus:true});}
 function goHome(){$('search').value='';search();S.entityReturn=null;navigate(months[0].id,'overview',{focus:true});}
 function navigateMonth(id){navigate(id,S.view==='catalog'?'overview':S.view);}
 function setActive(id){S.month=id;document.body.dataset.month=id;document.querySelectorAll('[data-month]').forEach(n=>{const yes=n.dataset.month===id;n.classList.toggle('active',yes);if(n.classList.contains('tick'))n.setAttribute('aria-current',yes?'date':'false');});document.querySelectorAll('[data-year]').forEach(b=>b.classList.toggle('active',b.dataset.year===id.slice(0,4)));document.querySelectorAll('.mini-year').forEach(n=>n.classList.toggle('active',n.dataset.yearGroup===id.slice(0,4)));$('previous').disabled=id===months[0].id;$('next').disabled=id===months.at(-1).id;if(mobile.matches){const tick=document.querySelector('.tick.active'),nav=$('minimap');if(tick){const a=tick.getBoundingClientRect(),b=nav.getBoundingClientRect();nav.scrollLeft+=a.left-b.left-b.width/2+a.width/2;}}}
 function stopMotion(){
  motionToken++;if(motionFrame)cancelAnimationFrame(motionFrame);motionFrame=0;if(frame)cancelAnimationFrame(frame);frame=0;scrollLock=0;
  document.body.classList.remove('travelling');travel.hidden=true;reading.style.transform='';reading.style.opacity='';reading.inert=false;
 }
 function motionCue(from,to){travel.replaceChildren(el('span','travel-from',from.replace('-','.')),el('span','travel-arrow','→'),el('strong','',to.replace('-','.')),el('span','travel-passing',''));travel.hidden=false;document.body.classList.add('travelling');}
 function arrived(id){const n=$('month-'+id);if(n){n.classList.remove('arrived');void n.offsetWidth;n.classList.add('arrived');}}
 function animateScroll(container,target,axis,id,from,smooth=true){
  stopMotion();
  const prop=axis==='x'?'scrollLeft':'scrollTop',start=container[prop],max=axis==='x'?container.scrollWidth-container.clientWidth:container.scrollHeight-container.clientHeight;
  target=Math.max(0,Math.min(max,target));const distance=target-start;
  if(!smooth||reduced.matches||Math.abs(distance)<3){container.scrollTo(axis==='x'?{left:target,behavior:'instant'}:{top:target,behavior:'instant'});scrollLock=performance.now()+60;return;}
  const token=motionToken,duration=Math.min(1650,820+Math.sqrt(Math.abs(distance))*7.5),begin=performance.now();
  motionCue(from,id);scrollLock=Infinity;const label=travel.querySelector('.travel-passing');
  function tick(now){
   if(token!==motionToken)return;
   const p=Math.min(1,(now-begin)/duration),ease=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
   container.scrollTo(axis==='x'?{left:start+distance*ease,behavior:'instant'}:{top:start+distance*ease,behavior:'instant'});
   travel.style.setProperty('--progress',String(p));
   const origin=byMonth.get(from)?.order??0,finish=byMonth.get(id).order,pass=months[Math.round(origin+(finish-origin)*ease)];
   const passing=p<.9?"Passing "+pass.id.replace('-','.'):"Arriving";if(label.textContent!==passing)label.textContent=passing;
   if(p<1)motionFrame=requestAnimationFrame(tick);else{motionFrame=0;scrollLock=performance.now()+60;document.body.classList.remove('travelling');travel.hidden=true;setActive(id);arrived(id);}
  }
  motionFrame=requestAnimationFrame(tick);
 }
 function animateDetail(m,from){
  stopMotion();if(reduced.matches){renderDetail(m);reading.scrollTop=0;return;}
  const token=motionToken,direction=m.order>byMonth.get(from).order?1:-1,begin=performance.now(),duration=650;
  motionCue(from,m.id);reading.inert=true;let swapped=false;
  function tick(now){
   if(token!==motionToken)return;
   const p=Math.min(1,(now-begin)/duration);
   if(p>=.44&&!swapped){renderDetail(m);reading.scrollTop=0;swapped=true;}
   if(p<.44){const t=p/.44;reading.style.transform='translateX('+(-direction*75*t)+'px)';reading.style.opacity=String(1-t*.9);}
   else{const t=(p-.44)/.56;reading.style.transform='translateX('+(direction*75*Math.pow(1-t,3))+'px)';reading.style.opacity=String(.1+.9*t);}
   travel.style.setProperty('--progress',String(p));
   if(p<1)motionFrame=requestAnimationFrame(tick);else{motionFrame=0;reading.style.transform='';reading.style.opacity='';reading.inert=false;document.body.classList.remove('travelling');travel.hidden=true;}
  }motionFrame=requestAnimationFrame(tick);
 }
 function scrollOverview(id,smooth=true,from=S.month){
  const n=document.getElementById('month-'+id);if(!n)return;
  const pad=mobile.matches?16:parseFloat(getComputedStyle(film).paddingLeft);
  const rect=n.getBoundingClientRect(),fr=film.getBoundingClientRect();
  const target=mobile.matches?film.scrollTop+rect.top-fr.top-pad:film.scrollLeft+rect.left-fr.left-pad;
  animateScroll(film,target,mobile.matches?'y':'x',id,from,smooth);
 }
 function navigate(id,view=S.view,opts={}){
  if(!byMonth.has(id))return;
  if(view==='entity'&&!explorer.byId.has(S.entity))view='catalog';
  const from=S.month,oldView=S.view,stamp=++navigationToken;
  stopMotion();
  const changed=S.view!==view||S.month!==id;S.view=view;setActive(id);document.body.dataset.view=view;
  $('overview').hidden=view!=='overview';$('detail-view').hidden=view!=='detail';$('all-view').hidden=view!=='all';
  $('catalog-view').hidden=view!=='catalog';$('entity-view').hidden=view!=='entity';
  $('catalog-toggle').classList.toggle('active',view==='catalog'||view==='entity');
  $('previous').hidden=['all','catalog','entity'].includes(view);$('next').hidden=['all','catalog','entity'].includes(view);
  $('all-toggle').replaceChildren(document.createTextNode(view==='all'?"Back to timeline":"Read all"),icon(view==='all'?'up':'down'));
  if(view==='detail'&&(changed||reading.dataset.month!==id)){if(oldView==='detail'&&from!==id&&!opts.instant)animateDetail(byMonth.get(id),from);else{renderDetail(byMonth.get(id));reading.scrollTop=0;}}
  if(view==='all'){if(!$('all-view').childElementCount)renderAll();if(opts.align!==false){const target=$('all-'+id);if(target)animateScroll($('all-view'),target.offsetTop-$('all-view').offsetTop,'y',id,from,!opts.instant);}}
  if(view==='overview'){scrollLock=Infinity;requestAnimationFrame(()=>{if(stamp===navigationToken)scrollOverview(id,!opts.instant,from);});}
  if(view==='catalog')explorer.renderCatalog(S.query);
  if(view==='entity'){
   const rebuild=explorer.currentId!==S.entity;
   if(rebuild||opts.entityHero)explorer.renderEntity(S.entity);
   if(!opts.entityHero&&(!rebuild||opts.fromHash)){
    const place=explorer.revealMonth(id);if(place)animateScroll(place.container,place.top,'y',id,from,!opts.instant);
   }
  }
  if(!opts.fromHash)writeHash(!!opts.replace);
  if(opts.focus)requestAnimationFrame(()=>{if(stamp!==navigationToken)return;if(view==='overview')$('open-'+id)?.focus({preventScroll:true});else if(view==='entity')$('entity-scroll').focus({preventScroll:true});else if(view==='detail')reading.focus({preventScroll:true});});
 }
 function step(delta){const i=byMonth.get(S.month).order;const m=months[Math.max(0,Math.min(32,i+delta))];navigate(m.id);}
 function renderOverview(){
  const frag=document.createDocumentFragment();
  months.forEach(m=>{
   const n=el('article','month');n.id='month-'+m.id;n.dataset.month=m.id;n.setAttribute('aria-label',m.id+" monthly overview");
   n.append(el('h2','',m.id.replace('-','.')));
   const b=el('div','block');b.append(el('h3','label',"Products & models"));const list=el('div','teasers');m.teasers.forEach(t=>list.append(rich(el('p'),t,m.id)));b.append(list);n.append(b);
   for(const [f,title] of [['human',"Human perspective"],['agent',"Agent autonomy"]]){const b=el('div','block');b.append(el('h3','label '+f,title),rich(el('p','lens-copy'),m[f],m.id));n.append(b);}
   const open=localLink("Open month",'months/'+m.id,()=>navigate(m.id,'detail',{focus:true}),'open-month');open.id='open-'+m.id;open.setAttribute('aria-label',"Open "+m.id);open.append(icon('down'));n.append(open);
   frag.append(n);
  });film.append(frag);
 }
 function renderMinimap(){
  for(const y of ['2024','2025','2026']){
   const group=el('div','mini-year');group.dataset.yearGroup=y;group.append(el('span','year-label',y));const ticks=el('div','ticks');
   months.filter(m=>m.id.startsWith(y)).forEach(m=>{const b=btn(m.id.slice(5),()=>navigateMonth(m.id),'tick');b.dataset.month=m.id;b.title=m.id;b.setAttribute('aria-label',"Jump to "+m.id);ticks.append(b);});
   group.append(ticks);$('minimap').append(group);
  }
 }
 function fieldSection(m,f,title,prefix='sec'){
  const s=el('section','section');s.id=prefix+'-'+f;s.dataset.field=f;s.append(el('h2','',title),rich(el('p'),m[f],m.id));return s;
 }
 function record(e){
  const d=el('details','record');d.dataset.record=e.id;const sum=el('summary');const body=e.body.replace(/\s+/g,' '),short=body.length>84?body.slice(0,84)+'…':body;
  sum.append(el('time','',e.date),el('span','',short));const inner=el('div','record-body');inner.append(rich(el('p'),e.body,e.month));
  inner.append(el('p','meta',e.kind+' · '+e.boundary));
  const actions=el('div','action-row');
  for(const [i,u] of e.url.split('\n').entries()){if(u){const a=link(u,"Original source"+(i?' '+(i+1):''));if(a)actions.append(a);}}
  inner.append(actions);d.append(sum,inner);return d;
 }
 function sourceItem(s){
  const d=el('details','record');d.dataset.source=s.id;const sum=el('summary');sum.append(icon('doc'),el('span','',s.title));const inner=el('div','record-body');
  if(s.published&&!/未取得|未锁定/.test(s.published))inner.append(el('p','meta',"Article date: "+s.published));
  const actions=el('div','action-row');const a=link(s.url,"Open original article");if(a)actions.append(a);
  inner.append(actions);d.append(sum,inner);return d;
 }
 function sourceSection(m){
  const s=el('section','section source-list');s.id='sec-sources';s.dataset.field='sources';s.append(el('h2','',"Sources & materials"));
  const items=m.sourceIds.map(id=>bySource.get(id));if(!items.length)s.append(el('p','',"No additional materials have been recorded for this month. Public release sources are attached to the monthly events."));
  else items.forEach(d=>s.append(sourceItem(d)));
  return s;
 }
 function goSection(f){if(motionFrame){stopMotion();renderDetail(byMonth.get(S.month));reading.scrollTop=0;}S.section=f;const n=$('sec-'+f);if(!n)return;document.querySelectorAll('#toc button').forEach(b=>b.classList.toggle('active',b.dataset.section===f));reading.scrollTo({top:reading.scrollTop+n.getBoundingClientRect().top-reading.getBoundingClientRect().top-12,behavior:reduced.matches?'instant':'smooth'});}
 function renderDetail(m){
  reading.dataset.month=m.id;
  $('detail-axis').replaceChildren();
  for(let d=-1;d<=1;d++){const other=months[m.order+d];const b=btn(other?other.id.replace('-','.'):'',()=>other&&navigate(other.id),'axis-month'+(d===0?' current':''));b.disabled=!other;if(other)b.setAttribute('aria-label',"Month "+other.id);$('detail-axis').append(b);}
  const close=btn("Back to timeline",()=>navigate(S.month,'overview',{focus:true}),'collapse-month');close.prepend(icon('up'));$('detail-axis').append(close);
  $('toc').replaceChildren();fields.forEach(([f,title])=>{const b=btn(title,()=>goSection(f),f==='product'?'active':'');b.dataset.section=f;$('toc').append(b);});$('toc').scrollLeft=0;
  reading.replaceChildren();const head=el('div','reader-heading');head.append(el('h1','',m.id.slice(0,4)+" / "+Number(m.id.slice(5))+""),el('p','',m.id==='2026-09'?"Coverage through September 10 only":"Every month, with detailed records and sources"));reading.append(head);
  const grid=el('div','reading-grid'),left=el('div','read-column'),right=el('div','read-column');
  left.append(fieldSection(m,'product',"Products & features"),fieldSection(m,'model',"Model progress"));
  const eventPreview=el('section','section');eventPreview.append(el('h2','',"Events this month"));
  const events=m.eventIds.map(id=>byEvent.get(id)),publics=events.filter(e=>e.kind!=="Chat record");
  publics.slice(0,4).forEach(e=>eventPreview.append(record(e)));
  eventPreview.append(btn("View all "+events.length+" records",()=>goSection('events'),'read-more'));left.append(eventPreview);
  right.append(fieldSection(m,'human',"Human perspective"),fieldSection(m,'agent',"Agent autonomy"),sourceSection(m),fieldSection(m,'gap',"Gaps & verification"));
  grid.append(left,right);reading.append(grid);
  for(const f of ['task','method','evaluation','industry','discussion'])reading.append(fieldSection(m,f,fields.find(x=>x[0]===f)[1]));
  const full=el('section','section full-section');full.id='sec-events';full.dataset.field='events';full.append(el('h2','',"All monthly records"));events.forEach(e=>full.append(record(e)));reading.append(full);S.section='product';
 }
 function renderAll(){
  const frag=document.createDocumentFragment();
  for(const m of months){
   const a=el('article','all-month');a.id='all-'+m.id;a.dataset.month=m.id;a.append(el('h1','',m.id.replace('-','.')));
   const grid=el('div','all-grid');
   fields.forEach(([f,t])=>{
    const s=f==='sources'?el('section','section'):fieldSection(m,f,t,'all-'+m.id);
    if(f==='sources'){s.dataset.field='sources';s.append(el('h2','',t),el('p','',m.eventIds.length+" monthly records, "+m.sourceIds.length+" sources and materials. Open this month to read the full records and their sources."));}
    grid.append(s);
   });
   a.append(grid);const b=localLink("Read this month's events and sources",'months/'+m.id,()=>navigate(m.id,'detail',{focus:true}),'open-month');b.append(icon('down'));a.append(b);frag.append(a);
  }$('all-view').append(frag);
 }
 function search(){
  const q=fold($('search').value);S.query=q;matchIds=new Set(q?months.filter(m=>index.get(m.id).includes(q)).map(m=>m.id):[]);
  $('clear').hidden=!q;$('search').setAttribute('aria-expanded',q?'true':'false');
  document.querySelectorAll('.month,.tick').forEach(n=>n.classList.toggle('match',matchIds.has(n.dataset.month)));
  const result=$('search-results');result.replaceChildren();result.hidden=!q;if(S.view==='catalog')explorer.renderCatalog(q);if(!q)return;
  const objects=explorer.search(q);
  result.append(el('p','',objects.length||matchIds.size?"Matches: "+objects.length+" objects / "+matchIds.size+" months":"No matching objects, months or materials"));
  for(const e of objects.slice(0,10))result.append(btn(e.name+' · '+e.kind,()=>{openEntity(e.id);result.hidden=true;},'search-entity-result'));
  if(objects.length>10)result.append(btn("View all matching objects",()=>{navigate(S.month,'catalog');result.hidden=true;}));
  if(!matchIds.size&&!objects.length)result.append(btn("Clear search",clearSearch));
  months.filter(m=>matchIds.has(m.id)).forEach(m=>result.append(btn(m.id+'  '+m.teasers.slice(0,2).join(' / '),()=>{navigate(m.id,'detail');result.hidden=true;})));
 }
 function clearSearch(){$('search').value='';search();$('search').focus();}
 explorer=createEntityUI({data:D,el,button:btn,record,onOpen:openEntity,onMonth:id=>navigate(id,'detail',{focus:true}),onHome:goHome,onBack:backFromEntity,onCatalog:()=>navigate(S.month,'catalog'),onScrollMonth:id=>navigate(id,'entity'),onMonthScroll:id=>{if(S.view==='entity'&&performance.now()>=scrollLock&&id!==S.month){setActive(id);}}});
 renderOverview();renderMinimap();
 $('home').onclick=e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();goHome();};$('previous').onclick=()=>step(-1);$('next').onclick=()=>step(1);
 document.querySelectorAll('[data-year]').forEach(b=>b.onclick=()=>navigateMonth(b.dataset.year+'-01'));
 $('catalog-toggle').onclick=e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();navigate(S.month,'catalog');};
 $('months-toggle').onclick=e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();navigate(S.month,'all');};
 $('all-toggle').onclick=()=>navigate(S.month,S.view==='all'?'overview':'all');
 $('search').addEventListener('input',search);$('search').addEventListener('focus',()=>{if(S.query)$('search-results').hidden=false;});$('clear').onclick=clearSearch;
 $('search').addEventListener('keydown',e=>{if(e.key==='Enter'){const objects=explorer.search(S.query);if(S.query&&objects.length)openEntity(objects[0].id);else if(matchIds.size)navigate([...matchIds][0],'detail');$('search-results').hidden=true;e.preventDefault();}});
 document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))$('search-results').hidden=true;});
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(e.target.matches('input')){clearSearch();$('search-results').hidden=true;}else if(S.view==='entity')backFromEntity();else if(S.view!=='overview')navigate(S.month,'overview',{focus:true});else if(S.query)clearSearch();return;}
  if(e.target.closest('input,textarea,select'))return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?-1:1);}
 });
 film.addEventListener('scroll',()=>{
  if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   if(S.view!=='overview'||performance.now()<scrollLock)return;
   const fr=film.getBoundingClientRect(),axis=(mobile.matches?fr.top+16:fr.left+parseFloat(getComputedStyle(film).paddingLeft));
   let best=null,dist=Infinity;
   document.querySelectorAll('.month').forEach(n=>{const r=n.getBoundingClientRect(),d=Math.abs((mobile.matches?r.top:r.left)-axis);if(d<dist){dist=d;best=n.dataset.month;}});
   if(best&&best!==S.month){setActive(best);}
  });
 },{passive:true});
 let allFrame=0;
 $('all-view').addEventListener('scroll',()=>{if(allFrame)cancelAnimationFrame(allFrame);allFrame=requestAnimationFrame(()=>{if(S.view!=='all'||performance.now()<scrollLock)return;const top=$('all-view').getBoundingClientRect().top+90;let id=months[0].id;document.querySelectorAll('.all-month').forEach(n=>{if(n.getBoundingClientRect().top<=top)id=n.dataset.month;});if(id!==S.month){setActive(id);}});},{passive:true});
 $('all-view').addEventListener('wheel',()=>{if(motionFrame)stopMotion();},{passive:true});
 $('all-view').addEventListener('pointerdown',()=>{if(motionFrame)stopMotion();},{passive:true});
 $('entity-scroll').addEventListener('wheel',()=>{if(motionFrame)stopMotion();},{passive:true});
 $('entity-scroll').addEventListener('pointerdown',()=>{if(motionFrame)stopMotion();},{passive:true});
 film.addEventListener('wheel',e=>{
  if(mobile.matches||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
  const n=e.target.closest('.month');if(n&&n.scrollHeight>n.clientHeight+10){const can=e.deltaY>0?n.scrollTop<n.scrollHeight-n.clientHeight-2:n.scrollTop>0;if(can)return;}
  const can=e.deltaY>0?film.scrollLeft<film.scrollWidth-film.clientWidth-2:film.scrollLeft>0;
  if(can){e.preventDefault();stopMotion();film.scrollLeft+=e.deltaY;}
 },{passive:false});
 let drag=null;
 film.addEventListener('pointerdown',e=>{stopMotion();if(mobile.matches||e.button!==0||e.target.closest('button,a,input,summary'))return;film.scrollTo({left:film.scrollLeft,behavior:'instant'});drag={x:e.clientX,start:film.scrollLeft,id:e.pointerId,moved:false};});
 film.addEventListener('pointermove',e=>{if(!drag)return;const delta=e.clientX-drag.x;if(Math.abs(delta)>8){drag.moved=true;film.setPointerCapture(e.pointerId);film.classList.add('dragging');}if(drag.moved){film.scrollLeft=drag.start-delta;e.preventDefault();}});
 function endDrag(){if(drag?.moved){suppressClick=true;setTimeout(()=>suppressClick=false,0);}drag=null;film.classList.remove('dragging');}
 film.addEventListener('pointerup',endDrag);film.addEventListener('pointercancel',endDrag);film.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();}},true);
 function restore(){const p=parseHash();const changed=p.month!==S.month||p.view!==S.view||p.entity!==S.entity;S.entity=p.entity;if(changed)navigate(p.month,p.view,{fromHash:true,instant:true});if(location.hash!==hashValue())writeHash(true);}
 window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
 mobile.addEventListener('change',()=>{if(S.view==='overview')scrollOverview(S.month,false);});
 let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(S.view==='overview')scrollOverview(S.month,false);},120);});
 const init=parseHash();S.entity=init.entity;navigate(init.month,init.view,{replace:true,instant:true,fromHash:true,entityHero:true});writeHash(true);
 document.documentElement.dataset.ready='true';
 document.getElementById('static-content')?.remove();
})();
