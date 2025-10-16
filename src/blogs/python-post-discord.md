---
title: "Pythonでテキストや画像をDiscordに送信"
date: 2025-04-17
description: "研究であったら便利そうなので作りました。"
image:
  url: "../thumbnails/python-post-discord.png"
  alt: "Python+Discord"
tags: ["Python", "Discord"]
---

## はじめに
　研究で機械学習を使っているのですが、1個のモデルを学習し終わるのに1時間強ぐらいかかります。  
　毎回十数個のモデルを作成するので、一回学習を回し始めると2つのGPUを並列で使っても5,6時間はかかるわけです。  
　そのため、研究室から出る前に学習を始めるのですが、結果を見るにはまた研究室に行く必要がありました。  
　いちいち研究室に行くのは面倒なので、DiscordのWebhookを使って学習結果のjsonを送信させることにしました。

## 実装
　というわけで書きました。下のコードをコピペして`WEBHOOK_URL`を変更すれば動くはずです。  
　URLの取得については、こちらの[「外部サービスからDiscordにメッセージを送る（Webhook）」](https://zenn.dev/lambta/articles/5edbda4ccb1ec6)が参考になります。  
　`post_discord()`の引数に、メッセージ本文と送信したいpng画像のファイルパスリストを与えれやれば動きます。
```python
# この定数は自身で変更する
WEBHOOK_URL = "https://discord.com/api/webhooks/1234567890/hogehoge"
def post_discord(message = str, files_path_list: list[str] = []):
  payload = {}
  payload["content"] = message
  # 画像ファイルをmultipart formに追加
  multiple_files = []
  for i, file_path in enumerate(files_path_list):
    multiple_files.append((
      f"files[{i}]", (f"image{i+1}.png", open(file_path, "rb"), "image/png")
    ))
  # リクエスト送信
  response = requests.post(WEBHOOK_URL, data={"payload_json": json.dumps(payload)}, files=multiple_files)
  # 開いたファイルを閉じる
  for name, filetuple in multiple_files:
    if isinstance(filetuple, tuple) and filetuple[1]:
      filetuple[1].close()
```
　変に複雑に見えますが、やっていること自体は簡単で、メッセージやファイルを整形してWebhookにPOST送信しているだけです。  
　`payload`に本文の文字列を入れ、`requests_post()`の`files`引数にバイナリで開いたファイルを渡しています。  


