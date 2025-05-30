document.addEventListener('DOMContentLoaded',()=>{

  const form=document.getElementById('contact-form');
  if(!form) return;

  /* ===== utils ===== */
  const enc=new TextEncoder();
  const toB64=buf=>btoa(String.fromCharCode(...new Uint8Array(buf)));
  const uuid=()=>crypto.randomUUID();
  const iso=()=>new Date().toISOString();
  const clean=s=>s.replace(/<[^>]*>/g,'').trim();

  /* ===== AES-GCM key ===== */
  const genKey=()=>crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt']);
  const exportKey=k=>crypto.subtle.exportKey('raw',k).then(toB64);

  /* ===== HMAC-SHA-512 ===== */
  async function hmac(data,secret){
    const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-512'},false,['sign']);
    const sig=await crypto.subtle.sign('HMAC',key,enc.encode(data));
    return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!form.checkValidity()) return alert('Please fill required fields.');
    if(form['contact-hp'].value) return;

    document.getElementById('encrypting-msg').classList.remove('hide');
    [...form.elements].forEach(i=>i.disabled=true);

    /* ===== reCAPTCHA ===== */
    let token='';
    try{token=await grecaptcha.execute('YOUR_REAL_SITE_KEY',{action:'submit'})}
    catch{return alert('reCAPTCHA error');}

    /* ===== build payload ===== */
    const aesKey=await genKey();
    const aesKeyB64=await exportKey(aesKey);
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const ivB64=toB64(iv);

    const plain={
      uuid:uuid(),
      name:clean(form['contact-name'].value),
      email:clean(form['contact-email'].value),
      addresses:[...form.querySelectorAll('input[name="contact-address[]"]')].map(i=>clean(i.value)),
      extraEmails:[...form.querySelectorAll('input[name="contact-email[]"]')].map(i=>clean(i.value)),
      message:clean(form['contact-comments'].value),
      ts:iso()
    };

    const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},aesKey,enc.encode(JSON.stringify(plain)));
    const cipherB64=toB64(cipher);

    const meta={iv:ivB64,aes:aesKeyB64,recaptcha:token};
    const hmacSig=await hmac(JSON.stringify(meta)+cipherB64,'CLIENT_SIDE_SHARED_SECRET');

    /* ===== send to API or Apps Script endpoint ===== */
    const payload={
      meta,
      blob:cipherB64,
      hmac:hmacSig
    };

    try{
      const res=await fetch('https://script.google.com/macros/s/YOUR_APPS_SCRIPT_ID/exec',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload),
        credentials:'omit'
      });
      if(!res.ok) throw 0;
      document.getElementById('feedback-message').innerText='Thank you! We will be in touch.';
      form.reset(); form.style.display='none';
    }catch{
      document.getElementById('feedback-message').innerText='Error – please retry.';
    }finally{
      document.getElementById('encrypting-msg').classList.add('hide');
    }
  });

});
