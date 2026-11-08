const WHATSAPP_NUMBER = "40700000000"; // numărul de WhatsApp al cofetăriei: format internațional, fără „+” (exemplu demo)

/* Casa Dulce – aplicația: utilitare, rute (History API), formulare Netlify, comenzi salvate, teme, PWA. */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const lei = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " lei";
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const waLink = text => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

let tt;
function toast(m){ const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2600); }

/* ——— comenzile mele ——— */
let orders = store.get("cd_orders", []);
if (!Array.isArray(orders)) orders = [];
function addOrder(o){
  const no = 300 + orders.length + 1;
  orders.unshift({...o, no, status:"Trimisă", at:new Date().toISOString()});
  store.set("cd_orders", orders);
  renderOrders();
}
function renderOrders(){
  $$(".ordn").forEach(x => { x.hidden = !orders.length; x.textContent = orders.length; });
  $("#orders").innerHTML = orders.length ? orders.map(o => `<div class="oc"><div><b>#${o.no} · ${esc(o.title)}</b><p>${esc(o.detail)}</p><p>trimisă ${new Date(o.at).toLocaleString("ro-RO", {day:"numeric", month:"long", hour:"2-digit", minute:"2-digit"})}</p></div><span class="st">${o.status}</span></div>`).join("")
    : `<div class="oempty"><p>Încă nu ai trimis nicio comandă de pe acest dispozitiv. Comenzile, rezervările pentru evenimente și cozonacii trimiși apar aici, cu statusul lor.</p><div class="btns"><a class="btn btn-c" href="/prajituri" data-link>Comandă prăjituri</a><a class="btn btn-l" href="/evenimente" data-link>Rezervă un eveniment</a></div></div>`;
}

/* ——— trimitere formulare (Netlify Forms) ——— */
const isLocal = () => location.protocol == "file:" || /^(localhost|127\.\d+\.\d+\.\d+|\[::1\])$/.test(location.hostname);
async function sendForm(form){
  const body = new URLSearchParams(new FormData(form)).toString();
  if (isLocal()){ await new Promise(r => setTimeout(r, 350)); return true; }   // local: simulăm trimiterea
  try {
    const r = await fetch("/", {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body});
    return r.ok;
  } catch (e) { return false; }
}
async function submitFlow(form, btn, o){
  const label = btn.textContent;
  btn.disabled = true; btn.textContent = "Se trimite…";
  const ok = await sendForm(form);
  btn.disabled = false; btn.textContent = label;
  if (ok){ addOrder(o.order); o.done && o.done(); showThanks(true, o.title, o.text, o.wa); }
  else showThanks(false, "Nu s-a putut trimite", "Verifică conexiunea și încearcă din nou – sau trimite-ne aceleași detalii pe WhatsApp, cu un singur click.", o.wa);
}
let lastFocus = null;
function showThanks(ok, title, text, wa){
  lastFocus = document.activeElement;
  $("#thxB").classList.toggle("err", !ok);
  $("#thxI").textContent = ok ? "✓" : "!";
  $("#thxT").textContent = title; $("#thxP").textContent = text;
  $("#thxWa").href = waLink(wa);
  $("#thxWa").textContent = ok ? "Trimite și pe WhatsApp" : "Trimite pe WhatsApp";
  $("#thxOrd").hidden = !ok;
  $("#thx").hidden = false;
  $("#thxX").focus();
}
function hideThanks(){ $("#thx").hidden = true; lastFocus && lastFocus.focus && lastFocus.focus(); }

/* ——— teme ——— */
function setTheme(t, anim = true){
  if (!window.THEME_COLORS || !THEME_COLORS[t]) return;
  const h = document.documentElement;
  if (anim){ h.classList.add("theme-anim"); setTimeout(() => h.classList.remove("theme-anim"), 450); }
  h.setAttribute("data-theme", t);
  $('meta[name="theme-color"]').setAttribute("content", THEME_COLORS[t]);
  try { localStorage.setItem("cd_tema", t); } catch (e) {}
  $$(".tbtn").forEach(b => b.setAttribute("aria-pressed", b.dataset.themeSet == t));
}

/* ——— rute ——— */
const ROUTES = {"/":"home", "/prajituri":"shop", "/evenimente":"events", "/cozonaci":"coz", "/comenzi":"orders", "/cos":"cart"};
const PATHS = Object.fromEntries(Object.entries(ROUTES).map(([p, v]) => [v, p]));
const TITLES = {home:"Casa Dulce – cofetărie de casă", shop:"Prăjituri · Casa Dulce", events:"Rezervare eveniment · Casa Dulce",
  coz:"Cozonaci de Crăciun · Casa Dulce", orders:"Comenzile mele · Casa Dulce", cart:"Coșul tău · Casa Dulce"};
