/* Casa Dulce – rezervare pentru eveniment (nuntă, botez, aniversare, pomană). */
const MN = ["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"];
const ev = {t:"nunta", date:null, g:GUESTS.def, pk:new Set(["tort","candy"]), tier:1, mo:7};

const evDate = key => new Date(Math.floor(key / 1e4), Math.floor(key / 100) % 100, key % 100);
const evDateStr = (key, wd = true) => evDate(key).toLocaleDateString("ro-RO", wd ? {weekday:"long", day:"numeric", month:"long", year:"numeric"} : {day:"numeric", month:"long", year:"numeric"});
const evTypeName = () => EVT.find(t => t[0] == ev.t)[1];
const pkgAllowed = k => !(ev.t == "parastas" && k == "tort");   // la pomană fără tort

function evCalc(){
  const g = ev.g, r = []; let sum = 0;
  if (ev.pk.has("tort") && pkgAllowed("tort")){
    const kg = Math.ceil(g * TORT_KG_PER_GUEST), t = TIERS[ev.tier], v = kg * TORT_KG + t[2];
    r.push(["Tort " + t[1] + " · ~" + kg + " kg", v]); sum += v;
  }
  ["candy","platou","pachet"].forEach(k => { if (ev.pk.has(k)){ const v = g * PRICE[k]; r.push([PKG.find(p => p[0] == k)[1] + " · " + g + " pers.", v]); sum += v; } });
  const disc = g >= DISC_MIN_GUESTS ? DISC : 0;
  if (disc){ r.push(["Reducere eveniment mare (−7%)", -sum * disc]); sum *= 1 - disc; }
  if (ev.pk.size){ r.push(["Livrare și montaj la locație", LIVR_EV]); sum += LIVR_EV; }
  return {r, sum, avans: sum * AVANS};
}

function evPkgText(){
  return PKG.filter(p => ev.pk.has(p[0])).map(p => p[0] == "tort" ? "tort " + TIERS[ev.tier][1] : p[1].toLowerCase()).join(" + ");
}

function renderEvTypes(){
  $("#evTypes").innerHTML = EVT.map(t => `<button type="button" class="${t[0] == ev.t ? "on" : ""}" data-et="${t[0]}" aria-pressed="${t[0] == ev.t}"><span aria-hidden="true">${t[2]}</span>${t[1]}</button>`).join("");
}

function renderEvCal(){
  const m = new Date(CAL_START.getFullYear(), CAL_START.getMonth() + ev.mo, 1);
  const y = m.getFullYear(), mo = m.getMonth(), first = (m.getDay() + 6) % 7, dn = new Date(y, mo + 1, 0).getDate();
  let cal = ["L","M","M","J","V","S","D"].map(d => `<span class="wd" aria-hidden="true">${d}</span>`).join("") + `<span class="dd e"></span>`.repeat(first);
  for (let i = 1; i <= dn; i++){
    const s = calSlot(y, mo, i), full = s == "full", lim = s == "lim", past = new Date(y, mo, i) < CAL_FIRST_FREE;
    const key = y * 1e4 + mo * 100 + i, sel = ev.date == key, off = full || past;
    const lbl = `${i} ${MN[mo]}${full ? ", ocupat" : past ? ", indisponibil" : lim ? ", un singur loc" : s == "free" ? ", liber" : ""}`;
    cal += `<button type="button" class="dd ${lim ? "lim" : ""} ${sel ? "on" : ""}" data-date="${key}" ${off ? "disabled" : ""} aria-pressed="${sel}" aria-label="${lbl}">${i}${off ? "" : `<small>${lim ? "1 loc" : s == "free" ? "liber" : ""}</small>`}</button>`;
  }
  $("#evCal").innerHTML = `<div class="calh"><b>${MN[mo][0].toUpperCase() + MN[mo].slice(1)} ${y}</b><div><button type="button" data-mo="-1" aria-label="Luna anterioară" ${ev.mo <= 0 ? "disabled" : ""}>‹</button><button type="button" data-mo="1" aria-label="Luna următoare" ${ev.mo >= CAL_MONTHS - 1 ? "disabled" : ""}>›</button></div></div><div class="calm">${cal}</div>`;
}

