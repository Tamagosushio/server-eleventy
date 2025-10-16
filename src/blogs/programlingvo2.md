---
title: "自作言語を作ってみたい2"
date: 2025-05-17
description: "エスペラント語ベースに、様々なプログラミング言語の文法をミックスした言語を作ります。"
image:
  url: "../thumbnails/programlingvo2.png"
  alt: "Esperanto+Peggyjs 2"
tags: ["JavaScript", "自作言語"]
---

## はじめに
　[前回の記事](/posts/programlingvo1)では、エスペラント語ベースに、様々なプログラミング言語の文法をミックスした言語を作りました。  
　今回は、前回の記事で作成した言語の文法をさらに整備していきます。

### 配列
```javascript
MemberExpression
  = base:Term tail:(_ MemberAccess)* {
    return tail.reduce((acc, x) => `${acc}${x[1]}`, base);
  }
MemberAccess
  = "." idx:[0-9]+ {
    return `[${idx.join("")}]`;
  } / "[" _ idx:Expression _ "]" {
    return `[${idx}]`;
  }
ArrayLiteral
  = "[" _ elements:(Expression (_ "," _ Expression)*)? _ ","? _ "]" {
    const allElements = elements
      ? [elements[0], ...(elements[1].map(x => x[3]))]
      : [];
    return `[${allElements.join(", ")}]`;
  }
```
　とまあ`var listo = [0,1,2]`のようにして、配列を作ることができます。  
　そして配列の要素へのアクセスですが、`listo.0`のようにして、`0`番目の要素にアクセスすることができます。  
　ここはオリジナル要素です。定数であれば`.`でアクセスできるようにしました。  
　もちろん`[]`でアクセスすることもできます。  

### 代入演算子
```javascript
AssignmentExpression
  = name:MemberExpression _ op:AssignmentOperator _ value:Expression {
    return `${name} ${op} ${value}`;
  }
AssignmentOperator
  = "=" / "*=" / "/=" / "%=" / "+=" / "-="
```
　まあなんてことはないですね。  
　もともとあった代入式をちょいと変えて、演算子を追加しただけです。

### 標準入出力
　主にデバッグ用に作っておきます。Node.jsの`console.log`をそのまま使えるようにします。  
　また標準入力については、今回は`readline-sync`を使うので、
```shell
npm install readline-sync
```
でインストールしておきます。  
　関数呼び出しに場合分けして処理します。（かなり突貫気味な実装ですが……）
```javascript
CallExpression
  = callee:MemberExpression tail:(_ Argument)* {
    if(callee === "$vidigas") return `console.log${tail.map(x => x[1]).join("")}`;
    else if(callee === "$enigas") return `require("readline-sync").question${tail.map(x => x[1]).join("")}`;
    else if(callee === "$analizasDecimalon") return `parseFloat${tail.map(x => x[1]).join("")}`;
    return tail.reduce((acc, x) => `${acc}${x[1]}`, callee);
  }
```
　`vidigas()`で変数や文字列を標準出力します。また、`enigas()`で標準入力を受け取ります。  
　この関数は、`String`型の値を返すため、文字列から数値に変換する`analizasDecimalon()`も用意しておきました。  

### 引数なしラムダ式
```javascript
LambdaExpression
  = i:Identifier? _ "@" _ body:(Expression) {
    return `${i ?? "()"} => ${body}`;
  }
```
　ラムダ式の構文をちょっと変えて、`var f = @ "hello";`のようにして、`f()`で`"hello"`を返す関数を作ることができます。  
　JavaScript側のコードとして、引数宣言がなければ空の丸括弧`()`を返すようにしています。まあ当たり前ですね。

### ラムダ式コードブロック
```javascript
LambdaExpression
  = i:Identifier? _ "@" _ body:(Block / Expression) {
    return `${i ?? "()"} => ${body}`;
  }
```
　bodyに`Block`を許可するだけです。

