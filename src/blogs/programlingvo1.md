---
title: "自作言語を作ってみたい1"
date: 2025-05-10
description: "エスペラント語ベースに、様々なプログラミング言語の文法をミックスした言語を作ります。"
image:
  url: "../thumbnails/programlingvo1.png"
  alt: "Esperanto+Peggyjs 1"
tags: ["JavaScript", "自作言語"]
---

## 動機
　自分で言語を作るってかっこいいですよね。  
　なので、作ります。  
　[これがリポジトリです。](https://github.com/Tamagosushio/programlingvo)  
　（READMEとかは全然整備してません……）

## 特徴
　「ぼくのかんがえたさいきょうのぷろぐらみんぐげんご」を作るにあたって、ある程度特徴を決めないといけません。  
　なので、私が欲しいなぁと思う特徴を適当に列挙し以下に並べてみます。  
- エスペラント語ベース
  - 最近エスペラント語を勉強しているので
  - if文 -> se文、for文 -> por文、のようにごく簡単に置き換える
- 手続き型言語
- JIS配列で入力するのが楽な言語
- C++, Python, JavaScriptを合体させたような文法
- 文はセミコロン区切り
　とまあ、こんな具合で。  
　実装途中に思いついたとかのもどんどん入れていきます。  

## 構文解析(parser)
　とりあえず構文解析は、[『自作プログラミング言語を初級者が1週間で作る方法』](https://zenn.dev/charako/articles/bd9d722a8d48c9)を参考に、Node.jsの[Peggy](https://peggyjs.org/online.html)を書いていきます。  
　簡単に言うと、構文が正しく書けているかは、いったんJavaScriptに変換&実行して確かめよう！といったかんじです。  
　当然このインタプリタだけでも十分に動きますが、それだけだと味気ないので、もっと発展させたいところではあります。（LLVM使ってコンパイラにするとか）  

## 下準備
　用意した文を、パーサーに与える処理を書いておきます。  
`test.js`
```javascript
const fs = require("fs");
const parser = require("./parser");
const code = fs.readFileSync("./input.espr", "utf-8");
const ast = parser.parse(code);
console.dir(ast, {depth: null});
```
`package.json`
```json
{
  "scripts": {
    "test": "npx peggy grammar.pegjs -o parser.js && node test.js"
  },
}
```
　`./parser`は、peggyjsを変換したものです。  
　テストしたいプログラムファイルを`./input.espr`としておきます。  
　読み込んだプログラムをパーサーに与え、返り値を受け取り表示するといった処理です。  
　peggyjsを変換するには、一度コマンドを叩く必要があります。  
　なので`scripts`内に変換コマンドとテストの実行コマンドを書いておきましょう。  
　これで下のコマンドを叩くだけでテストまで実行できます。  
```shell
npm run test
```

## 実装
　peggyjsの文法については基本的に言及しません。  
　BNFの理解さえあればある程度直感的に分かると思います。  
　`_`（1つのアンダーバー）は0文字以上の空白文字を、  
　`__`（2つのアンダーバー）は1文字以上の空白文字を表します。  
　この2つは頻出ですが最下部で定義しており名前でも分かりにくいため、先に書いておきました。  
### Start
　まずはエントリポイントのようなものとなる、`Start`を作っておきます。  
```javascript
Start
  = _ p:Program _ {
    const prettier = require("prettier");
    prettier.format(p, {parser:"babel"}).then((code) => {
      console.log(code);
    });
    return eval(p);
  }
```
　`Program`は、まあその名の通りプログラムを表します。  
　BNFの慣習的なものとして、上位の構文から順に書いていきます。  
　そのため、まだ実装していない下位の構文が出てきます。  
　おおよそどんなものか分かるように、しっかりと分かりやすい命名をしなければなりません。  
　本質的な箇所は、`return eval(p);`だけです。  
　ここで、解析し変換したJavaScriptコードの文字列を評価し、返り値にします。  
　デバッグ用に、`prettier`でJavaScriptコードを整形し、出力させておきます。  
　`prettier.format()`は`Promise`が返ってくるらしいので、`then`内で出力処理を書きました。  
### Program
　プログラム、つまり「文」の集合です。  
```javascript
Program
  = statements:(Statement _ ";" _)* e:Expression? _ {
    const code = statements.reduce((acc, x) => `${acc} ${x[0]};\n`, "");
    const returnCode = e ? `return (${e});` : "";
    return `(() => {\n${code}${returnCode}\n})()`;
  }
```
　`reduce()`を使って、文をセミコロン改行区切りにします。  
　最後に「式」があれば、これを返り値にします。
### Statement
```javascript
Statement = Block / IfThenElseStatement / ForStatement / WhileStatement / DoWhileStatement / VariableDeclaration / Expression
Block
  = "{" _ stmts:(Statement _ ";" _)* _ "}" {
    return `{\n${stmts.map(s => s[0]).join(";\n")};\n}`;
  }
IfThenElseStatement
  = "se" _ "("_ e:Expression _")" _ "tiam" _ trueBody:Statement _ "alie" _ falseBody:Statement {
    return `if(${e})${trueBody}else${falseBody}`;
  }
ForStatement
  = "por" _ "(" _ init:(Expression / VariableDeclaration)? _ ";" _ cond:Expression? _ ";" _ update:Expression? _ ")" _ body:Statement {
    return `for (${init ?? ""}; ${cond ?? ""}; ${update ?? ""}) ${body}`;
  }
WhileStatement
  = "dum" _ "(" _ cond:Expression _ ")" _ body:Statement {
    return `while (${cond}) ${body}`;
  }
DoWhileStatement
  = "fari" _ body:Statement _ "dum" _ "(" _ cond:Expression _ ")" {
    return `do ${body} while(${cond})`;
  }
VariableDeclaration
  = "var" __ name:Identifier _ "=" _ value:Expression {
    return `let ${name} = ${value}`;
  }
```
　コードブロック, if(se)文, for(por)文, while(dum)文, do-while(fari-dum)文, 変数宣言（初期化）を実装しました。  
　コードブロックは波括弧`{}`でまとめることにします。まあよくあるやつですね。  
　ただこれも`Program`に入るので、波括弧の終わりにはセミコロンを付ける必要があります。  
　修正したいですね。C++でもclass宣言の終わりのセミコロンはよく忘れるので。  
　if(se)文は、正確にはif-then-else(se-tiam-alie)文ですね。  
　条件->真のとき->偽のときの順で記述します。  
　for(por)文はC++準拠で、初期化処理->条件->ループ時処理の順でセミコロン区切りにします。  
　最初の初期化処理のところだけは、変数宣言と変数代入の両方を許可したいため、文と式の両方を入れています。  
　while(dum)文、do-while(fari-dum)文については特筆することはないでしょう。  
　最期に変数宣言（初期化）ですが、型の指定は行わず、`var`にしておきます。  
　エスペラント語でも変数は「variablo」といい、最初の3文字を取った結果昔のJavaScriptみたいになってしまいました。  
### Expression
```javascript
Expression = LambdaExpression / AssignmentExpression / OrExpression

LambdaExpression
  = i:Identifier _ "@" _ e:Expression {
    return `${i} => ${e}`;
  }

AssignmentExpression
  = name:Identifier _ "=" _ value:Expression {
    return `${name} = ${value}`;
  }

OrExpression
  = head:AndExpression tail:(_ OrOperator _ AndExpression)* {
    return tail.reduce((acc, x) => `(${acc}) || (${x[3]})`, head);
  }
AndExpression
  = head:EqualExpression tail:(_ AndOperator _ EqualExpression)* {
    return tail.reduce((acc, x) => `(${acc}) && (${x[3]})`, head);
  }
EqualExpression
  = head:RelatExpression tail:(_ EqualOperator _ RelatExpression)? {
    return tail === null ? head : `(${head}) ${tail[1]} (${tail[3]})`;
  }
RelatExpression
  = head:AddExpression tail:(_ RelatOperator _ AddExpression)? {
    return tail === null ? head : `(${head}) ${tail[1]} (${tail[3]})`;
  }
AddExpression
  = head:MultiExpression tail:(_ AddOperator _ MultiExpression)* {
    return tail.reduce((acc, x) => `(${acc}) ${x[1]} (${x[3]})`, head);
  }
MultiExpression
  = head:CallExpression tail:(_ MultiOperator _ CallExpression)* {
    return tail.reduce((acc, x) => `(${acc}) ${x[1]} (${x[3]})`, head);
  }
CallExpression
  = callee:Term tail:(_ Argument)* {
    return tail.reduce((acc, x) => `${acc}${x[1]}`, callee);
  }
Argument
  = "(" _ e:Expression _ ")" {
    return `(${e})`;
  }

OrOperator = "aux" / "||"
AndOperator = "kaj" / "&&"
EqualOperator = "==" / "!="
RelatOperator = ">=" / ">" / "<=" / "<"
AddOperator = "+" / "-"
MultiOperator = "*" / "/" / "%"
```
　式は、ラムダ式、代入式、数式の現状3つです。  
　ラムダ式は、「<変数> @ <式>」としています。  
　1変数のみのアロー関数のようなイメージです。  
　引数を2個以上入れる場合には、「<変数> @ <変数> @ <式>」としてやればいいです。
　次に代入式ですが、まあそのままですね。  
　`VariableDeclaration`についていた`var`を取っ払ったかんじです。  
　そして数式です。演算優先度としては、  
　関数呼び出し > 乗除算 > 加減算 > 不等号 > 等号 > 論理積 > 論理和  
　となってます。  
　また、`RelatExpression`と`EqualExpression`は、演算子を0,1回のみしか繋げられなくしてあります。  
　比較演算子を複数繋げると予期せぬ動作が発生しうるためです。  
### Term
　ハイライトが崩れています。おそらくエスケープ文字処理部分のせいでしょう。
```javascript
Term
  = Paren / String / Number / Identifier / Boolean / Undefined / Null / IfThenElseTerm

IfThenElseTerm
  = "se" __ a:Expression __ "tiam" __ b:Expression __ "alie" __  c:Expression {
    return `${a} ? ${b} : ${c}`;
  }
Paren
  = "(" _ e:Expression _ ")" {
    return `(${e})`;
  }
String
  = "\"" chars:Char* "\"" {
    return `"${chars.join("")}"`;
  }
Char
  = EscapedChar / NormalChar
EscapedChar
  = "\\" c:. {
    return "\\" + c;
  }
NormalChar
  = !["\\] . {
    return text();
  }
Number = Float / Integer
Float
  = Integer "." [0-9]+ {
    return text();
  }
Integer
  = [1-9] [0-9]* {
    return text();
  } / "0"
Boolean
  = bool:("vero" / "malvero") !IdentifierContinue {
    return text()==="vero" ? "true" : "false";
  }
Undefined
  = "nedifinito" !IdentifierContinue{
    return "undefined";
  }
Null
  = "nulo" !IdentifierContinue{
    return "null";
  }

Identifier
  = !ReservedWord head:IdentifierStart tail:IdentifierContinue* {
    return "$" + text();
  }
ReservedWord
  = ("var" / "nedifinito" / "nulo" / "vero" / "malvero" / "kaj" / "aux" / "se" / "tiam" / "alie" / "por" / "dum" / "fari") !IdentifierContinue
IdentifierStart = [A-Za-z_]文字
IdentifierContinue = [0-9A-Za-z_]
__ = [ \t\n\r]+
_  = [ \t\n\r]*
```
　丸括弧、文字列、数値、変数、真偽値、undefined(nedifinito)、null(nulo)、三項演算子  
　を定義しました。  
　三項演算子は、if-then-else(se-tiam-alie)で記述します。  
　CやJavaScriptのものと異なり、Pythonのようにスペースを空けなければならないことに注意です。  
　文字列は`"`（ダブルクォーテーション）で括ることにします。  
　`'`（シングルクォーテーション）では括らせません。（思想）  
　エスケープ処理はバックスラッシュで行わせます。  
　数値は、整数と小数点の両方を指します。  
　真偽値は、`vero`と`malvero`の2つです。  
　エスペラント語では、単語の頭にmalが付くと反対の意味になるのでわかりやすいですね。  
　また、undefined(undifinito)とnull(nulo)も追加しておきました。  
　nullはともかくとして、undefinedの登場によりかなりJavaScript味が増しました。  
　最後にある変数名の定義ですが、自作言語の予約語に完全一致するものは弾きておきます。  
　また、内部的にはJavaScriptなので、変数名にも同等の制約がつきます。  
　JavaScriptの予約語も使えるように、内部的に変数名の先頭に`$`を付けて被らないようにしています。  

## テスト
　ひとまず今回はここまでにして、実装した文法をおおよそ網羅できるようなテストコードを組んでみました。  
`input.espr`
```
var x = 10;
var y=20;
var adicias4 = a @ b @ c @ d @ a+b+c+d;
var adicias3 = adicias4(0);
var adicias2 = adicias3(0);
var s = 0;
var i = 0;
por(i = 0; i < 10; i = i + 1){
  s = adicias2(s)(i);
};
dum(i){
  se(i%2 == 0)tiam{
    s = adicias2(s)(i);
  }alie{
    s = s - i;
  };
  i = i - 1;
};
i = 15;
fari{
  s = adicias2(s)(i);
  i = i - se (s%2 == 0) tiam 1 alie 2;
}dum(i);
s = s + (se vero tiam se vero tiam 3 alie 4 alie 2 * 10) * 10;
s = s + se vero && malvero tiam 1 alie 10;
s = s + se vero || malvero tiam 1 alie 10;
"Kalkulis: " + s
```
　このコードを追いかけてみると、出力は`Kalkulis: 179`となります。  
　（追いかける過程は流石に省略させてください。）  
　これでテストを行ってみると、  
```shell
$ npm run test
> programlingvo@1.0.0 test
> npx peggy grammar.pegjs -o parser.js && node test.js
```
``` javascript
'Kalkulis: 179'
(() => {
  let $x = 10;
  let $y = 20;
  let $adicias4 = ($a) => ($b) => ($c) => ($d) => $a + $b + $c + $d;
  let $adicias3 = $adicias4(0);
  let $adicias2 = $adicias3(0);
  let $s = 0;
  let $i = 0;
  for ($i = 0; $i < 10; $i = $i + 1) {
    $s = $adicias2($s)($i);
  }
  while ($i) {
    if ($i % 2 == 0) {
      $s = $adicias2($s)($i);
    } else {
      $s = $s - $i;
    }
    $i = $i - 1;
  }
  $i = 15;
  do {
    $s = $adicias2($s)($i);
    $i = $i - ($s % 2 == 0 ? 1 : 2);
  } while ($i);
  $s = $s + (true ? (true ? 3 : 4) : 2 * 10) * 10;
  $s = $s + (true && false ? 1 : 10);
  $s = $s + (true || false ? 1 : 10);
  return "Kalkulis: " + $s;
})();
```
　うまくいってそうですね！  
　最初に最終出力の`Kalkulis: 179`が表示され、  
　そのあとに、`prettier`で整形されたコードが出てきました。  

## まとめ
### 今回実装したもの
- 整数/小数/文字列/真偽値/undefned/null
- 変数の初期化宣言
- 変数代入
- if-then-else(se-tiam-alie)文
- for(por)文
- (dum), do-while(fari-dum)文
- 三項演算子(se ~ tiam ~ alie ~)
- ラムダ式(@)
- カリー化
- 関数呼び出し > 乗除算 > 加減算 > 不等号 > 等号 > 論理積 > 論理和

今回のまとめとしてはこんなところでしょうか。  
200行弱でプログラミングの基礎である、順次反復分岐を実装できました。  
### 今後実装したいもの
- bit演算
- ラムダ関数のコードブロック
- return文
- break, continue文
- 配列、オブジェクト
- インクリメント、デクリメント
- 標準入出力
- 演算代入演算子
- セミコロン必要箇所の調整

　こんなところでしょうか。  
　特に優先度は決めていませんが、プログラミングの幅が広がるものを早めに実装したいですね。  
　この中だと配列、オブジェクト、標準入出力あたりですね。  
　まあ急がず焦らず気が向いたときにぼちぼち作っていきますよ～。  


