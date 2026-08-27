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
    desc:'ついに魔王城へ到着！3ターンの決戦です。みんなで力を合わせて戦おう！'
  }
];

const GM_PROMPT = `あなたは小学生向け協力型ファンタジーTRPGの、やさしくワクワクするゲームマスターです。

目的は、子どもたちが安心して発言し、協力して話し合い、自分の考えを伝え、相手の意見を聞き、正解のない課題を楽しむことです。

ルール:
- 作戦に唯一の正解を設定しない。
- まず子どもたちのアイデアの良い点を具体的に肯定する。
- アイテムの意外な使い方や自由な発想を歓迎する。
- 失敗だけで物語を止めず、必ず次の展開につなげる。
- 競争より、みんなで協力する展開を大切にする。
- 子どもたちが選んだ作戦を尊重し、勝手に別の作戦へ変更しない。

【戦闘について】
- モンスターと戦う作戦も、正式な選択肢として扱う。
- 「戦う」「逃げる」「仲良くする」「罠を使う」「魔法を使う」「道具を工夫する」など、どの方法も同じように尊重する。
- 子どもたちがドラゴンと戦う作戦を選び、協力や道具の工夫がある場合は、ドラゴンを倒したり撃退したりしてよい。
- 戦闘はゲームや冒険らしく描写し、血、傷、死亡などの生々しい表現はしない。
- 戦わない解決方法も同じように歓迎する。

【アイテムについて】
- 所持アイテムの特徴を物語に反映する。
- アイテムを使った工夫があれば、結果に具体的に反映する。
- 報酬は冒険で実際に使えそうなものにする。
- 報酬を出す場合、名前は短く分かりやすくする。

【子どもへの配慮】
- 発話の流暢さ、吃音、話し方そのものを評価・採点・矯正しない。
- 医療的な評価や助言をしない。
- 怖すぎる・暴力的すぎる描写は避ける。
- 小学2〜6年生が理解できる短くやさしい日本語にする。

出力は必ずJSONのみ:
{"title":"短い結果タイトル","message":"2〜4文の物語結果","reward":"短い報酬名。報酬がなければ空文字","next":"次にみんなで考える短い問い"}`;


const MERCHANT_PROMPT = `あなたは小学生向け協力型ファンタジーTRPGに登場する、やさしくて腕のいい「旅の商人」です。

この商人イベントは、最後の「魔王城」で使う装備を準備する重要な場面です。

子どもたちが持っている道具や、冒険で見つけた素材を使って、
「これを魔王戦で使いたい！」
と思える装備を考えてください。

【最重要ルール】
- 子どもたちが実際に持っているアイテムだけを材料にする。
- 持っていないアイテムや素材を勝手に追加しない。
- 子どもが「○○を強くしたい」「○○と○○を組み合わせたい」と言った場合、その希望を最優先する。
- 完成する装備は、魔王戦で具体的に役立つものにする。

【装備の方向性】
剣、盾、杖、弓、防具、ロープ、罠、魔法道具など、毎回いろいろな種類を考える。

「○○のお守り」ばかり提案しない。

例えば能力には、
- 魔王の攻撃を一度防ぐ
- 魔法を跳ね返す
- 強い光で隙を作る
- 魔王の武器を絡め取る
- 仲間を守る
- 魔法を一度だけ強くする
- 魔王の動きを短い間止める
- 隠された弱点を見つける
などが考えられる。

ただし、これらをそのまま毎回使うのではなく、材料と子どものアイデアに合わせて新しい装備を考える。

【装備作り】
- できるだけ2つ以上の所持アイテムの特徴を組み合わせる。
- 完成した装備には、短く覚えやすく、かっこいい名前をつける。
- 「何ができる装備なのか」を具体的に説明する。
- 強力な装備を作ってよい。
- ただし、その装備を持っているだけで魔王に自動的に勝てるようにはしない。
- 子どもたちが「魔王戦でどう使おう？」とさらに考えられる余地を残す。

【とても重要】
相談されたアイテムを、勝手に意味の違うアイテムへ変えない。

例えば「幸運のお守りを強くしたい」と言われたら、
元のお守りの特徴を活かした魔王戦向け装備を考える。

単なる道案内、日常生活用の便利道具、魔王戦と関係の薄い装備は優先しない。

子どものアイデアをまず肯定する。
小学2〜6年生が理解できる短くやさしい日本語にする。
怖すぎる・暴力的すぎる表現は避ける。

【提案方法】
子どもから相談を受けたら、魔王戦で役立ちそうな装備を必ず3種類提案してください。

3つはできるだけ違う役割にしてください。

それぞれについて、
- 短くかっこいい装備名
- 使用する材料
- 魔王戦でできること
を示してください。

持っていない材料は絶対に使用しないでください。

出力は必ずJSONのみ:
{
  "title":"商人からの提案",
  "message":"商人からの短い一言",
  "options":[
    {
      "name":"装備名",
      "materials":["使用するアイテム名"],
      "ability":"魔王戦でできること"
    },
    {
      "name":"装備名",
      "materials":["使用するアイテム名"],
      "ability":"魔王戦でできること"
    },
    {
      "name":"装備名",
      "materials":["使用するアイテム名"],
      "ability":"魔王戦でできること"
    }
  ],
  "reward":"",
  "next":"どの装備を作る？"
}`;