### return, break, continue
　関数のコードブロックを作成した以上、当然return文を実装しなければなりません。  
　そうしないとコードブロックを関数では値を返すことができなくなりますからね。  
```javascript
ReturnStatement
  = "redonas" __ e:Expression {
    return `return ${e}`;
  }
ContinueStatement
  = "dauxrigas" {
    return `continue`;
  }
BreakStatement
  = "rompas" {
    return "break";
  }
```
　まあ愚直実装です。それぞれをエスペラント語に訳してキーワードとしておくだけです。  
　先ほどの標準入出力関数と合わせて、入力された数値の合計を返す関数をこのように作れます。  
```javascript
var sumigasEnigisDecimalojn = @ {
  var sumigo = 0;
  dum(vero){
    var provizoro = enigas("enigo decimalon: ");
    se(provizoro == "q")tiam{
      rompas;
    }alie{
      sumigo += analizasDecimalon(provizoro);
    };
  };
  redonas sumigo;
};
```
　qが入力されたらループを抜けるようにしています。  
　入力された文字列を数値に変換し、変数`sumigo`に加算していきます。  
　最後に`redonas sumigo;`で合計を返します。  

### bit演算、インクリメント/デクリメント
```javascript
OrOperator = "aux" / "||"
AndOperator = "kaj" / "&&"
BitOperator = "&" / "^" / "|"
EqualOperator = "==" / "!="
RelatOperator = ">=" / ">" / "<=" / "<"
ShiftOperator = ">>>" / ">>" / "<<"
AddOperator = "+" / "-"
MultiOperator = "*" / "/" / "%"
UpdateOperator = "++" / "--"
NotOperator = "ne" / "!" / "~"
```
　これも特筆するべきことはないでしょう。下になるほど優先度高いです。  
　bit演算の式の定義は省略しますが、インクリメント/デクリメントは示しておきます。  
```javascript
UpdateExpression
  = i:CallExpression _ op:UpdateOperator? {return `${i}${op ?? ""}`;}
  / op:UpdateOperator? _ i:CallExpression {return `${op ?? ""}${i}`;}
```
前置と後置の場合分けをしています。  

### 負数
　ここで、今更になって負の数の定義をしていないことに気づきました。  
　パパっと実装しておきましょう。
```javascript
SignedNumber
  = sign:("+" / "-")? num:Number {
    return `${sign ?? ""}${num}`;
  }
```
　これで、`-12.3`のように負の数を表すことができます。  
　しかし、この実装がなくても負数を表現できます。加減算の左の項がないものと考えられますからね。  
　ですがこれでは、たとえば`var a = -12.3;`のようにした際に、JavaScriptの変換では、`let a = null - 12.3;`となってしまいます。  
　これでも多分大丈夫でしょうが、何か不具合の元になる可能性があるので絶っておきます。

