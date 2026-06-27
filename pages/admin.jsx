import { useState, useRef } from "react";
import Head from "next/head";

function slugify(str) {
  const map = {а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya"};
  return str.toLowerCase()
    .replace(/[а-яё]/g, c => map[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function initials(name) {
  return name.split(" ").map(w => w[0] || "").join("").toUpperCase().slice(0, 2);
}

const COLORS = ["#6366f1","#ec4899","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#111827"];

const empty = { name:"", title:"", company:"", phone:"", email:"", telegram:"", instagram:"", website:"", accent:"#6366f1" };

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [form, setForm] = useState(empty);
  const [photo, setPhoto] = useState(null); // { base64, ext, preview }
  const [status, setStatus] = useState(null); // null | "saving" | "ok" | "error"
  const [errorMsg, setErrorMsg] = useState("");
  const [savedSlug, setSavedSlug] = useState("");
  const fileRef = useRef();

  function handleLogin(e) {
    e.preventDefault();
    if (!pw) return;
    setPwError("");
    setAuthed(true);
  }

  function set(field, val) {
    setForm(f => {
      const next = { ...f, [field]: val };
      return next;
    });
  }

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = ev => {
      setPhoto({ base64: ev.target.result, ext, preview: ev.target.result });
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name) return;
    setStatus("saving");
    setErrorMsg("");

    const slug = slugify(form.name);
    const client = { slug, ...form };
    // Remove empty fields
    Object.keys(client).forEach(k => { if (client[k] === "") delete client[k]; });

    try {
      const res = await fetch("/api/save-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: pw,
          client,
          photoBase64: photo?.base64 || null,
          photoExt: photo?.ext || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setSavedSlug(slug);
      setStatus("ok");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  function handleNew() {
    setForm(empty);
    setPhoto(null);
    setStatus(null);
    setSavedSlug("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const slug = slugify(form.name || "");
  const accent = form.accent || "#6366f1";

  if (!authed) {
    return (
      <>
        <Head><title>Админка</title><meta name="viewport" content="width=device-width,initial-scale=1"/></Head>
        <div style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f0f0",padding:"24px"}}>
          <div style={{background:"#fff",borderRadius:"20px",padding:"36px 32px",width:"100%",maxWidth:"340px",boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
            <h1 style={{fontSize:"20px",fontWeight:"700",margin:"0 0 8px",color:"#111"}}>Вход в админку</h1>
            <p style={{fontSize:"14px",color:"#888",margin:"0 0 24px"}}>NFC визитки</p>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                placeholder="Пароль"
                value={pw}
                onChange={e => setPw(e.target.value)}
                style={{width:"100%",padding:"12px 14px",borderRadius:"12px",border:"1.5px solid #e5e7eb",fontSize:"15px",marginBottom:"12px",boxSizing:"border-box",outline:"none"}}
                autoFocus
              />
              {pwError && <p style={{color:"#ef4444",fontSize:"13px",margin:"0 0 8px"}}>{pwError}</p>}
              <button type="submit" style={{width:"100%",padding:"13px",borderRadius:"12px",background:"#6366f1",color:"#fff",fontWeight:"600",fontSize:"15px",border:"none",cursor:"pointer"}}>
                Войти
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  if (status === "ok") {
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
    const cardUrl = `${siteUrl}/v/${savedSlug}`;
    return (
      <>
        <Head><title>Сохранено</title><meta name="viewport" content="width=device-width,initial-scale=1"/></Head>
        <div style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f0f0",padding:"24px"}}>
          <div style={{background:"#fff",borderRadius:"20px",padding:"36px 32px",width:"100%",maxWidth:"400px",boxShadow:"0 4px 24px rgba(0,0,0,0.08)",textAlign:"center"}}>
            <div style={{width:"56px",height:"56px",borderRadius:"50%",background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:"28px"}}>✓</div>
            <h1 style={{fontSize:"20px",fontWeight:"700",margin:"0 0 8px",color:"#111"}}>Клиент сохранён!</h1>
            <p style={{fontSize:"14px",color:"#888",margin:"0 0 24px"}}>Vercel обновит сайт за ~30 секунд</p>
            <div style={{background:"#f7f7f7",borderRadius:"12px",padding:"14px",marginBottom:"20px",textAlign:"left"}}>
              <p style={{fontSize:"12px",color:"#888",margin:"0 0 4px"}}>Ссылка для NFC карты:</p>
              <p style={{fontSize:"14px",fontWeight:"600",color:"#6366f1",wordBreak:"break-all",margin:0}}>{cardUrl}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(cardUrl)}
              style={{width:"100%",padding:"13px",borderRadius:"12px",background:"#6366f1",color:"#fff",fontWeight:"600",fontSize:"15px",border:"none",cursor:"pointer",marginBottom:"10px"}}
            >
              Скопировать ссылку
            </button>
            <button
              onClick={handleNew}
              style={{width:"100%",padding:"13px",borderRadius:"12px",background:"#f7f7f7",color:"#111",fontWeight:"600",fontSize:"15px",border:"none",cursor:"pointer"}}
            >
              Добавить ещё клиента
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Новый клиент</title><meta name="viewport" content="width=device-width,initial-scale=1"/></Head>
      <div style={{minHeight:"100dvh",background:"#f0f0f0",padding:"24px 16px",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
        <div style={{maxWidth:"520px",margin:"0 auto"}}>
          <h1 style={{fontSize:"22px",fontWeight:"700",margin:"0 0 4px",color:"#111"}}>Новый клиент</h1>
          <p style={{fontSize:"14px",color:"#888",margin:"0 0 20px"}}>Заполни форму — карточка появится на сайте автоматически</p>

          <form onSubmit={handleSave}>
            {/* Preview */}
            <div style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
              <div style={{width:"60px",height:"60px",borderRadius:"50%",background:accent,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
                {photo
                  ? <img src={photo.preview} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <span style={{fontSize:"20px",fontWeight:"700",color:"rgba(255,255,255,0.9)"}}>{initials(form.name||"НК")}</span>
                }
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:"700",fontSize:"16px",margin:"0",color:"#111",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{form.name || "Имя клиента"}</p>
                <p style={{fontSize:"13px",color:"#888",margin:"2px 0 0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {[form.title,form.company].filter(Boolean).join(" · ") || "Должность · Компания"}
                </p>
                {slug && <p style={{fontSize:"11px",color:accent,margin:"4px 0 0"}}>/v/{slug}</p>}
              </div>
            </div>

            {/* Form fields */}
            <div style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
              <Field label="Имя и фамилия *" value={form.name} onChange={v => set("name",v)} placeholder="Иван Петров"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                <Field label="Должность" value={form.title} onChange={v => set("title",v)} placeholder="Дизайнер"/>
                <Field label="Компания" value={form.company} onChange={v => set("company",v)} placeholder="Studio X"/>
              </div>
              <Field label="Телефон" value={form.phone} onChange={v => set("phone",v)} placeholder="+31 6 12 34 56 78" type="tel"/>
              <Field label="Email" value={form.email} onChange={v => set("email",v)} placeholder="ivan@example.com" type="email"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                <Field label="Telegram (без @)" value={form.telegram} onChange={v => set("telegram",v)} placeholder="username"/>
                <Field label="Instagram (без @)" value={form.instagram} onChange={v => set("instagram",v)} placeholder="username"/>
              </div>
              <Field label="Сайт" value={form.website} onChange={v => set("website",v)} placeholder="https://site.com" last/>
            </div>

            {/* Photo */}
            <div style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
              <p style={{fontSize:"13px",fontWeight:"600",color:"#111",margin:"0 0 12px"}}>Фото</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}} id="photo-upload"/>
              <label htmlFor="photo-upload" style={{display:"flex",alignItems:"center",gap:"10px",padding:"12px 16px",borderRadius:"12px",border:"1.5px dashed #e5e7eb",cursor:"pointer",fontSize:"14px",color:"#888"}}>
                {photo
                  ? <><img src={photo.preview} alt="" style={{width:"32px",height:"32px",borderRadius:"50%",objectFit:"cover"}}/> Фото загружено — нажми чтобы заменить</>
                  : <>📎 Загрузить фото</>
                }
              </label>
            </div>

            {/* Color */}
            <div style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
              <p style={{fontSize:"13px",fontWeight:"600",color:"#111",margin:"0 0 12px"}}>Цвет акцента</p>
              <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"}}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => set("accent",c)} style={{width:"32px",height:"32px",borderRadius:"50%",background:c,cursor:"pointer",border:accent===c?"3px solid #111":"3px solid transparent",boxSizing:"border-box"}}/>
                ))}
                <input type="color" value={accent} onChange={e => set("accent",e.target.value)} style={{width:"32px",height:"32px",borderRadius:"50%",border:"none",cursor:"pointer",padding:"0"}}/>
              </div>
            </div>

            {status === "error" && (
              <div style={{background:"#fef2f2",borderRadius:"12px",padding:"12px 16px",marginBottom:"16px",fontSize:"14px",color:"#ef4444"}}>
                Ошибка: {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={!form.name || status === "saving"}
              style={{width:"100%",padding:"16px",borderRadius:"16px",background:form.name ? accent : "#e5e7eb",color:"#fff",fontWeight:"700",fontSize:"16px",border:"none",cursor:form.name?"pointer":"default",transition:"background 0.15s"}}
            >
              {status === "saving" ? "Сохраняем..." : "Сохранить клиента"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function Field({ label, value, onChange, placeholder, type="text", last }) {
  return (
    <div style={{marginBottom: last ? 0 : "12px"}}>
      <label style={{display:"block",fontSize:"12px",color:"#888",marginBottom:"4px"}}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{width:"100%",padding:"11px 14px",borderRadius:"10px",border:"1.5px solid #e5e7eb",fontSize:"14px",boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}
      />
    </div>
  );
}
