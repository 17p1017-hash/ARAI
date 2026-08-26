const items=[['⚔️','剣',5],['🪄','魔法の杖',5],['🫥','透明マント',4],['⛺','テント',3],['📕','伝説の本',3],['🧪','回復薬',2],['🪢','ロープ',2],['🗺️','地図',1],['🍀','幸運のお守り',1]];
const events=[
  ['魔法の森','不思議な霧で道が見えません。みんなの道具とアイデアで進む方法を考えよう。'],
  ['ドラゴン出現','大きなドラゴンが道をふさいでいます。戦う以外の方法も自由に考えてOK！'],
  ['古代神殿','古い神殿には謎の扉があります。持っている道具をどう使う？'],
  ['旅の商人','魔王城へ向かう途中、旅の商人に出会いました。集めた素材や持っている道具を使って、交換や装備作りを相談してみよう！'],
  ['魔王城','ついに魔王城へ到着！魔王との決戦です。みんなで力を合わせて戦おう！']
];
let selected=[],gold=10,eventIndex=0;
const $=id=>document.getElementById(id); const itemBox=$('items');
items.forEach(([icon,name,price],i)=>{const b=document.createElement('button');b.className='item';b.innerHTML=`<span class="price">${price}G</span><strong>${icon} ${name}</strong><small>クリックして選ぶ</small>`;b.onclick=()=>{if(selected.includes(i)){selected=selected.filter(x=>x!==i);gold+=price;b.classList.remove('selected')}else if(gold>=price){selected.push(i);gold-=price;b.classList.add('selected')}$('gold').textContent=gold;$('start').disabled=selected.length===0};itemBox.appendChild(b)});$('start').disabled=true;
$('start').onclick=()=>{$('shop').classList.add('hidden');$('game').classList.remove('hidden');renderEvent()};
function renderEvent(){
  $('progress').innerHTML=events.map((_,i)=>`<div class="dot ${i<=eventIndex?'done':''}"></div>`).join('');
  $('eventNo').textContent=`イベント ${eventIndex+1} / ${events.length}`;
  $('eventTitle').textContent=events[eventIndex][0];
  $('eventDesc').textContent=events[eventIndex][1];
  $('inventory').textContent=selected.map(i=>items[i][1]).join('、');
  $('strategy').value='';
  $('result').classList.add('hidden');
  const stageImages=[
  'forest.PNG',
  'dragon.PNG',
  'ruins.PNG',
  'merchant.PNG',
  'demon_castle.PNG'
];

    

  $('stageImage').src=stageImages[eventIndex] || 'demon_castle.png.PNG';
}
$('judge').onclick=async()=>{const strategy=$('strategy').value.trim();if(!strategy)return alert('みんなの作戦を書いてください。');$('judge').disabled=true;$('loading').classList.remove('hidden');$('result').classList.add('hidden');try{const r=await fetch('/api/judge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({eventIndex,strategy,inventory:selected.map(i=>items[i][1])})});const d=await r.json();if(!r.ok)throw new Error(d.error||'エラー');$('resultTitle').textContent=d.title;$('resultMessage').textContent=d.message;$('reward').textContent=d.reward;$('next').textContent=d.next;$('result').classList.remove('hidden')}catch(e){alert(e.message)}finally{$('judge').disabled=false;$('loading').classList.add('hidden')}};
$('nextEvent').onclick=()=>{eventIndex++;if(eventIndex>=events.length){$('game').classList.add('hidden');$('finish').classList.remove('hidden')}else renderEvent()};
