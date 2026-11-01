export function validReferenceSource(data:{source:string;sourceUrl:string;license:string;licenseUrl:string}):boolean{
  if(data.source==='OpenF1')return data.sourceUrl==='https://openf1.org/'&&data.license==='CC BY-NC-SA 4.0'&&data.licenseUrl==='https://creativecommons.org/licenses/by-nc-sa/4.0/';
  return data.source==='F1DB'&&data.sourceUrl==='https://github.com/f1db/f1db'&&data.license==='CC BY 4.0'&&data.licenseUrl==='https://creativecommons.org/licenses/by/4.0/';
}
