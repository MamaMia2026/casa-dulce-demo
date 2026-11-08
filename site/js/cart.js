/* Casa Dulce – coș, zi de copt, ridicare / livrare, trimitere comandă. */
let cart = [], day = DEFAULT_DAY, mode = "ridicare";

function loadCart(){
  const s = store.get("cd_cart", null);
  if (!s) return;
  cart = (Array.isArray(s.items) ? s.items : []).filter(c => c && (c.pid != null ? prod(c.pid) && c.q > 0 : c.coz && c.u > 0));
  if (DAYS[s.day] && DAYS[s.day].slots) day = s.day;
  if (s.mode == "livrare" || s.mode == "ridicare") mode = s.mode;
}
const saveCart = () => store.set("cd_cart", {items:cart, day, mode});

const qtyOf = id => (cart.find(c => c.pid == id) || {}).q || 0;
const lineName = c => c.pid != null ? prod(c.pid).name : c.n;
const lineTotal = c => c.pid != null ? prod(c.pid).price * c.q : c.u;
const lineOpt = c => c.pid != null ? fq(prod(c.pid), c.q) + " × " + prod(c.pid).price + " lei" : c.o;

function addP(id, dir){
  const p = prod(id); if (!p) return;
  let x = cart.find(c => c.pid == id);
  if (!x && dir > 0){ x = {k:"p" + id, pid:id, q:0}; cart.push(x); }
  if (!x) return;
  x.q = Math.max(0, Math.round((x.q + p.step * dir) * 2) / 2);    // pas 0,5 kg la produsele la kg
  if (x.q <= 0) cart = cart.filter(c => c !== x);
  if (dir > 0) toast("✓ " + p.name + " în coș");
  renderAll();
}

function totals(){
  const sub = cart.reduce((a, c) => a + lineTotal(c), 0);
  const tr = mode == "livrare" && sub && sub < GRATUIT ? LIVRARE : 0;
  return {sub, tr, tot: sub + tr, n: cart.length};
}

function cartSummary(){ return cart.map(c => `${lineName(c)} – ${lineOpt(c)} = ${lei(lineTotal(c))}`).join("; "); }

function cartMessage(f){
  const t = totals(), d = DAYS[day];
  const L = ["Bună! Aș vrea să comand:", ...cart.map(c => `• ${lineName(c)} – ${lineOpt(c)} = ${lei(lineTotal(c))}`),
    `Ziua de copt: ${d.wd.toLowerCase()}, ${d.d}`, mode == "livrare" ? `Livrare: ${f && f.adresa.value || "(adresa)"} – ${t.tr ? lei(t.tr) : "gratuită"}` : "Ridicare din atelier",
    `Total: ${lei(t.tot)}`];
  if (f && f.nume.value) L.push(`Nume: ${f.nume.value}, tel. ${f.telefon.value}`);
  return L.join("\n");
}

function renderCart(){
  const t = totals(), f = $("#f-cmd");
  $("#cartN").textContent = t.n + (t.n == 1 ? " produs" : " produse");
  $("#cartItems").innerHTML = cart.length ? cart.map((c, i) => {
    const img = c.pid != null ? prod(c.pid).img : c.img;
    const ctl = c.pid != null
      ? `<span class="mini"><button type="button" data-d="${c.pid}" aria-label="Scade ${lineName(c)}">−</button><span>${fq(prod(c.pid), c.q)}</span><button type="button" data-a="${c.pid}" aria-label="Adaugă ${lineName(c)}">+</button></span>`
      : `<button type="button" class="rm" data-rm="${i}" aria-label="Șterge ${c.n}">șterge</button>`;
    return `<div class="ci">${imgTag(img, "")}<div><div class="n">${lineName(c)}</div><div class="o">${lineOpt(c)}</div></div><div class="r">${lei(lineTotal(c))}${ctl}</div></div>`;
  }).join("") : `<p class="empty">Coșul e gol.<br>Alege o prăjitură din tavă.</p>`;
  f.hidden = !cart.length;
  $$("#mode button").forEach(b => { b.classList.toggle("on", b.dataset.m == mode); b.setAttribute("aria-pressed", b.dataset.m == mode); });
  $("#adrWrap").hidden = mode != "livrare";
  f.adresa.required = mode == "livrare";
  $("#lines").innerHTML = `<div><span>Produse</span><span>${lei(t.sub)}</span></div>
   <div><span>${mode == "livrare" ? "Livrare Timișoara" : "Ridicare din atelier"}</span><span>${mode == "livrare" ? (t.sub ? (t.tr ? lei(t.tr) : "gratuită") : "—") : "gratuit"}</span></div>
   ${mode == "livrare" && t.tr ? `<div class="hint"><span class="hint">Livrare gratuită de la ${GRATUIT} lei</span></div>` : ""}
   <div class="t"><span>Total</span><b>${lei(t.tot)}</b></div>`;
  $("#send").disabled = !cart.length;
  $("#waCmd").href = waLink(cart.length ? cartMessage(f) : "Bună! Aș vrea să comand prăjituri.");
  $$(".cntn").forEach(x => x.textContent = t.n);
  $$(".bdg").forEach(x => x.hidden = !t.n);
  $$(".tot").forEach(x => x.textContent = lei(t.tot));
  $(".mcart").style.visibility = t.n ? "visible" : "hidden";
  saveCart();
}

function initCart(){
  loadCart();
  const f = $("#f-cmd");
  f.addEventListener("input", () => { $("#waCmd").href = waLink(cartMessage(f)); });
  f.addEventListener("submit", async e => {
    e.preventDefault();
    if (!cart.length) return;
    if (!DAYS[day].slots){ toast("Ziua aleasă e plină – alege altă zi de copt."); return; }
    if (!f.reportValidity()) return;
    const t = totals(), d = DAYS[day];
    Object.entries({produse:cartSummary(), zi_copt:`${d.wd}, ${d.d}`, livrare: mode == "livrare" ? "Livrare acasă" : "Ridicare din atelier",
      subtotal:lei(t.sub), transport: t.tr ? lei(t.tr) : "gratuit", total:lei(t.tot)}).forEach(([k, v]) => f.elements[k].value = v);
    const msg = cartMessage(f), name = f.nume.value.trim();
    const short = cart.map(c => c.pid != null ? `${lineName(c)} ${prod(c.pid).unit == "kg" ? fq(prod(c.pid), c.q) : "×" + c.q}` : lineName(c)).join(", ");
    await submitFlow(f, $("#send"), {
      order: {type:"comanda", title:short, detail:`${mode == "livrare" ? "Livrare" : "Ridicare"} ${d.wd.toLowerCase()}, ${d.d} · total ${lei(t.tot)} · plata la ${mode == "livrare" ? "livrare" : "ridicare"}`},
      title: `Mulțumim, ${name.split(" ")[0]}!`,
      text: `Comanda de ${lei(t.tot)} a fost trimisă pentru ${d.wd.toLowerCase()}, ${d.d}. Îți confirmăm prin SMS sau telefon.`,
      wa: msg,
      done: () => { cart = []; const keep = mode; f.reset(); mode = keep; renderAll(); }
    });
  });
}
