import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {gained,gap,trendPath,validateInsights,type Insights,type InsightEntry,type InsightRound} from '../apps/fan/src/api/season-insights';
const entry=(id='12',points='100.5'):InsightEntry=>({id,name:'Kimi ANTONELLI',team:'Mercedes',color:'00D7B6',position:1,positionStart:2,points,pointsStart:'75.25'});
const round=(id=10,endsAt='2026-10-25T21:00:00Z'):InsightRound=>({id,meetingId:id,circuit:'Austin',circuitZh:'奥斯汀',endsAt,drivers:[entry()],teams:[{...entry('Mercedes'),name:'Mercedes'}]});
const data=():Insights=>({status:'ready',year:2026,source:'OpenF1',sourceUrl:'https://openf1.org/',license:'CC BY-NC-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-nc-sa/4.0/',syncedAt:'2026-11-01T05:00:00Z',expiresAt:'2026-11-01T11:00:00Z',rounds:[round()]});
beforeEach(()=>{vi.useFakeTimers();vi.setSystemTime(new Date('2026-11-01T06:00:00Z'));});afterEach(()=>vi.useRealTimers());
describe('season insights',()=>{
  it('accepts completed source snapshots and computes decimal gains exactly',()=>{expect(validateInsights(data()).rounds).toHaveLength(1);expect(gained(entry())).toBe(25.25);expect(gap(entry('1','0.3'),entry('2','0.1'))).toBe(0.2);});
  it('rejects expired data, live-window sessions and duplicated records',()=>{
    const expired=data();expired.expiresAt='2026-11-01T06:00:00Z';expect(()=>validateInsights(expired)).toThrow();
    const live=data();live.rounds[0]!.endsAt='2026-11-01T05:31:00Z';expect(()=>validateInsights(live)).toThrow();
    const duplicate=data();duplicate.rounds.push(round());expect(()=>validateInsights(duplicate)).toThrow();
    const rows=data();rows.rounds[0]!.drivers.push(entry());expect(()=>validateInsights(rows)).toThrow();
  });
  it('rejects invalid sources, negative points and data hidden in unavailable responses',()=>{
    expect(()=>validateInsights({...data(),source:'unverified'})).toThrow();
    const negative=data();negative.rounds[0]!.drivers[0]!.points='-1';expect(()=>validateInsights(negative)).toThrow();
    expect(()=>validateInsights({...data(),status:'disabled'})).toThrow();
    expect(validateInsights({...data(),status:'disabled',rounds:[],syncedAt:null,expiresAt:null}).rounds).toEqual([]);
  });
  it('breaks trend lines across missing records instead of adding zeros',()=>{
    const rounds=[round(),{...round(11),drivers:[entry('99')]},round(12)];
    const path=trendPath(rounds,'driver','12',120);expect(path.match(/M/g)).toHaveLength(2);expect(path).not.toContain('L');
    expect(trendPath([round()],'driver','12',100.5)).toBe('M48.00,30.00');
  });
});
