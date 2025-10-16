let parserReady = false;
const runButton = document.getElementById("run-button");
const outputElement = document.getElementById("output");

// 初期状態のメッセージを設定
if(outputElement){
  outputElement.textContent = "Peggyライブラリと文法を読み込んでいます...";
}
if(runButton){
  runButton.classList.add("loading"); // ボタンのテキストをCSSで「準備中...」に
  runButton.disabled = true;
}

// Peggyライブラリが利用可能か再確認
if(typeof peggy === "undefined" || typeof peggy.generate === "undefined"){
  console.error("Peggyライブラリまたはpeggy.generateが見つかりません");
  if(outputElement){
    outputElement.textContent =
      "エラー: Peggyライブラリが正しく読み込まれていません。\nページを再読み込みしてください。";
  }
}else{
  // 文法定義を読み込む
  fetch("grammar.pegjs")
    .then((response) => {
      if(!response.ok){
        throw new Error(
          `文法ファイルの読み込みに失敗しました \n(HTTP ${response.status})`,
        );
      }
      if(outputElement){
        outputElement.textContent =
          "文法ファイルを読み込みました。\nパーサーを生成しています...";
      }
      return response.text();
    })
    .then((grammar) => {
      try{
        window.parser = peggy.generate(grammar);
        parserReady = true;
        if(runButton){
          runButton.disabled = false;
          runButton.classList.remove("loading"); // ボタンのテキストをCSSで「実行」に
        }
        if(outputElement){
          outputElement.textContent =
            "パーサーの準備ができました。\nコードを入力して実行してください。";
        }
      }catch(e){
        console.error("文法の生成に失敗しました:", e);
        if(outputElement){
          outputElement.textContent = "文法の生成に失敗しました: " + e.message;
        }
      }
    })
    .catch((error) => {
      console.error("初期化中にエラーが発生しました:", error);
      if(outputElement){
        outputElement.textContent = "初期化エラー: " + error.message;
      }
    });
}

function parseCode(){
  const input = document.getElementById("input").value;
  if(!outputElement){
    console.error("出力用要素が見つかりません。");
    return;
  }
  if(!parserReady){
    outputElement.textContent =
      "パーサーの初期化中です。\nしばらくお待ちください。";
    return;
  }
  if(!input.trim()){
    outputElement.textContent = "コードを入力してください。";
    return;
  }
  try{
    const logs = [];
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      logs.push(args.join(" "));
      originalConsoleLog.apply(console, args); // 元のconsole.logも実行
    };
    const result = window.parser.parse(input);
    console.log = originalConsoleLog; // コンソール出力を元に戻す
    let resultText = "";
    if (logs.length > 0) {
      resultText += "実行結果 (コンソール出力):\n" + logs.join("\n") + "\n\n";
    }
    resultText += "戻り値:\n" +
      (result === undefined ? "undefined" : JSON.stringify(result, null, 2));
    outputElement.textContent = resultText;
  }catch(error){
    outputElement.textContent = "エラー:\n" + error.message +
      (error.location
        ? `\n場所: Line ${error.location.start.line}, Column ${error.location.start.column}`
        : "");
    console.error("パースエラー:", error);
  }
}
