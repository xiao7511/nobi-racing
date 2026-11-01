import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createPrivateKey,sign} from 'node:crypto';
const {ASC_KEY_ID,ASC_ISSUER_ID,ASC_PRIVATE_KEY_PATH}=process.env;
if(!/^[A-Z0-9]{10}$/.test(ASC_KEY_ID||'')||!/^[-a-f0-9]{36}$/.test(ASC_ISSUER_ID||'')||!ASC_PRIVATE_KEY_PATH)throw Error('Provide App Store Connect API credentials through the environment');
const key=createPrivateKey(await readFile(ASC_PRIVATE_KEY_PATH));const now=Math.floor(Date.now()/1000);
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const body=encode({alg:'ES256',kid:ASC_KEY_ID,typ:'JWT'})+'.'+encode({iss:ASC_ISSUER_ID,iat:now-10,exp:now+600,aud:'appstoreconnect-v1'});
const token=body+'.'+sign('sha256',Buffer.from(body),{key,dsaEncoding:'ieee-p1363'}).toString('base64url');
export async function apple(path,method='GET',data){
 if(!path.startsWith('/v1/'))throw Error('Invalid App Store Connect path');
 const response=await fetch('https://api.appstoreconnect.apple.com'+path,{method,signal:AbortSignal.timeout(30000),headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});
 const result=await response.json();if(!response.ok)throw Error('Apple API '+response.status+': '+(result.errors?.[0]?.code||'unavailable'));
 return result;
}
const identifier=process.env.NOBI_APP_ID||'com.nobistudio.racing';
const [apps,bundles,certificates]=await Promise.all([apple('/v1/apps?filter%5BbundleId%5D='+identifier),apple('/v1/bundleIds?filter%5Bidentifier%5D='+identifier),apple('/v1/certificates?filter%5BcertificateType%5D=DISTRIBUTION')]);
await mkdir('.cache/release/ios',{recursive:true});const result={checkedAt:new Date().toISOString(),identifier,appRecords:apps.data.map(app=>({id:app.id,name:app.attributes.name,bundleId:app.attributes.bundleId})),bundleRecords:bundles.data.map(bundle=>({id:bundle.id,identifier:bundle.attributes.identifier})),distributionCertificateCount:certificates.data.length};
await writeFile('.cache/release/ios/account-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
if(process.argv.includes('--provision')){
 if(certificates.data.length>=3)throw Error('Distribution certificate limit: provide an existing signing identity instead');
 let bundle=bundles.data[0];if(!bundle)bundle=(await apple('/v1/bundleIds','POST',{data:{type:'bundleIds',attributes:{identifier,name:'NOBI Racing',platform:'IOS'}}})).data;
 const csr=await readFile('.cache/release/ios/distribution.csr','utf8');
 const certificate=(await apple('/v1/certificates','POST',{data:{type:'certificates',attributes:{certificateType:'DISTRIBUTION',csrContent:csr}}})).data;
 await writeFile('.cache/release/ios/distribution.der',Buffer.from(certificate.attributes.certificateContent,'base64'));
 const profile=(await apple('/v1/profiles','POST',{data:{type:'profiles',attributes:{name:'NOBI Racing App Store',profileType:'IOS_APP_STORE'},relationships:{bundleId:{data:{type:'bundleIds',id:bundle.id}},certificates:{data:[{type:'certificates',id:certificate.id}]}}}})).data;
 await writeFile('.cache/release/ios/NOBI_Racing_App_Store.mobileprovision',Buffer.from(profile.attributes.profileContent,'base64'));
 const prepared={identifier,bundleId:bundle.id,certificateId:certificate.id,profileId:profile.id,profileName:profile.attributes.name,appRecordExists:apps.data.length>0};await writeFile('.cache/release/ios/signing-record.json',JSON.stringify(prepared,null,2));console.log('NOBI Racing distribution certificate and provisioning profile prepared.');
}
