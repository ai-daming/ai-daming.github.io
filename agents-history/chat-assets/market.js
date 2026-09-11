(() => {
 'use strict';
function makeCollapsible(rail){
 if(rail.querySelector('#market-toggle'))return;
 const header=rail.querySelector('header'),view=rail.querySelector('#market-viewport'),english=document.documentElement.lang==='en';
 const toggle=document.createElement('button');toggle.id='market-toggle';toggle.type='button';toggle.setAttribute('aria-controls','market-viewport');
 header.querySelector('strong').replaceWith(toggle);
 function set(open){rail.classList.toggle('market-collapsed',!open);document.body.classList.toggle('market-collapsed',!open);view.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.textContent=(open?'▾ ':'▸ ')+(english?'Market adoption & competition':'市场采用与竞争')+' · '+(english?(open?'Collapse':'Expand'):(open?'收起':'展开'));}
 toggle.onclick=()=>set(toggle.getAttribute('aria-expanded')!=='true');
 header.addEventListener('click',e=>{if(!e.target.closest('button'))toggle.click();});
 set(false);
}
const existing=document.getElementById('market-rail');if(existing){makeCollapsible(existing);return;}
const en=document.documentElement.lang==='en',txt=(zh,english)=>en?english:zh;
const rail=document.createElement('section');rail.id='market-rail';rail.hidden=true;rail.setAttribute('aria-label',txt('按月份同步的市场采用轨道','Market adoption aligned by month'));
const head=document.createElement('header');head.innerHTML='<strong></strong><span></span>';head.querySelector('strong').textContent=txt('市场采用与竞争','Market adoption');head.querySelector('span').textContent=txt('按公布月份对齐 · 空白不是0','Disclosure month · Blank ≠ 0');
for(const month of ['2026-04','2026-08']){const b=document.createElement('button');b.type='button';b.textContent=month.replace('-','.')+' '+txt('调查','survey');b.onclick=()=>document.querySelector('#minimap .tick[data-month="'+month+'"]')?.click();head.append(b);}
const notes=document.createElement('button');notes.type='button';notes.textContent=txt('口径 / 待核','Methods / pending');head.append(notes);
const viewport=document.createElement('div');viewport.id='market-viewport';const cells=document.createElement('div');cells.id='market-cells';viewport.append(cells);rail.append(head,viewport);document.body.append(rail);makeCollapsible(rail);
const dialog=document.createElement('dialog');dialog.id='market-dialog';dialog.setAttribute('aria-label',txt('市场资料详情','Market evidence details'));const close=document.createElement('button');close.type='button';close.className='market-close';close.textContent=txt('关闭 ×','Close ×');close.onclick=()=>dialog.close();const body=document.createElement('div');body.className='market-dialog-body';dialog.append(close,body);dialog.addEventListener('keydown',e=>e.stopPropagation());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});document.body.append(dialog);
let film=null,loaded=false,frame=0;
function show(content){body.replaceChildren(content.cloneNode(true));dialog.showModal();body.scrollTop=0;}
function align(){frame=0;if(!film||!loaded)return;const overview=document.body.dataset.view==='overview';rail.hidden=!overview;if(!overview)return;const mobile=matchMedia('(max-width:760px)').matches;const rect=film.getBoundingClientRect();viewport.style.left=rect.left+'px';viewport.style.width=rect.width+'px';for(const cell of cells.children){const month=cell.id.slice('market-'.length),column=document.getElementById('month-'+month);if(!column)continue;const r=column.getBoundingClientRect();cell.style.left=(r.left-rect.left+film.scrollLeft)+'px';cell.style.width=r.width+'px';cell.style.paddingLeft=mobile?(r.left-rect.left+parseFloat(getComputedStyle(column).paddingLeft))+'px':'';cell.classList.toggle('market-current',month===document.body.dataset.month);}cells.style.transform=mobile?'none':'translateX('+(-film.scrollLeft)+'px)';}
function schedule(){if(!frame)frame=requestAnimationFrame(align);}
function attach(){const next=document.getElementById('film');if(next&&!film){film=next;film.addEventListener('scroll',schedule,{passive:true});new ResizeObserver(schedule).observe(film);}schedule();}
fetch('/agents-history/chat-assets/market-'+(en?'en':'zh')+'.html',{credentials:'omit'}).then(r=>{if(!r.ok)throw Error();return r.text();}).then(html=>{const doc=new DOMParser().parseFromString(html,'text/html');for(const article of doc.querySelectorAll('.market-month')){const clone=document.importNode(article,true),detail=clone.querySelector('.market-detail-body'),button=clone.querySelector('summary');button.setAttribute('role','button');button.setAttribute('tabindex','0');button.onclick=e=>{e.preventDefault();show(detail);};button.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(detail);}};cells.append(clone);}const note=doc.getElementById('market-notes');notes.onclick=()=>show(document.importNode(note,true));loaded=true;document.body.classList.add('market-enabled');attach();}).catch(()=>{rail.remove();dialog.remove();document.body.classList.remove('market-collapsed');});
new MutationObserver(attach).observe(document.body,{attributes:true,attributeFilter:['data-view','data-month']});window.addEventListener('resize',schedule);attach();
})();
