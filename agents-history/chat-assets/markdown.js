(() => {
'use strict';
if(window.ChronicleMarkdown)return;
const rendered=new WeakMap();
function element(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
function safeLink(href){try{const u=new URL(href,location.href);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
function textWithCitations(parent,text,sources){const pattern=/\[(S\d+)\]/g;let pos=0;for(const m of text.matchAll(pattern)){parent.append(document.createTextNode(text.slice(pos,m.index)));const src=sources.find(s=>s.id===m[1]),url=src&&safeLink(src.url);if(url){const a=element('a',m[0]);a.href=url;a.className='md-citation';a.target='_blank';a.rel='noopener noreferrer';a.title=src.title||src.id;parent.append(a);}else parent.append(document.createTextNode(m[0]));pos=m.index+m[0].length;}parent.append(document.createTextNode(text.slice(pos)));}
function inline(parent,tokens,sources,depth=0){if(depth>40)return;for(const t of tokens||[]){let n;switch(t.type){
case 'strong':case 'em':case 'del':n=element(t.type);inline(n,t.tokens,sources,depth+1);parent.append(n);break;
case 'codespan':parent.append(element('code',t.text));break;
case 'br':parent.append(element('br'));break;
case 'link':{const href=safeLink(t.href);n=element(href?'a':'span');if(href){n.href=href;n.target='_blank';n.rel='noopener noreferrer';}inline(n,t.tokens||[{type:'text',text:t.text||t.href}],sources,depth+1);parent.append(n);break;}
case 'image':parent.append(element('span','[图片：'+(t.text||'')+']'));break;
case 'html':case 'escape':parent.append(document.createTextNode(t.text||''));break;
default:if(t.tokens)inline(parent,t.tokens,sources,depth+1);else textWithCitations(parent,t.text||t.raw||'',sources);
}}}
function blocks(parent,tokens,sources,depth=0){if(depth>40)return;for(const t of tokens||[]){let n;switch(t.type){
case 'space':break;
case 'heading':n=element('h'+Math.min(6,Math.max(2,t.depth)));inline(n,t.tokens,sources,depth+1);parent.append(n);break;
case 'paragraph':n=element('p');inline(n,t.tokens,sources,depth+1);parent.append(n);break;
case 'text':if(t.tokens)inline(parent,t.tokens,sources,depth+1);else textWithCitations(parent,t.text||'',sources);break;
case 'code':n=element('pre');n.append(element('code',t.text));parent.append(n);break;
case 'blockquote':n=element('blockquote');blocks(n,t.tokens,sources,depth+1);parent.append(n);break;
case 'hr':parent.append(element('hr'));break;
case 'list':n=element(t.ordered?'ol':'ul');if(t.ordered&&Number.isInteger(t.start))n.start=t.start;for(const item of t.items){const li=element('li');if(item.task){const check=element('input');check.type='checkbox';check.disabled=true;check.checked=!!item.checked;li.append(check);}blocks(li,item.tokens,sources,depth+1);n.append(li);}parent.append(n);break;
case 'table':{const wrap=element('div');wrap.className='md-table-wrap';const table=element('table'),head=element('thead'),tr=element('tr');t.header.forEach((cell,i)=>{const th=element('th');inline(th,cell.tokens,sources,depth+1);if(['left','center','right'].includes(t.align[i]))th.style.textAlign=t.align[i];tr.append(th);});head.append(tr);table.append(head);const body=element('tbody');for(const row of t.rows){const r=element('tr');row.forEach((cell,i)=>{const td=element('td');inline(td,cell.tokens,sources,depth+1);if(['left','center','right'].includes(t.align[i]))td.style.textAlign=t.align[i];r.append(td);});body.append(r);}table.append(body);wrap.append(table);parent.append(wrap);break;}
case 'html':parent.append(element('p',t.text||''));break;
default:parent.append(document.createTextNode(t.text||t.raw||''));
}}}
function render(node,text,sources=[]){if(!window.marked?.lexer){node.textContent=text;return;}const fragment=document.createDocumentFragment();try{blocks(fragment,window.marked.lexer(text,{gfm:true,breaks:true}),sources);}catch{fragment.append(document.createTextNode(text));}node.replaceChildren(fragment);rendered.set(node,true);node.classList.add('markdown-body');}
window.ChronicleMarkdown={render};
// Also upgrades answers already on screen without reinitializing Chat or its key.
const log=document.getElementById('messages');if(!log)return;
function refresh(){observer.disconnect();for(const node of log.querySelectorAll('.message.assistant .message-text')){if(rendered.has(node))continue;const sources=[...node.closest('.message').querySelectorAll('.sources a')].map(a=>({id:a.textContent.match(/^S\d+/)?.[0],url:a.href,title:a.textContent})).filter(x=>x.id);render(node,node.textContent,sources);}observer.observe(log,{childList:true,subtree:true,characterData:true});}
const observer=new MutationObserver(refresh);refresh();
})();
