/* Casa Dulce – prăjituri: listă, căutare, categorii, zile de copt. */
let cat = "toate", q = "";

const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const fq = (p, n) => p.unit == "kg" ? String(n).replace(".", ",") + " kg" : n + " " + (p.unit == "felie" ? (n == 1 ? "felie" : "felii") : "buc");
const prod = id => PR.find(p => p.id == id);

function imgTag(name, alt, lazy = true){
  const [w, h] = IMG_DIM[name] || [400, 400];
  return `<img src="${imgSrc(name)}" alt="${alt}" width="${w}" height="${h}"${lazy ? ' loading="lazy"' : ""} decoding="async">`;
}

function card(p){
  const n = qtyOf(p.id);
  const ctl = n
    ? `<span class="stp"><button type="button" data-d="${p.id}" aria-label="Scade ${p.name}">−</button><span aria-live="polite">${fq(p, n)}</span><button type="button" data-a="${p.id}" aria-label="Adaugă ${p.name}">+</button></span>`
    : `<button type="button" class="plus" data-a="${p.id}" aria-label="Adaugă ${p.name} în coș">+</button>`;
  return `<article class="card"><div class="ph">${imgTag(p.img, p.name)}${p.tag ? `<span class="tag">${p.tag}</span>` : ""}</div>
  <div class="bd"><h3>${p.name}</h3><p class="ds">${p.desc}</p><div class="ft"><span class="pr">${p.price} lei <small>/ ${p.unit}</small></span>${ctl}</div></div></article>`;
}

function renderShop(){
  $("#chips").innerHTML = CATS.map(c => `<button type="button" class="${c[0] == cat ? "on" : ""}" aria-pressed="${c[0] == cat}" data-c="${c[0]}">${c[1]}</button>`).join("");
  const L = PR.filter(p => (cat == "toate" || p.cat == cat) && (!q || norm(p.name + " " + p.desc).includes(q)));
  $("#cnt").textContent = L.length + (L.length == 1 ? " prăjitură" : " prăjituri");
  $("#grid").innerHTML = L.map(card).join("") || `<p class="empty">Nimic pentru „${esc(q)}”.</p>`;
  $("#grid0").innerHTML = PR.slice(0, 6).map(card).join("");
}

function bakeLabel(d){ return d.slots ? (d.slots < 5 ? "ultimele " + d.slots + " locuri" : d.slots + " locuri") : "plin"; }

function renderBake(){
  const html = DAYS.map((d, i) => `<button type="button" data-day="${i}" class="${i == day ? "on" : ""}" aria-pressed="${i == day}" ${d.slots ? "" : "disabled"}><b>${d.wd}, ${d.d}</b><i>${bakeLabel(d)}</i></button>`).join("");
  $("#bake").innerHTML = html;
  $("#bakeCart").innerHTML = html;
  const next = DAYS.find(d => d.slots) || DAYS[0];
  $$(".nextBake").forEach(x => x.textContent = next.wd.toLowerCase() + ", " + next.d + ".");
}
