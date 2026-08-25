# 勇者パーティの大冒険 — AI協力型TRPG

小学生のグループ活動向けの協力型TRPG風Webアプリです。

## 起動方法
1. Node.js 18以上をインストール
2. このフォルダで `npm install`
3. OpenAI APIキーを環境変数 `OPENAI_API_KEY` に設定
4. `npm start`
5. ブラウザで `http://localhost:3000` を開く

macOS / Linux:
```bash
export OPENAI_API_KEY="あなたのAPIキー"
npm install
npm start
```

PowerShell:
```powershell
$env:OPENAI_API_KEY="あなたのAPIキー"
npm install
npm start
```

APIキーはブラウザ側のJavaScriptには保存せず、サーバーの環境変数として設定してください。
モデルは既定で `gpt-5.6` を使用します。`OPENAI_MODEL` で変更できます。

## 内容
- 10G以内のアイテム購入
- 4つのイベント
- 作戦入力
- OpenAI Responses APIによるGM判定
- インベントリ管理
- 子どもの発話・吃音そのものを採点しないGMプロンプト
