/* Casa Dulce – precomenzi de cozonac (umplutură, zi de ridicare cu stoc, cantitate). */
const cz = {f:0, d:1, n:1};

const cozMax = () => Math.min(COZ_MAX, COZ_DAYS[cz.d].stock);
const cozTotal = () => COZ[cz.f].price * cz.n;
const cozText = () => `${cz.n} × cozonac ${COZ[cz.f].name.toLowerCase()} (1 kg) · ridicare ${COZ_DAYS[cz.d].d}`;

function renderCoz(){
  if (!COZ_DAYS[cz.d].stock) cz.d = COZ_DAYS.findIndex(d => d.stock);
  cz.n = Math.max(1, Math.min(cozMax(), cz.n));
  const left = COZ_TOTAL - COZ_RESERVED, pct = Math.round(COZ_RESERVED / COZ_TOTAL * 100);
  $("#cozCfg").innerHTML = `<p style="color:var(--mu)">Frământăm doar ${COZ_TOTAL} de cozonaci, în ${COZ_DAYS.map(d => d.d.split(" ")[0]).join(", ").replace(/, (\d+)$/, " și $1")} decembrie. Rezervi acum și plătești la ridicare.</p>
  <div style="margin-top:12px"><div class="stockh"><b>${COZ_RESERVED} din ${COZ_TOTAL} rezervați</b><span>mai sunt ${left}</span></div><div class="stock"><i style="width:${pct}%"></i></div></div>
  <div class="sec" style="margin-top:18px"><h4>Umplutura</h4><div class="fil" role="group" aria-label="Umplutura">${COZ.map((c, i) => `<button type="button" class="${i == cz.f ? "on" : ""}" aria-pressed="${i == cz.f}" data-cf="${i}">${c.name}<span>${c.note ? c.note + " · " : ""}${c.price} lei / 1 kg</span></button>`).join("")}</div></div>
  <div class="sec"><h4>Ziua ridicării</h4><div class="days" role="group" aria-label="Ziua ridicării">${COZ_DAYS.map((d, i) => `<button type="button" class="${i == cz.d ? "on" : ""}" aria-pressed="${i == cz.d}" data-cd="${i}" ${d.stock ? "" : "disabled"}>${d.d}<span>${d.stock ? d.stock + " rămase" : "plin"}</span></button>`).join("")}</div></div>
  <div class="cozrow"><div class="stp lt"><button type="button" data-cn="-1" aria-label="Mai puțini cozonaci" ${cz.n <= 1 ? "disabled" : ""}>−</button><span aria-live="polite">${cz.n}</span><button type="button" data-cn="1" aria-label="Mai mulți cozonaci" ${cz.n >= cozMax() ? "disabled" : ""}>+</button></div><button type="button" class="btn btn-c" style="flex:1" data-cozadd="1">Adaugă în coș · ${lei(cozTotal())}</button></div>`;
  $("#cozSend").textContent = "Trimite rezervarea · " + lei(cozTotal());
  $("#waCoz").href = waLink("Bună! Aș vrea să rezerv " + cozText() + ", total " + lei(cozTotal()) + ".");
}

function renderCozStats(){
  const pct = Math.round(COZ_RESERVED / COZ_TOTAL * 100);
  $$(".cozRes").forEach(x => x.textContent = `${COZ_RESERVED} din ${COZ_TOTAL} rezervați`);
  $$(".cozBar").forEach(x => x.style.width = pct + "%");
  $$(".cozClose").forEach(x => x.textContent = COZ_CLOSE);
  $$(".cozTotal").forEach(x => x.textContent = COZ_TOTAL);
}

function cozToCart(){
  const f = COZ[cz.f];
  cart.push({k:"z" + Date.now(), coz:{f:cz.f, d:cz.d, n:cz.n}, n:"Cozonac " + f.name.toLowerCase(), o:cz.n + " × 1 kg · ridicare " + COZ_DAYS[cz.d].d, u:f.price * cz.n, img:"cozonaci", q:1});
  toast("✓ Cozonacul a fost adăugat în coș");
  renderAll();
}

function initCoz(){
  $("#f-coz").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    if (!f.reportValidity()) return;
    Object.entries({umplutura:COZ[cz.f].name, zi_ridicare:COZ_DAYS[cz.d].d, cantitate:cz.n, total:lei(cozTotal())}).forEach(([k, v]) => f.elements[k].value = v);
    const name = f.nume.value.trim();
    await submitFlow(f, $("#cozSend"), {
      order: {type:"cozonac", title:`Cozonac ${COZ[cz.f].name.toLowerCase()} ×${cz.n}`, detail:`Ridicare ${COZ_DAYS[cz.d].d} · ${lei(cozTotal())} · plata la ridicare`},
      title: `Mulțumim, ${name.split(" ")[0]}!`,
      text: `Rezervarea pentru ${cozText()} a fost trimisă. Plătești ${lei(cozTotal())} la ridicare.`,
      wa: `Bună! Am rezervat ${cozText()}, total ${lei(cozTotal())}. Nume: ${name}, tel. ${f.telefon.value}.`,
      done: () => { f.reset(); renderCoz(); }
    });
  });
}
