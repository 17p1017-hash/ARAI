const items=[['⚔️','剣',5],['🪄','魔法の杖',5],['🫥','透明マント',4],['⛺','テント',3],['📕','伝説の本',3],['🧪','回復薬',2],['🪢','ロープ',2],['🗺️','地図',1],['🍀','幸運のお守り',1]];
const events=[
  ['魔法の森','不思議な霧で道が見えません。みんなの道具とアイデアで進む方法を考えよう。'],
  ['ドラゴン出現','大きなドラゴンが道をふさいでいます。戦う以外の方法も自由に考えてOK！'],
  ['古代神殿','古い神殿には謎の扉があります。持っている道具をどう使う？'],
  ['旅の商人','魔王城へ向かう途中、旅の商人に出会いました。集めた素材や持っている道具を使って、交換や装備作りを相談してみよう！'],
  ['魔王城','ついに魔王城へ到着！魔王との決戦です。みんなで力を合わせて戦おう！']
];
let selected=[],gold=10,eventIndex=0;
let rewards=[];
const $=id=>document.getElementById(id); const itemBox=$('items');
items.forEach(([icon,name,price],i)=>{const b=document.createElement('button');b.className='item';b.innerHTML=`<span class="price">${price}G</span><strong>${icon} ${name}</strong><small>クリックして選ぶ</small>`;b.onclick=()=>{if(selected.includes(i)){selected=selected.filter(x=>x!==i);gold+=price;b.classList.remove('selected')}else if(gold>=price){selected.push(i);gold-=price;b.classList.add('selected')}$('gold').textContent=gold;$('start').disabled=selected.length===0};itemBox.appendChild(b)});$('start').disabled=true;
$('start').onclick=()=>{$('shop').classList.add('hidden');$('game').classList.remove('hidden');renderEvent()};
function renderEvent(){
  $('progress').innerHTML=events.map((_,i)=>`<div class="dot ${i<=eventIndex?'done':''}"></div>`).join('');
  $('eventNo').textContent=`イベント ${eventIndex+1} / ${events.length}`;
  $('eventTitle').textContent=events[eventIndex][0];
  $('eventDesc').textContent=events[eventIndex][1];
  $('inventory').textContent=[
  ...selected.map(i=>items[i][1]),
  ...rewards
].join('、');
  $('strategy').value='';
  $('result').classList.add('hidden');
  if(eventIndex===3){
  $('strategy').placeholder='例：竜の鱗と剣を使って、新しい装備を作って！';
  $('judge').textContent='🧳 商人に相談する';
}else{
  $('strategy').placeholder='例：透明マントでこっそり近づいて、ロープを使って…';
  $('judge').textContent='✨ AIゲームマスターに聞く';
}
  const stageImages=[
  'forest.PNG',
  'dragon.PNG',
  'ruins.PNG',
  'merchant.PNG',
  'demon_castle.PNG'
];

    

  $('stageImage').src=stageImages[eventIndex] || 'demon_castle.PNG';
};
$('judge').onclick=async()=>{
  const strategy=$('strategy').value.trim();
  if(!strategy)return alert(
    eventIndex===3
      ? '商人に相談したいことを書いてください。'
      : 'みんなの作戦を書いてください。'
  );

  $('judge').disabled=true;
  $('loading').classList.remove('hidden');
  $('result').classList.add('hidden');

  try{
  const inventory=[
    ...selected.map(i=>items[i][1]),
    ...rewards
  ];

  const r=await fetch('/api/judge',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        eventIndex,
        strategy,
        inventory,
        mode:eventIndex===3 ? 'merchant' : 'adventure'
      })
    });

    const d=await r.json();
    if(!r.ok)throw new Error(d.error||'エラー');

   $('resultTitle').textContent=d.title;
$('resultMessage').textContent=d.message;
$('reward').textContent=d.reward || '';
$('next').textContent=d.next || '';

const merchantOptions = $('merchantOptions');
merchantOptions.innerHTML = '';
merchantOptions.classList.add('hidden');

if(eventIndex === 3 && Array.isArray(d.options)){

  merchantOptions.classList.remove('hidden');

  d.options.forEach(option => {

    const box = document.createElement('div');
    box.className = 'merchant-option';

    const materials = Array.isArray(option.materials)
      ? option.materials.join(' ＋ ')
      : '';

    box.innerHTML = `
      <h3>⚔️ ${option.name}</h3>
      <p><b>材料：</b>${materials}</p>
      <p><b>能力：</b>${option.ability}</p>
      <button type="button">この装備を作る！</button>
    `;

    const button = box.querySelector('button');

    button.onclick = () => {

  const usedMaterials = Array.isArray(option.materials)
    ? option.materials
    : [];

  // 商人が指定した材料を持ち物から消す
  usedMaterials.forEach(material => {

    // 最初に買ったアイテムから探す
    const selectedPosition = selected.findIndex(
      itemIndex => items[itemIndex][1] === material
    );

    if(selectedPosition !== -1){
      selected.splice(selectedPosition, 1);
      return;
    }

    // 冒険中にもらった報酬から探す
    const rewardPosition = rewards.indexOf(material);

    if(rewardPosition !== -1){
      rewards.splice(rewardPosition, 1);
    }
  });

  // 完成した装備を持ち物に追加
  if(!rewards.includes(option.name)){
    rewards.push(option.name);
  }

  // 持ち物表示を更新
  $('inventory').textContent = [
    ...selected.map(i => items[i][1]),
    ...rewards
  ].join('、');

  $('reward').textContent =
    option.name + ' を作ってもらった！';

  $('next').textContent =
    'この装備を魔王戦でどう使う？';

  // ほかの装備を選べないようにする
  merchantOptions
    .querySelectorAll('button')
    .forEach(b => b.disabled = true);

  button.textContent = '✓ この装備に決定！';
};

    merchantOptions.appendChild(box);
  });

}else if(d.reward && d.reward.trim()){

  const newReward = d.reward.trim();

  if(!rewards.includes(newReward)){
    rewards.push(newReward);
  }
}


const currentInventory = [
  ...selected.map(i=>items[i][1]),
  ...rewards
];

$('inventory').textContent = currentInventory.join('、');

$('result').classList.remove('hidden');
  }catch(e){
  console.error(e);
  alert('エラー：' + e.message);
}finally{
    $('judge').disabled=false;
    $('loading').classList.add('hidden');
  }
};
$('nextEvent').onclick=()=>{eventIndex++;if(eventIndex>=events.length){$('game').classList.add('hidden');$('finish').classList.remove('hidden')}else renderEvent()};
