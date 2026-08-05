"use strict";

let parser;

function serializeValue(value) {
  if (value === undefined) {
    return "undefined";
  }

  try {
    const serialized = JSON.stringify(value, null, 2);
    return serialized === undefined ? String(value) : serialized;
  } catch {
    return String(value);
  }
}

function serializeLogArgument(value) {
  return typeof value === "string" ? value : serializeValue(value);
}

async function initialize() {
  try {
    importScripts("peggy.min.js");
    const response = await fetch("grammar.pegjs");
    if (!response.ok) {
      throw new Error(`文法ファイルの読み込みに失敗しました (HTTP ${response.status})`);
    }

    parser = peggy.generate(await response.text());
    self.postMessage({ type: "ready" });
  } catch (error) {
    self.postMessage({
      type: "initialization-error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

self.addEventListener("message", (event) => {
  if (event.data.type !== "execute" || !parser) {
    return;
  }

  const logs = [];
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    logs.push(args.map(serializeLogArgument).join(" "));
    originalConsoleLog(...args);
  };

  try {
    const result = parser.parse(event.data.code);
    self.postMessage({
      type: "result",
      logs,
      result: serializeValue(result),
    });
  } catch (error) {
    self.postMessage({
      type: "execution-error",
      message: error instanceof Error ? error.message : String(error),
      location: error?.location
        ? {
            line: error.location.start.line,
            column: error.location.start.column,
          }
        : null,
    });
  } finally {
    console.log = originalConsoleLog;
  }
});

initialize();
