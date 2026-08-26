const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const EVENTS = [
  {
    title:'魔法の森',
    desc:'不思議な霧で道が見えません。みんなの道具とアイデアで進む方法を考えよう。'
  },
  {
    title:'ドラゴン出現',
    desc:'大きなドラゴンが道をふさいでいます。戦う以外の方法も自由に考えてOK！'
  },
  {
    title:'古代神殿',
    desc:'古い神殿には謎の扉があります。持っている道具をどう使う？'
  },
  {
    title:'旅の商人',
    desc:'魔王城へ向かう途中、旅の商人に出会いました。集めた素材や持っている道具を使って、交換や装備作りを相談してみよう！'
  },
  {
    title:'魔王城',
    desc:'ついに魔王城へ到着！魔王との決戦です。みんなで力を合わせて戦おう！'
  }
];

const GM_PROMPT = `あなたは小学生向け協力型ファンタジーTRPGのやさしいゲームマスターです。
目的は、子どもたちが安心して発言し、協力して話し合い、自分の考えを伝え、相手の意見を聞き、正解のない課題を楽しむことです。
ルール:
- 作戦に唯一の正解を設定しない。
- まずアイデアの良い点を具体的に肯定する。
- 失敗扱いで止めず、必ず物語を前進させる。
- アイテムの意外な使い方や自由な発想を歓迎する。
- 競争より協力を促す。
- 発話の流暢さ、吃音、話し方そのものを評価・採点・矯正しない。
- 医療的な評価や助言をしない。
- 怖すぎる・暴力的すぎる描写は避ける。
- 小学2〜6年生が理解できる短くやさしい日本語にする。
出力は必ずJSONのみ: {"title":"短い結果タイトル","message":"2〜4文の物語結果","reward":"楽しい報酬または発見","next":"次にみんなで考える短い問い"}`;
const MERCHANT_PROMPT = `あなたは小学生向け協力型ファンタジーTRPGに登場する、やさしくて少し不思議な「旅の商人」です。

子どもたちが持っている道具や冒険で見つけたものを使って、交換・加工・新しい装備作りの相談に乗ってください。

ルール：
- 子どものアイデアをまず肯定する。
- 「そんな使い方があるのか！」と思える楽しい提案をする。
- 持っていないアイテムを勝手に持っていることにしない。
- 強すぎる装備にはせず、面白い特徴や弱点もつける。
- 正解を一つに決めず、自由な発想を歓迎する。
- 小学2〜6年生が理解できる短くやさしい日本語にする。
- 怖すぎる・暴力的すぎる表現は避ける。

出力は必ずJSONのみ：
{"title":"商人からの提案","message":"2〜4文の楽しい返答","reward":"交換・完成した装備や発見","next":"次にみんなで考える短い問い"}
`;
app.post('/api/judge', async (req,res)=>{
  const {eventIndex=0, strategy='', inventory=[]} = req.body || {};
  if (!strategy.trim()) return res.status(400).json({error:'作戦を入力してください。'});
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({error:'OPENAI_API_KEY が未設定です。README.md を確認してください。'});
  try {
    const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
    const ev = EVENTS[Math.max(0, Math.min(EVENTS.length-1, eventIndex))];
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.6',
      input: `${GM_PROMPT}\n\n現在のイベント: ${ev.title}\n状況: ${ev.desc}\n所持アイテム: ${inventory.join('、') || 'なし'}\n子どもたちの作戦: ${strategy}`
    });
    let text = response.output_text.trim().replace(/^```json\s*/,'').replace(/```$/,'').trim();
    res.json(JSON.parse(text));
  } catch(e) {
    console.error(e);
    res.status(500).json({error:'AI判定に失敗しました。もう一度試してください。'});
  }
});
app.listen(process.env.PORT || 3000, ()=>console.log('http://localhost:'+(process.env.PORT||3000)));
