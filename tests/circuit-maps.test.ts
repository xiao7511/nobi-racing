import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import maps from '../apps/fan/src/content/circuit-maps.json';
describe('licensed circuit maps',()=>{
  it('covers every 2026 circuit with a distinct local SVG and source attribution',()=>{
    expect(Object.keys(maps)).toHaveLength(25);
    expect(new Set(Object.values(maps).map(map=>map.id)).size).toBe(25);
    for(const map of Object.values(maps)){
      const svg=readFileSync(new URL('../apps/fan/public'+map.src,import.meta.url),'utf8');
      const document=new DOMParser().parseFromString(svg,'image/svg+xml');
      expect(document.querySelector('parsererror')).toBeNull();expect(document.querySelectorAll('path').length).toBeGreaterThan(0);
      expect(document.querySelector('script,foreignObject,image,use')).toBeNull();
      expect(map.source).toContain('https://github.com/f1db/f1db/blob/f35a8c61d15d275061475e543b8dc79ac3daad97/');
      expect(Math.abs(map.latitude)).toBeLessThanOrEqual(90);expect(Math.abs(map.longitude)).toBeLessThanOrEqual(180);
    }
  });
  it('uses the venue rather than the Grand Prix name and excludes obsolete layouts',()=>{
    expect(maps['Sakhir'].id).toBe('bahrain-1');expect(maps['Kuala Lumpur'].id).toBe('sepang-1');
    expect(maps['Montreal'].id).toBe('montreal-6');expect(maps['Monte Carlo'].id).toBe('monaco-6');
    expect(maps['Singapore'].id).toBe('marina-bay-4');expect(maps['Madring'].id).toBe('madring-1');
  });
});