let view = "home";
const isMob = () => matchMedia("(max-width:760px)").matches;
const routeOf = path => ROUTES[path.replace(/\/+$/, "") || "/"];

/* vederile ascunse se randează la prima afișare (sau când browserul e liber) */
const rendered = new Set();
function ensure(v){
  if (rendered.has(v)) return;
  rendered.add(v);
  if (v == "events") renderEvents();
  if (v == "coz") renderCoz();
}

function show(v){
  const mob = isMob(), cartView = v == "cart";
  if (!cartView) view = v;
  ensure(view);
  $("#app").classList.toggle("incart", cartView && mob);
  $("#cartp").classList.toggle("mshow", cartView);
  $("#main").classList.toggle("mhide", cartView && mob);
  $$(".view").forEach(x => x.classList.toggle("on", x.id == "v-" + view));
  $$(".nav[data-v], .tabbar a[data-v]").forEach(b => { const on = b.dataset.v == (cartView && mob ? "cart" : view); b.classList.toggle("on", on); on ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"); });
  document.title = TITLES[v];
  if (cartView && !mob){ $("#cartp").animate([{background:"var(--cr2)"}, {background:"var(--wh)"}], 700); $("#cartp").focus({preventScroll:true}); }
  else { $("#scroll").scrollTop = 0; $("#cartScroll").scrollTop = 0; }
}
function navigate(v, replace = false){
  const path = PATHS[v] || "/";
  if (location.pathname != path) history[replace ? "replaceState" : "pushState"]({v}, "", path);
  show(v);
}

function renderAll(){ renderShop(); renderBake(); renderCart(); }

/* ——— evenimente UI (delegare) ——— */
document.addEventListener("click", e => {
  const a = e.target.closest("a[data-link]");
  if (a && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.button == 0){
    e.preventDefault();
    if (a.dataset.type){ ev.t = a.dataset.type; renderEvents(); }
    if (!$("#thx").hidden) hideThanks();
    navigate(a.dataset.v || routeOf(new URL(a.href).pathname) || "home");
    return;
  }
  const b = e.target.closest("button"); if (!b) return;
  const D = b.dataset;
  if (b.id == "thxX"){ hideThanks(); return; }
  if (D.themeSet){ setTheme(D.themeSet); return; }
  if (D.a !== undefined){ addP(+D.a, 1); return; }
  if (D.d !== undefined){ addP(+D.d, -1); return; }
  if (D.c){ cat = D.c; renderShop(); return; }
  if (D.day !== undefined){ day = +D.day; renderAll(); return; }
  if (D.m){ mode = D.m; renderCart(); return; }
  if (D.rm !== undefined){ cart.splice(+D.rm, 1); renderAll(); return; }
  if (D.et){ ev.t = D.et; if (ev.t == "parastas") ev.pk.delete("tort"); renderEvents(); return; }
  if (D.mo){ ev.mo = Math.max(0, Math.min(CAL_MONTHS - 1, ev.mo + (+D.mo))); renderEvCal(); return; }
  if (D.date){ ev.date = +D.date; renderEvCal(); renderEvSum(); return; }
  if (D.tier !== undefined){ ev.tier = +D.tier; renderEvPk(); renderEvSum(); return; }
  if (D.cf !== undefined){ cz.f = +D.cf; renderCoz(); return; }
  if (D.cd !== undefined){ cz.d = +D.cd; renderCoz(); return; }
  if (D.cn){ cz.n = Math.max(1, Math.min(cozMax(), cz.n + (+D.cn))); renderCoz(); return; }
  if (D.cozadd){ cozToCart(); return; }
});
document.addEventListener("keydown", e => { if (e.key == "Escape" && !$("#thx").hidden) hideThanks(); });
$("#thx").addEventListener("click", e => { if (e.target.id == "thx") hideThanks(); });
$$(".q").forEach(i => i.addEventListener("input", () => {
  q = norm(i.value.trim());
  $$(".q").forEach(o => { if (o !== i) o.value = i.value; });
  if (view != "shop") navigate("shop");
  renderShop();
}));
window.addEventListener("popstate", () => show(routeOf(location.pathname) || "home"));
matchMedia("(max-width:760px)").addEventListener("change", () => show(routeOf(location.pathname) || "home"));

/* ——— pornire ——— */
setTheme(document.documentElement.getAttribute("data-theme"), false);
initCart(); initEvents(); initCoz();
const tip = new URLSearchParams(location.search).get("tip");
if (tip && EVT.some(t => t[0] == tip)) ev.t = tip;
renderAll(); renderCozStats(); renderOrders();
const start = routeOf(location.pathname);
if (!start) history.replaceState({v:"home"}, "", "/" + location.search);
show(start || "home");
const idle = window.requestIdleCallback || (f => setTimeout(f, 1500));
idle(() => { ensure("events"); ensure("coz"); });

if ("serviceWorker" in navigator && location.protocol != "file:"){
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