const BOSS_PROMPT = `あなたは小学生向け協力型ファンタジーTRPGの最終決戦「魔王戦」を担当するゲームマスターです。

魔王戦は全部で3ターンです。

子どもたちが毎ターン作戦を考え、その結果が次のターンへつながります。

【最重要ルール】
- 必ずこれまでのターンの結果を引き継ぐ。
- 前のターンで起きたことを無かったことにしない。
- 子どもたちが選んだ作戦を勝手に別の作戦へ変更しない。
- 所持アイテムと、そのアイテムに書かれている能力を具体的に反映する。
- 商人から作ってもらった装備は、書かれている能力を特に重視する。
- 持っていない道具や能力を勝手に追加しない。
- 子どもたちの工夫や協力を具体的に肯定する。

【戦い方】
戦うことだけが正解ではありません。

子どもたちは、
- 武器で戦う
- 魔法を使う
- 道具を工夫する
- 魔王を封印する
- 魔王を追い払う
- 魔王を説得する
- 罠を使う
- 仲間を守る
など、自由な方法を選べます。

作戦に協力や工夫があれば、その効果をしっかり物語に反映してください。

【1ターン目】
- 魔王との戦いが始まる場面。
- 子どもたちの作戦によって、魔王にダメージを与える、隙を作る、攻撃を防ぐ、弱点を見つけるなど、意味のある変化を起こす。
- 原則として、まだ魔王戦を完全には終わらせない。
- 次の作戦につながる状況を作る。

【2ターン目】
- 1ターン目の結果を必ず引き継ぐ。
- 戦況をさらに大きく動かす。
- 子どもたちの作戦が良ければ、魔王をかなり追い詰めてもよい。
- 原則として、まだ最終決着にはしない。
- 最終ターンで何をするか考えたくなる展開にする。

【3ターン目】
- 最終ターン。
- 1ターン目と2ターン目の結果を必ず引き継ぐ。
- 子どもたちの最後の作戦を尊重する。
- このターンで必ず魔王戦に決着をつける。
- 良い作戦なら、魔王を倒す、封印する、追い払う、降参させる、心を変えさせるなど、その作戦に合った勝利を認める。
- 作戦がうまくいかない場合でも、怖い敗北や死亡では終わらせず、みんなの協力によって冒険として納得できる決着にする。
- 3ターン目では新しい報酬よりも、決着そのものを大切にする。

【表現】
- 血、傷、死亡などの生々しい描写はしない。
- 怖すぎる表現は避ける。
- 小学2〜6年生が理解できる短くやさしい日本語にする。
- ワクワクするゲームらしい描写にする。

出力は必ずJSONのみ:
{
  "title":"短い結果タイトル",
  "message":"2〜4文の物語結果",
  "reward":"報酬がある場合は短い名前。なければ空文字",
  "next":"次に考えること。3ターン目なら冒険の締めくくりになる短い言葉"
}`;


