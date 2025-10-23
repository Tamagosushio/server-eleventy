---
title: "初めてOSSにcontributeした話"
date: 2025-10-23
description: "OpenSiv3DというOSSに初めてのcontributeをしました。"
image:
  url: "https://avatars.githubusercontent.com/u/7557228?s=200&v=4"
  alt: "OpenSiv3D"
tags: ["OpenSiv3D"]
---

## はじめに
ついこの前、高専プロコンというものに参加しました。[そのときの体験記はこちら](/blogs/procon36)。  
その際に、visualizerとして[OpenSiv3D](https://github.com/Siv3D/OpenSiv3D)というものを使用していました。使用は3年連続ですね。  
毎年お世話になっているOSSなので、何かしらで恩返し的なものを行いたいなと思っていました。  
そこで、GitHubに立てられていたIssueを一つ選んで、修正プルリクを送り、contributeしました。  
この記事では、その過程を簡単にまとめました。  
contributeと聞くとハードルが高そうに思えますが、全然そんなことないよ～ってことが伝わればいいなと思います。  

## どんなIssueだったの？
[https://github.com/Siv3D/OpenSiv3D/issues/1314](https://github.com/Siv3D/OpenSiv3D/issues/1314)  
こちらが、今回私が修正したIssueです。  
簡単にまとめると、  
「四角形が1点に縮退している場合に、円との交差判定に不具合が発生して、常にtrueが返されてしまう。」  
といったものです。  
Discord上で不具合報告がされていたみたいで、原因の箇所も調査されていました。  
とてもありがたかったです。関数オーバーロードが多く、Visual Studioで定義ジャンプがしにくかったので……  
またこちら側で確認を行っていると、円との交差判定で使われている、点との交差判定にも不具合が見つかりました。

## プルリクを送る
[https://github.com/Siv3D/OpenSiv3D/pull/1320](https://github.com/Siv3D/OpenSiv3D/pull/1320)  
こちらが作成したプルリクです。  
とりあえずリポジトリをforkして、新しいブランチを作成しました。ブランチ名はシンプルにfix_intersectsとしておきました。  
そしたら不具合箇所を修正します。縮退三角形（面積が0.0）の時の条件分岐を適切に付けてあげるだけの修正でした。  
そして、コミットメッセージにIssue番号を入れてコミット、プッシュします。  
GitHub上でブランチを開くと「プルリク作成する？」的なボタンが出てくるので、流れに従って作成画面へ。  
この辺りの流れは、調べたらわかりやすい記事がいっぱい出てくるのでざっくりと。

OSSへのプルリク作成は初めてだったので、普段より丁寧に行いました。  
具体的には、修正箇所の説明に加え、動作確認用のコードと結果を貼っておきました。  
今思うとちょっと冗長だったかも。まあ、ないよりかは良いでしょう。  
コードはそのまま貼るとコメントが長くなりすぎるので、`<details>`タグを使って折り畳みにしました。  
詳しいやりかたは[GitHub公式ドキュメント](https://docs.github.com/ja/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections)を参照してください。

プルリクを作成すると、すぐに開発者の方からコメントが届きました！反応が速すぎる……  
特に指摘事項もなく、すぐにマージされました！初めてのcontributeが完了した瞬間でした。  

## おわりに
OpenSiv3Dは、初めてのcontributeを経験するに持ってこいだと思います。今回の私みたいにね。  
フレームワークとしての日本語ドキュメントが充実しているだけではなく、contributeやbuildガイドも日本語ドキュメントがしっかり整えられています。  
ここまで親切なOSSはあまりないと思います。OpenSiv3D、もっと有名になってくれ～！  

