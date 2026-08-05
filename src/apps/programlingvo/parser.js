"use strict";

const EXECUTION_TIMEOUT_MS = 2000;
const DEFAULT_READY_MESSAGE = "実行環境の準備ができました。\nコードを入力して実行してください。";
const runButton = document.getElementById("run-button");
const outputElement = document.getElementById("output");

let worker;
let workerReady = false;
let executionTimer;
let readyMessage = DEFAULT_READY_MESSAGE;

function setStatus(message) {
  if (outputElement) {
    outputElement.textContent = message;
  }
}

function setRunning(running) {
  if (!runButton) {
    return;
  }
  runButton.disabled = running || !workerReady;
  runButton.classList.toggle("loading", running || !workerReady);
}

function startWorker(
  message = "実行環境を準備しています...",
  messageAfterReady = DEFAULT_READY_MESSAGE,
) {
  if (worker) {
    worker.terminate();
  }

  workerReady = false;
  readyMessage = messageAfterReady;
  setStatus(message);
  setRunning(false);

  worker = new Worker("programlingvo-worker.js");
  worker.addEventListener("message", handleWorkerMessage);
  worker.addEventListener("error", (event) => {
    clearTimeout(executionTimer);
    workerReady = false;
    setRunning(false);
    setStatus(`実行環境の初期化に失敗しました: ${event.message}`);
  });
}

function handleWorkerMessage(event) {
  const message = event.data;

  if (message.type === "ready") {
    workerReady = true;
    setRunning(false);
    setStatus(readyMessage);
    return;
  }

  if (message.type === "initialization-error") {
    workerReady = false;
    setRunning(false);
    setStatus(`初期化エラー: ${message.message}`);
    return;
  }

  clearTimeout(executionTimer);
  setRunning(false);

  if (message.type === "result") {
    let resultText = "";
    if (message.logs.length > 0) {
      resultText += `実行結果 (コンソール出力):\n${message.logs.join("\n")}\n\n`;
    }
    resultText += `戻り値:\n${message.result}`;
    setStatus(resultText);
    return;
  }

  if (message.type === "execution-error") {
    const location = message.location
      ? `\n場所: Line ${message.location.line}, Column ${message.location.column}`
      : "";
    setStatus(`エラー:\n${message.message}${location}`);
  }
}

function parseCode() {
  const inputElement = document.getElementById("input");
  const input = inputElement ? inputElement.value : "";

  if (!workerReady) {
    setStatus("実行環境を準備しています。\nしばらくお待ちください。");
    return;
  }

  if (!input.trim()) {
    setStatus("コードを入力してください。");
    return;
  }

  setStatus("実行中...");
  setRunning(true);
  worker.postMessage({ type: "execute", code: input });

  executionTimer = setTimeout(() => {
    startWorker(
      "実行が2秒を超えたため停止しました。\n実行環境を再準備しています...",
      "実行が2秒を超えたため停止しました。\n実行環境を再作成しました。コードを修正して再実行してください。",
    );
  }, EXECUTION_TIMEOUT_MS);
}

startWorker();