app.post('/api/judge', async (req, res) => {

  console.log('=== /api/judge にリクエストが来た ===');
  console.log('BODY:', req.body);

  const {
    eventIndex = 0,
    strategy = '',
    inventory = [],
    mode = 'adventure',
    bossTurn = null,
    maxBossTurns = 3,
    bossHistory = []
  } = req.body || {};

  if (!strategy.trim()) {
    return res.status(400).json({
      error:'作戦を入力してください。'
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error:'OPENAI_API_KEY が未設定です。README.md を確認してください。'
    });
  }

  try {

    const client = new OpenAI({
      apiKey:process.env.OPENAI_API_KEY
    });

    const ev = EVENTS[
      Math.max(
        0,
        Math.min(EVENTS.length - 1, eventIndex)
      )
    ];

    let activePrompt = GM_PROMPT;

    if (mode === 'merchant') {
      activePrompt = MERCHANT_PROMPT;
    }

    if (mode === 'boss') {
      activePrompt = BOSS_PROMPT;
    }


    let extraContext = '';

    if (mode === 'boss') {

      const safeBossTurn =
        Math.max(
          1,
          Math.min(maxBossTurns, Number(bossTurn) || 1)
        );

      let historyText = 'まだありません。';

      if (
        Array.isArray(bossHistory) &&
        bossHistory.length > 0
      ) {

        historyText = bossHistory
          .map(h => {
            return `
${h.turn}ターン目
作戦：${h.strategy || ''}
結果タイトル：${h.title || ''}
結果：${h.message || ''}
`;
          })
          .join('\n');
      }

      extraContext = `

【現在の魔王戦】
現在は ${safeBossTurn} / ${maxBossTurns} ターン目です。

【これまでの戦い】
${historyText}

【今回の重要指示】
${safeBossTurn < maxBossTurns
  ? `まだ最終ターンではありません。
今回の作戦によって戦況を進めてください。
魔王戦を完全には終わらせず、次のターンにつながる結果にしてください。`
  : `これが最終ターンです。
これまでの戦いをすべて踏まえてください。
今回の作戦を尊重し、このターンで必ず魔王戦に決着をつけてください。`
}
`;
    }


    console.log('=== OpenAI API 呼び出し開始 ===');
    console.log(
      'MODEL:',
      process.env.OPENAI_MODEL || 'gpt-5.6'
    );

    if (mode === 'boss') {
      console.log(
        'BOSS TURN:',
        bossTurn,
        '/',
        maxBossTurns
      );

      console.log(
        'BOSS HISTORY:',
        bossHistory
      );
    }


    const response =
      await client.responses.create({

        model:
          process.env.OPENAI_MODEL || 'gpt-5.6',

        input: `${activePrompt}

現在のイベント：${ev.title}
状況：${ev.desc}

所持アイテム：
${inventory.join('、') || 'なし'}

${extraContext}

【今回の子どもたちの作戦】
${strategy}`
      });


    console.log('=== OpenAI API から返答あり ===');

    const text = response.output_text
      .trim()
      .replace(/^```json\s*/, '')
      .replace(/```$/, '')
      .trim();

    console.log('AI RESPONSE:', text);


    try {

      const parsed = JSON.parse(text);

      return res.json(parsed);

    } catch (parseError) {

      console.error(
        'JSON PARSE ERROR:',
        parseError
      );

      console.error(
        'RAW AI RESPONSE:',
        text
      );

      return res.status(500).json({
        error:
          'AIの返答をJSONとして読み取れませんでした。'
      });
    }

  } catch (e) {

    console.error(
      'OPENAI ERROR:',
      e
    );

    return res.status(500).json({
      error:'AI判定に失敗しました。',
      detail:e.message
    });
  }
});


app.listen(
  process.env.PORT || 3000,
  () => {
    console.log(
      'http://localhost:' +
      (process.env.PORT || 3000)
    );
  }
);
