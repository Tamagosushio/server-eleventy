---
layout: "base.njk"
title: たまごすしのホームページ
description: ホームページ
---

<div id="ja" lang="ja">

webの勉強がてらに作ったので、UIやデザインがころころと変わります。  
今は[Eleventy](https://www.11ty.dev)を試しています。  

初見の人はまず[Portfolio](/portfolio)を見てください。  
どんな人かが大体分かるかと思います。  

2024年の冬コミ（C105）で、サークルMUHOとして参加しました。  
そのときに頒布した同人誌の電子版を[Booth](https://muho.booth.pm/items/6511207)にて販売中です。  
内容としては、DiscordのBotをJavaScriptで作ろう、といったかんじです。  
まあタイトルどおりですね。  

</div>


<div id="eo" lang="eo" hidden>

Interfaco kaj desegno ofta ŝanĝiĝas ĉar mi lernas retejo.  
Mi provas ["Eleventy"](https://www.11ty.dev) nun.  

Se vi estas unuavida homo, bonvolu vidu ["Portfolio"](/portfolio).  
Mi pensas ke vi comprenuos min.  

Mi partoprenis en komiksa merkato (C105) kiel anaro "MUHO".  
Mi vandas la fanzino en ["Booth"](https://muho.booth.pm/items/6511207)  

La enhavo estas ke ni faru Discord roboto kun JavaScript.

</div>

<section class="home-latest" aria-labelledby="latest-title">
<div class="home-latest-header">
<h2 id="latest-title">最新の記事</h2>
<a href="/blogs/">記事一覧 →</a>
</div>

<ol class="home-post-list">
{% assign recentPosts = collections.blogs | reverse %}
{% for post in recentPosts limit: 3 %}
<li>
<a href="{{ post.url }}">
<span class="home-post-index">0{{ forloop.index }}</span>
<span class="home-post-copy">
<strong>{{ post.data.title }}</strong>
<span>{{ post.data.description }}</span>
</span>
<time datetime="{{ post.date | dateFormat }}">{{ post.date | dateFormat }}</time>
<span class="home-post-arrow" aria-hidden="true">↗</span>
</a>
</li>
{% endfor %}
</ol>
</section>
