const response=(status,data)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export default async function handler(req){
  if(req.method!=='POST')return response(405,{error:{message:'Gunakan POST.'}});
  const origin=req.headers.get('origin');
  if(origin&&origin!==new URL(req.url).origin)return response(403,{error:{message:'Origin tidak diizinkan.'}});
  if(!req.headers.get('content-type')?.includes('application/json'))return response(415,{error:{message:'Gunakan application/json.'}});
  const key=req.headers.get('x-api-key')?.trim();
  if(!key||key.length>1024)return response(400,{error:{message:'Exa API key diperlukan.'}});
  try{
    if(Number(req.headers.get('content-length')||0)>20000)return response(413,{error:{message:'Permintaan terlalu besar.'}});
    const raw=await req.text();if(raw.length>20000)return response(413,{error:{message:'Permintaan terlalu besar.'}});
    let body;try{body=JSON.parse(raw);}catch{return response(400,{error:{message:'JSON tidak valid.'}});}
    if(typeof body.query!=='string'||!body.query.trim()||body.query.length>5000)return response(400,{error:{message:'Query Exa harus 1–5.000 karakter. Ringkas pertanyaan pencarian.'}});
    const upstream=await fetch('https://api.exa.ai/search',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key},body:JSON.stringify({query:body.query.trim(),type:'auto',numResults:5,contents:{text:{maxCharacters:2200}}}),signal:AbortSignal.timeout(20000)});
    let data;try{data=await upstream.json();}catch{return response(502,{error:{message:'Exa mengembalikan respons bukan JSON.'}});}
    if(!upstream.ok)return response(upstream.status,{error:{message:typeof data.error==='string'?data.error:data.error?.message||data.message||`Exa HTTP ${upstream.status}`}});
    const results=(Array.isArray(data.results)?data.results:[]).slice(0,5).filter(r=>typeof r.url==='string'&&/^https?:\/\//i.test(r.url)).map(r=>({title:String(r.title||r.url).slice(0,300),url:r.url,text:String(r.text||'').slice(0,2200)}));
    return response(200,{results});
  }catch(error){return response(error?.name==='TimeoutError'?504:502,{error:{message:'Koneksi Exa gagal atau melewati 20 detik. Coba kembali.'}});}
}
