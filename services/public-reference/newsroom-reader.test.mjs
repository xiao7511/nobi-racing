import {test} from 'node:test';import assert from 'node:assert/strict';
import {originalArticles,indexedArticle} from './newsroom-reader.mjs';
test('bilingual in-app reports retain data attribution and distinguish cumulative standings from race classifications',()=>{
 const data={news:[{title:'Test Grand Prix: Driver wins',titleZh:'测试大奖赛：车手夺冠',summary:'A source classification.',summaryZh:'公开赛果摘要。',url:'https://github.com/f1db/f1db/blob/main/race-results.yml',publishedAt:'2026-03-01T10:00:00Z'}],weekends:[{id:1,name:'Test Grand Prix',nameZh:'测试大奖赛'}],rounds:[{meetingId:1,drivers:[{position:1,name:'Driver',team:'Team',points:'25'}],teams:[{position:1,name:'Team',points:'40'}]}]};
 const [article]=originalArticles(data,{Driver:'车手',Team:'车队'});assert.match(article.id,/^nobi-[a-f0-9]{24}$/);assert.equal(article.kind,'original');assert.equal(article.paragraphsZh[0],'公开赛果摘要。');assert.match(article.paragraphsEn[2],/season totals/);assert.match(article.sections[0].rows[0].zh,/25 分/);assert.equal(originalArticles(data)[0].id,article.id);assert.equal(originalArticles(null).length,0);
});
test('unlicensed indexed reports never masquerade as the original article or a full translation',()=>{
 const item={id:'a'.repeat(24),title:'F1 news',titleZh:'F1 动态',language:'en',topics:[],publisher:'www.formula1.com',url:'https://www.formula1.com/en/latest',indexedAt:'2026-11-03T01:00:00Z'};
 const article=indexedArticle(item,{topics:[]},null);assert.equal(article.kind,'index-note');assert.equal(article.publishedAt,null);assert.match(article.noticeZh,/不是原文全文/);assert.match(article.paragraphsEn[1],/does not invent/);assert.deepEqual(article.sections,[]);assert.equal(indexedArticle(null,{topics:[]},null),null);
});
