import {describe,it,expect} from 'vitest';
import {relatedNews,validateWeekends,type Weekend,type Weekends} from '../apps/fan/src/api/weekends';
const weekend:Weekend={id:1,name:'Mexico City Grand Prix',nameZh:'墨西哥城大奖赛',circuit:'Mexico City',circuitZh:'墨西哥城',location:'Mexico City',locationZh:'墨西哥城',startsAt:'2026-10-30T18:00:00Z',endsAt:'2026-11-01T22:00:00Z',gmtOffset:'-06:00:00',cancelled:false,sprint:false,sessions:[{id:2,name:'Race',kind:'race',startsAt:'2026-11-01T18:00:00Z',endsAt:'2026-11-01T20:00:00Z'}]};
const response=():Weekends=>{const now=new Date().toISOString();return {status:'ready',year:2026,source:'OpenF1',sourceUrl:'https://openf1.org/',license:'CC BY-NC-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-nc-sa/4.0/',syncedAt:now,expiresAt:new Date(Date.parse(now)+21600000).toISOString(),items:[structuredClone(weekend)]};};
describe('race weekend source boundary',()=>{
  it('validates source schedules and Chinese names without inventing sessions',()=>{expect(validateWeekends(response()).items[0]!.sessions).toHaveLength(1);});
  it('rejects duplicate meetings, expiry, malformed source fields and HTML',()=>{
    const duplicate=response();duplicate.items.push(duplicate.items[0]!);expect(()=>validateWeekends(duplicate)).toThrow();
    const expired=response();expired.expiresAt='2020-01-01T00:00:00Z';expect(()=>validateWeekends(expired)).toThrow();
    const html=response();html.items[0]!.nameZh='<script>';expect(()=>validateWeekends(html)).toThrow();
  });
  it('matches news by both event words and dates, never by nationality alone',()=>{
    const items=[{title:'Mexico City race report',summary:'',publishedAt:'2026-11-01T00:00:00Z'},{title:'Mexico City archive report',summary:'',publishedAt:'2025-11-01T00:00:00Z'},{title:'British driver update',summary:'',publishedAt:'2026-11-01T00:00:00Z'},{title:'Mexico City without date',summary:'',publishedAt:null}];
    expect(relatedNews(weekend,items)).toEqual([items[0]]);
  });
});
