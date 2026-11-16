require('dotenv').config();
const http = require('http');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
let chatHistory = [];

const manifest = JSON.stringify({
  name: "استوديو يوسف AI",
  short_name: "يوسف AI",
  start_url: "/",
  display: "standalone",
  background_color: "#090d16",
  theme_color: "#111827",
  icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }]
});

const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><link rel="manifest" href="/manifest.json"><title>استوديو يوسف AI</title>
<style>*{box-sizing:border-box}body{font-family:sans-serif;background:#090d16;color:#f1f5f9;margin:0;display:flex;flex-direction:column;height:100dvh}header{background:#111827;padding:12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1f2937}header span{font-weight:bold;color:#38bdf8}.btn-s{background:#1f2937;color:#94a3b8;border:1px solid #374151;padding:5px 10px;border-radius:8px}#chat{flex:1;overflow-y:auto;padding:15px;display:flex;flex-direction:column;gap:12px}.msg{max-width:88%;padding:12px;border-radius:12px;line-height:1.6;word-wrap:break-word}.user{background:#2563eb;align-self:flex-start}.bot{background:#111827;align-self:flex-end;border:1px solid #1f2937}.gen-img{width:100%;max-width:300px;border-radius:10px;margin-top:8px;display:block}.dl-btn{display:inline-block;margin-top:6px;background:#059669;color:#fff;text-decoration:none;padding:6px 12px;border-radius:6px;font-size:12px}.vbox{position:relative;width:100%;max-width:300px;height:190px;border-radius:10px;overflow:hidden;margin-top:8px;border:2px solid #38bdf8}.vbox img{width:100%;height:100%;object-fit:cover;transition:transform 3s}.vsub{position:absolute;bottom:0;width:100%;background:rgba(0,0,0,.75);padding:6px;font-size:12px;text-align:center}#prev{background:#1e293b;padding:6px 12px;font-size:12px;color:#38bdf8;display:none;justify-content:space-between}form{display:flex;padding:8px;background:#111827;gap:6px}input[type=text]{flex:1;padding:10px;border-radius:8px;border:1px solid #374151;background:#090d16;color:#fff;min-width:0}.ibtn{background:#1f2937;color:#38bdf8;border:1px solid #374151;padding:8px 10px;border-radius:8px}.sbtn{padding:10px 14px;background:#38bdf8;color:#090d16;border:none;border-radius:8px;font-weight:bold}</style></head>
<body><header><span>🎬 استوديو يوسف AI</span><button class="btn-s" onclick="clr()">مسح 🗑️</button></header>
<div id="chat"><div class="msg bot">أهلاً يا يوسف! اطلب <b>"اصنع صورة لـ..."</b> 🎨 أو <b>"اصنع فيديو عن..."</b> 🎬 أو أرفق ملفاً 📎!</div></div>
<div id="prev"><span id="fn"></span><button type="button" onclick="cf()" style="background:none;border:none;color:#f87171">✕</button></div>
<form onsubmit="send(event)"><input type="file" id="fi" accept="image/*,video/*" style="display:none" onchange="hf(this)"><button type="button" class="ibtn" onclick="fi.click()">📎</button><button type="button" class="ibtn" onclick="vc()">🎤</button><input id="p" type="text" placeholder="اطلب صورة، فيديو، أو اسأل..."><button class="sbtn">إرسال</button></form>
<script>
if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js");
let af=null;
function hf(i){const f=i.files;if(!f)return;const r=new FileReader();r.onload=()=>{af={data:r.result.split(',')[1],mimeType:f.type,name:f.name};fn.textContent='📎 '+f.name;prev.style.display='flex'};r.readAsDataURL(f)}
function cf(){af=null;fi.value='';prev.style.display='none'}
function fmt(t){
  let e=t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  e=e.replace(/\[IMAGE:(.*?)\]/g,(m,p)=>{const u='https://pollinations.ai(p.trim())+'?width=768&height=768&nologo=true';return '<img class="gen-img" src="'+u+'"><a class="dl-btn" href="'+u+'" target="_blank" download="ai.jpg">⬇️ تحميل الصورة</a>'});
  e=e.replace(/\[VIDEO:(.*?)\|(.*?)\]/g,(m,ps,sc)=>{const l=ps.split(';').map(s=>'https://pollinations.ai(s.trim())+'?width=768&height=512&nologo=true');const id='v'+Math.random().toString(36).slice(2,7);setTimeout(()=>playV(id,l,sc.trim()),400);return '<div class="vbox" id="'+id+'"><img src="'+l[0]+'"><div class="vsub">'+sc.trim()+'</div></div>'});
  return e.replace(/\*\*(.*?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
}
function playV(id,imgs,txt){const b=document.getElementById(id);if(!b)return;const im=b.querySelector('img');let x=0;im.style.transform='scale(1.15)';const iv=setInterval(()=>{x++;if(x>=imgs.length){clearInterval(iv);im.style.transform='scale(1)';return}im.src=imgs[x]},3500);speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(txt);u.lang='ar-SA';speechSynthesis.speak(u)}
function vc(){const S=window.SpeechRecognition||window.webkitSpeechRecognition;if(!S)return alert('غير مدعوم');const r=new S();r.lang='ar-DZ';r.onresult=e=>{p.value=e.results[0][0].transcript};r.start()}
async function clr(){await fetch('/clear',{method:'POST'});chat.innerHTML='<div class="msg bot">تم مسح الذاكرة!</div>'}
async function send(e){e.preventDefault();const t=p.value.trim();if(!t&&!af)return;chat.innerHTML+='<div class="msg user">'+(af?'[📎 '+af.name+']<br>':'')+t.replace(/</g,'&lt;')+'</div>';const pay={prompt:t||'اشرح الملف',file:af};p.value='';cf();const l=document.createElement('div');l.className='msg bot';l.textContent='جاري الإنتاج... 🎨🎬';chat.appendChild(l);chat.scrollTop=chat.scrollHeight;try{const r=await fetch('/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pay)});const d=await r.json();l.innerHTML=d.reply?fmt(d.reply):('خطأ: '+d.error)}catch(x){l.textContent='خطأ اتصال'}chat.scrollTop=chat.scrollHeight}
</script></body></html>`;

http.createServer(async(req,res)=>{
  if(req.method==='GET'&&req.url==='/'){res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});res.end(html)}
  else if(req.method==='GET'&&req.url==='/manifest.json'){res.writeHead(200,{'Content-Type':'application/json'});res.end(manifest)}
  else if(req.method==='GET'&&req.url==='/icon.png'){res.writeHead(200,{'Content-Type':'image/png'});res.end(fs.readFileSync('icon.png'))}
  else if(req.method==='GET'&&req.url==='/sw.js'){res.writeHead(200,{'Content-Type':'application/javascript'});res.end(fs.readFileSync('sw.js'))}
  else if(req.method==='POST'&&req.url==='/clear'){chatHistory=[];res.writeHead(200);res.end('ok')}
  else if(req.method==='POST'&&req.url==='/ask'){
    let b='';req.on('data',c=>b+=c);req.on('end',async()=>{
      try{
        const{prompt,file}=JSON.parse(b);const parts=[{text:prompt}];
        if(file)parts.push({inlineData:{data:file.data,mimeType:file.mimeType}});
        chatHistory.push({role:'user',parts});
        const r=await ai.models.generateContent({model:'gemini-3.8-flash',contents:chatHistory,config:{systemInstruction:'أنت استوديو ذكاء اصطناعي ليوسف. أجب بالعربية دائماً. إذا طلب صورة اكتب: [IMAGE: detailed english prompt] وإذا طلب فيديو اكتب 3 مشاهد إنجليزية ونص عربي هكذا: [VIDEO: scene 1 english; scene 2 english; scene 3 english | نص القصة بالعربية]'}});
        chatHistory.push({role:'model',parts:[{text:r.text}]});
        res.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});res.end(JSON.stringify({reply:r.text}));
      }catch(e){chatHistory.pop();res.writeHead(500,{'Content-Type':'application/json;charset=utf-8'});res.end(JSON.stringify({error:e.message}))}
    });
  }
}).listen(process.env.PORT || 5000,()=>console.log('Studio AI running on 5000'));