function renderEvPk(){
  $("#evPk").innerHTML = `<div class="pk">${PKG.filter(p => pkgAllowed(p[0])).map(p => `<label><input type="checkbox" data-pk="${p[0]}" ${ev.pk.has(p[0]) ? "checked" : ""}>${imgTag(p[3], "")}<span><b>${p[1]}</b><span>${p[2]}</span></span><em>${p[0] == "tort" ? TORT_KG + " lei/kg" : PRICE[p[0]] + " lei/pers."}</em></label>`).join("")}</div>
  ${ev.pk.has("tort") ? `<div class="tiers" role="group" aria-label="Etaje tort">${TIERS.map((t, i) => `<button type="button" class="${i == ev.tier ? "on" : ""}" aria-pressed="${i == ev.tier}" data-tier="${i}">${t[1]}${t[2] ? " +" + t[2] + " lei" : ""}</button>`).join("")}</div>` : ""}`;
}

function renderEvSum(){
  const c = evCalc();
  $("#evgV").textContent = ev.g;
  $("#evSum").innerHTML = `<span class="ey">${evTypeName()}</span><h3>${ev.date ? evDateStr(ev.date) : "alege data"}</h3>
  <div class="rw"><span>Invitați</span><span>${ev.g}</span></div>
  ${c.r.map(r => `<div class="rw"><span>${r[0]}</span><span>${r[1] < 0 ? "−" + lei(-r[1]) : lei(r[1])}</span></div>`).join("")}
  <div class="tt"><span>Total estimat</span><b>${lei(c.sum)}</b></div>
  <div class="av"><span>Avans la rezervare (30%)</span><b>${lei(c.avans)}</b></div>`;
  const ok = ev.date && ev.pk.size;
  $("#evSend").disabled = !ok;
  $("#evSend").textContent = !ev.date ? "Alege mai întâi data" : !ev.pk.size ? "Alege cel puțin un pachet" : "Trimite cererea de rezervare";
  $("#waEv").href = waLink(evMessage(c));
}

function renderEvents(){ renderEvTypes(); renderEvCal(); renderEvPk(); renderEvSum(); }

function evMessage(c = evCalc(), f = null){
  const L = [`Bună! Aș vrea o rezervare pentru ${evTypeName().toLowerCase()}:`,
    `• Data: ${ev.date ? evDateStr(ev.date, false) : "de stabilit"}`, `• Invitați: ${ev.g}`,
    `• Pachete: ${evPkgText() || "—"}`, `• Total estimat: ${lei(c.sum)} (avans 30%: ${lei(c.avans)})`];
  if (f){ L.push(`• Locație: ${f.locatie.value}`, `• Nume: ${f.nume.value}, tel. ${f.telefon.value}`); if (f.degustare.checked) L.push("• Aș vrea o degustare"); }
  return L.join("\n");
}

function initEvents(){
  const g = $("#evg");
  Object.assign(g, {min:GUESTS.min, max:GUESTS.max, step:GUESTS.step, value:ev.g});
  g.addEventListener("input", () => { ev.g = +g.value; renderEvSum(); });
  document.addEventListener("change", e => {
    const k = e.target.dataset && e.target.dataset.pk;
    if (k){ e.target.checked ? ev.pk.add(k) : ev.pk.delete(k); renderEvPk(); renderEvSum(); }
  });
  $("#f-ev").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    if (!ev.date || !ev.pk.size){ toast("Alege data și cel puțin un pachet."); return; }
    if (!f.reportValidity()) return;                       // include bifa obligatorie de acord
    const c = evCalc();
    Object.entries({tip:evTypeName(), data:evDateStr(ev.date, false), invitati:ev.g, pachete:evPkgText(),
      etaje_tort: ev.pk.has("tort") ? TIERS[ev.tier][1] : "fără tort", total:lei(c.sum), avans:lei(c.avans)})
      .forEach(([k, v]) => f.elements[k].value = v);
    const msg = evMessage(c, f), name = f.nume.value.trim();
    await submitFlow(f, $("#evSend"), {
      order: {type:"eveniment", title:`Rezervare ${evTypeName().toLowerCase()} · ${evDateStr(ev.date, false)}`,
              detail:`${ev.g} invitați · ${evPkgText()} · total ${lei(c.sum)} · avans ${lei(c.avans)}`},
      title: `Mulțumim, ${name.split(" ")[0]}!`,
      text: `Cererea de rezervare pentru ${evTypeName().toLowerCase()} din ${evDateStr(ev.date, false)} a fost trimisă. Te sunăm în 24 h pentru ${f.degustare.checked ? "degustare și " : ""}oferta finală.`,
      wa: msg,
      done: () => { f.reset(); ev.date = null; renderEvents(); }
    });
  });
}