### セミコロン位置の調整
　現在の実装では、コードブロックも1つの文として認識させているので、`}`の後ろにセミコロンを付ける必要があります。  
　流石にこれは面倒！ifとかforのコードブロックの後ろにわざわざセミコロン付けるの嫌ですよね！  
　これを修正しようと思ったらもっと面倒なことになってしまいました。
```javascript

Program
  = _ stmts:(
      s:StatementEndsWithBlock _ {return s;}
    / s:StatementNeedsSemicolon _ ";" _ {
        if(s == null) return null;
        else return `${s};`;
      }
    )* e:Expression? _ {
      const code = stmts.filter(s => s != null).join("\n");
      const returnCode = e ? `return (${e});` : "";
      return `(() => {\n${code}${returnCode}\n})()`;
    }
Block
  = "{" _ stmts:(
      s:StatementEndsWithBlock _ {return s;}
    / s:StatementNeedsSemicolon _ ";" _ {
        if(s == null) return null;
        else return `${s};`;
      }
    )* _ "}" {
      const code = stmts.filter(s => s != null).join("\n");
      return `{\n${code}\n}`;
    }
  
StatementNeedsSemicolon
  = DoWhileStatement / VariableDeclaration / ReturnStatement / ContinueStatement / BreakStatement / Expression
StatementEndsWithBlock
  = Block / IfThenElseStatement / ForStatement / WhileStatement

IfThenElseStatement
  = "se" _ "("_ e:Expression _")" _ "tiam" _ trueBody:Block _ "alie" _ falseBody:Block {
    return `if(${e})${trueBody}else${falseBody}`;
  }
ForStatement
  = "por" _ "(" _ init:(VariableDeclaration / Expression)? _ ";" _ cond:Expression? _ ";" _ update:Expression? _ ")" _ body:(
      b:Block {return b;}
      / s:StatementNeedsSemicolon _ ";" _ {return s;}
    ) {
    let bodyCode;
    if(typeof(body) === "string" && body.trim().startsWith("{") && body.trim().endsWith("}")){
      bodyCode = body;
    }else if(body == null){
      bodyCode = `{}`;
    }else{
      bodyCode = `{ ${body}; }`;
    }
    return `for (${init ?? ""}; ${cond ?? ""}; ${update ?? ""}) ${bodyCode}`;
  }
WhileStatement
  = "dum" _ "(" _ cond:Expression _ ")" _ body:(
      b:Block {return b;}
      / s:StatementNeedsSemicolon _ ";" _ {return s;}
    ) {
    let bodyCode;
    if(typeof(body) === "string" && body.trim().startsWith("{") && body.trim().endsWith("}")){
      bodyCode = body;
    }else if(body == null){
      bodyCode = `{}`;
    }else{
      bodyCode = `{ ${body}; }`;
    }
    return `while (${cond}) ${bodyCode}`;    
  }
DoWhileStatement
  = "fari" _ body:Block _ "dum" _ "(" _ cond:Expression _ ")" {
    return `do ${body} while(${cond})`;
  }
```
　まず、現在ある文を、コードブロックがひっつく（最後にセミコロンがつかない）可能性があるかどうかで分類分けしています。  
　（`statementNeedsSemicolon`、`statementEndsWithBlock`）  
　コードブロックがひっつく可能性のある文(se-tiam-alie, por, dum)は、愚直に場合分けをしました。
　body部分がコードブロック、`{`で始まり`}`で終わっているなら、そのまま`body`を返します。  
　bodyが何もない、`null`なら、`{}`を返します。  
　それ以外の場合、つまり単一文の場合は、コードブロック化させます。  
　そして、`Program`と`Block`でも、`StatementNeedsSemicolon`と`StatementEndsWithBlock`で場合分け。  
　コードブロックがつく文はセミコロンを不要にします。  、つかない文にはセミコロンを必須とします。  
　これが、大まかな概要です。より具体的なことはコードを見てください。見て。これ以上の言語化はむずかしい。

### コメント行
　大事なものを忘れていました。コメントアウトです。  
　コメントアウトのない言語はカスです。聞いてるか、jsonよ。  
　この言語では、一般的なものに合わせ`//`で始まる行はコメント行として扱います。  
```javascript
CommentStatement
  = "//" content:(![\n\r] .)* {
    return null;
  }
```
　`//`で始まる改行文字除く任意の連続文字列を、`null`として返すようにします。  
　これを、`Program`と`Block`の`stmts`に追加します。  
```javascript
    s:StatementEndsWithBlock _ {return s;}
  / s:CommentStatement _ {return s;}
  / s:StatementNeedsSemicolon _ ";" _ {
```
　これで、コメント行が追加できました。  

## まとめ
　これでようやく上級のプログラミング言語っぽくなってきたんではないでしょうか。  
　しかし、まだ不満点もありまして……遅い！！  
　単純にJavaScriptへの変換が遅いんですよ。これではダメ。  
　プログラミングにおいて、動作が遅いというのはそれだけで不具合と言えるほどです。  
　ただ、この問題をどう解決するのか……それがまだ定まりきっておらず。  
　前回の記事の最後で言ったように、LLVMでアセンブラを吐かせるようにするか。  
　あるいは、C++のBoostの中に、パーサー機能があるらしいので、それを使ってみるか。それともそれ以外の方法を取るか。  
　とりあえず、まだまだこのシリーズは続きますよ～。     

