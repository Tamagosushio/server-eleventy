---
title: "C++の定義済みマクロを見てみる"
date: 2025-12-31
description: "案外知らない定義済みマクロ、ちょっと覗いてみようじゃないか。"
image:
  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/ISO_C%2B%2B_Logo.svg/330px-ISO_C%2B%2B_Logo.svg.png"
  alt: "C++"
tags: ["C++"]
---

## はじめに
フレームワークや大規模システムのコードを見てみると、定義済みマクロが結構使われてたりします。  
「うわかっけぇ～！」となっても、いつもそこで終わってしまうので、ちょっとは知識をつけておこうかなと。  
この記事では、見ていた中で面白そうなものをいくつかピックアップして、軽く紹介します。  

## 環境
- Windows11
- g++ 14.2.0
- C++20

## 紹介
### `__PRETTY_FUNCTION__`
現在実行されている関数を取得する。  
関数名だけでなく、引数や戻り値の型、所属するクラスなども取得できる。  
これは明らかに便利ですね！デバッグ環境が乏しいときでも効率的にできます。
```cpp
#include <iostream>
#include <string>

void hoge(int arg) {
  std::cout << __PRETTY_FUNCTION__ << std::endl;
  return;
}

class Fuga {
public:
  static void fuga(void) {
    std::cout << __PRETTY_FUNCTION__ << std::endl;
  }
};

int main() {
  std::cout << __PRETTY_FUNCTION__ << std::endl;
  hoge(67);
  auto piyo = [](std::string str) {
    std::cout << __PRETTY_FUNCTION__ << std::endl;
  };
  Fuga::fuga();
  piyo("fuga!");
  return 0;
}
```
実行結果
```shell
int main()
void hoge(int)
static void Fuga::fuga()
main()::<lambda(std::string)>
```

### `__TIMESTAMP__`
そのソースファイルが最後に更新された日時を取得する。  
Gitなどでバージョン管理しないとき、簡易的な管理として使えそうです。  
```cpp
#include <iostream>

int main() {
  std::cout << __TIMESTAMP__ << std::endl;
  return 0;
}
```
実行結果
```shell
Wed Dec 31 23:23:37 2025
```

### `__COUNTER__`
これが登場するたびに値が0から1ずつインクリメントされる。  
トークン連結演算子`##`と組み合わせて、衝突しない変数名を生成することができる。  
例えば、コンストラクタで測定を開始し、デクストラクタで測定を終了する変数を考えてみる。  
同一のスコープでこの変数を2つ作りたいとき、ユーザーは本来であれば変数名が衝突しないように気をつける必要がある。  
しかし、以下のコードのようにすれば、衝突しない変数名を避けることができ、簡易的な時間計測が可能になる。  
```cpp
#include <iostream>
#include <chrono>
#include <thread>

// 一意の変数名を生成する
#define CONCAT_IMPL(x, y) x##y
#define CONCAT(x, y) CONCAT_IMPL(x, y)
#define ANONYMOUS_VARIABLE(prefix) CONCAT(prefix, __COUNTER__)

// コンストラクタで測定開始
// デクストラクタで測定終了
class ScopeTimer {
 public:
  explicit ScopeTimer(const char* name) 
      : name_(name), 
        start_(std::chrono::steady_clock::now()) {
    std::cout << "[Start] " << name_ << std::endl;
  }
  ~ScopeTimer() {
    auto end = std::chrono::steady_clock::now();
    auto duration = end - start_;
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(duration).count();
    std::cout << "[End]   " << name_ << " (" << ms << " ms)" << std::endl;
  }
 private:
  const char* name_;
  std::chrono::time_point<std::chrono::steady_clock> start_;
};

// 時間計測する変数を生成する
#define MEASURE_SCOPE(name) \
  ScopeTimer ANONYMOUS_VARIABLE(timer_)(name)

int main() {
  MEASURE_SCOPE("Heavy Process 1");
  std::this_thread::sleep_for(std::chrono::milliseconds(200));
  MEASURE_SCOPE("Heavy Process 2");
  std::this_thread::sleep_for(std::chrono::milliseconds(100));
  return 0;
}
```
実行結果
```shell
[Start] Heavy Process 1
[Start] Heavy Process 2
[End]   Heavy Process 2 (109 ms)
[End]   Heavy Process 1 (322 ms)
```

## おわりに
まだまだ他にも色々ありますが、ひとまず今回はここまで。  
調べてみると、結構使えそうなものがあるんですね～！  
ちなみにこの記事、大晦日の23:58に書き終わりました！  
良いお年を！  
