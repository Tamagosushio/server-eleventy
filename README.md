# server-eleventy

[tamagosushi.jp](https://tamagosushi.jp) のソースコードです。静的サイトジェネレーターのEleventyで、ブログ、ポートフォリオ、ブラウザ上で動くデモを生成します。

## 必要な環境

- Node.js 22.12.0以上
- npm

依存関係は `package-lock.json` に固定されています。リポジトリを取得・更新した後は、まず次を実行してください。

```shell
npm ci
```

## 開発

```shell
npm run dev
```

開発サーバーでは画像をブラウザから要求された時点で変換するため、初回起動を短縮しています。

## ビルドと検査

```shell
npm run build:check
```

このコマンドは次をまとめて行います。

1. 以前の `_site` を削除
2. 本番用サイトを `_site` に生成
3. アプリの必須ファイルと不要な生成物を確認
4. 生成HTML内のローカルリンクと画像参照を確認

## 主なディレクトリ

- `src/_data`: サイト情報、ナビゲーションなどの共通データ
- `src/_includes`: 共通レイアウト、テンプレート、CSS部分ファイル
- `src/blogs`: ブログ記事（1記事につき1ディレクトリ）
- `src/portfolio`: ポートフォリオ
- `src/apps`: ブラウザ上で動くデモ
- `src/styles`: CSSのエントリーポイント
- `scripts`: ビルド補助・生成物検査

### CSS

`src/styles/main.css.njk` が `src/_includes/styles` の部分ファイルを順番に結合し、単一の `/styles/main.css` を生成します。スタイルを追加するときは、対象の責務に対応する部分ファイルを編集してください。

### ブログ記事

記事は次のように本文と画像を同じディレクトリへまとめます。`image.url` には `thumbnail.png` のような記事ディレクトリからの相対パスを指定できます。

```text
src/blogs/<slug>/
├── index.md
├── thumbnail.png
└── 本文で使用する画像
```

全記事に共通するレイアウトなどは `src/blogs/blogs.json`、サイト全体で共有する値は `src/_data` に置きます。

## 公開時の注意

`src/apps/procon34-visualizer-web` には大きなWebAssembly関連ファイルがあります。公開サーバーでは `.js`、`.wasm`、`.data` に長期キャッシュを設定し、Brotliまたはgzip圧縮を有効にしてください。ビジュアライザー本体の約48MBのデータは、利用者が開始操作を行うまで読み込まれません。

## ライセンス

[MIT License](LICENSE)
