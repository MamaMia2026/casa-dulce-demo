/* Casa Dulce – date de exemplu (machetă demo). Toate prețurile sunt în lei. */

/* ——— poze (dimensiuni reale, pentru width/height) ——— */
const IMG_DIM = {
  "amandine":[370,370], "savarine":[370,370], "cremsnit":[370,370], "cornulete-rahat":[370,370],
  "cozonac-nuca":[370,370], "salam-biscuiti":[370,370], "prajitura-mere":[380,380], "placinta-branza":[380,380],
  "nuca-caramel":[380,380], "ecler-vanilie":[380,380],
  "tort-nunta":[378,368], "tort-botez":[378,368], "cozonaci":[378,368],
  "platou-prajituri":[378,376], "candy-bar":[378,376], "cutie-cadou":[378,376]
};
const imgSrc = n => `/img/${n}.webp`;

/* ——— prăjituri: la bucată / felie sau la kg (pas 0,5 kg) ——— */
const PR = [
  {id:0,  name:"Amandine",           desc:"Blat de cacao însiropat, cremă de ciocolată", cat:"clasice", price:9,  unit:"buc",   step:1,   img:"amandine",        tag:"Bestseller"},
  {id:1,  name:"Savarine",           desc:"Cu sirop de rom și frișcă",                   cat:"clasice", price:12, unit:"buc",   step:1,   img:"savarine",        tag:""},
  {id:2,  name:"Cremșnit",           desc:"Foietaj și cremă de vanilie",                 cat:"clasice", price:11, unit:"buc",   step:1,   img:"cremsnit",        tag:""},
  {id:3,  name:"Cornulețe cu rahat", desc:"Aluat fraged cu untură, rahat și nucă",       cat:"tava",    price:65, unit:"kg",    step:0.5, img:"cornulete-rahat", tag:""},
  {id:5,  name:"Salam de biscuiți",  desc:"Cu rahat, nucă și cacao, 400 g",              cat:"tava",    price:45, unit:"buc",   step:1,   img:"salam-biscuiti",  tag:""},
  {id:6,  name:"Prăjitură cu mere",  desc:"Aluat fraged, mere cu scorțișoară",           cat:"tava",    price:60, unit:"kg",    step:0.5, img:"prajitura-mere",  tag:""},
  {id:7,  name:"Plăcintă cu brânză", desc:"Brânză dulce și stafide",                     cat:"tava",    price:58, unit:"kg",    step:0.5, img:"placinta-branza", tag:""},
  {id:9,  name:"Nucă și caramel",    desc:"Blat cu nucă, cremă de caramel",              cat:"clasice", price:14, unit:"felie", step:1,   img:"nuca-caramel",    tag:"Nou"},
  {id:10, name:"Ecler cu vanilie",   desc:"Cremă de vanilie fiartă",                     cat:"clasice", price:8,  unit:"buc",   step:1,   img:"ecler-vanilie",   tag:""},
  {id:4,  name:"Cozonac cu nucă",    desc:"Frământat de mână, 1 kg",                     cat:"cozonac", price:55, unit:"buc",   step:1,   img:"cozonac-nuca",    tag:"Precomandă"}
];
const CATS = [["toate","Toate"],["clasice","Clasice"],["tava","De tavă, la kg"],["cozonac","Cozonac"]];

/* ——— zile de copt cu locuri (0 = plin, blocat) ——— */
const DAYS = [
  {wd:"Joi",     d:"12 nov", slots:0},
  {wd:"Vineri",  d:"13 nov", slots:8},
  {wd:"Sâmbătă", d:"14 nov", slots:3},
  {wd:"Joi",     d:"19 nov", slots:25}
];
const DEFAULT_DAY = 1;
const LIVRARE = 15, GRATUIT = 200;           // livrare în Timișoara; gratuită de la 200 lei

/* ——— evenimente ——— */
const EVT = [["nunta","Nuntă","💍"],["botez","Botez","🕊"],["aniversare","Aniversare","🎂"],["parastas","Pomană","🕯"]];
const TORT_KG = 150, TORT_KG_PER_GUEST = 0.15;   // ~150 g / invitat
const TIERS = [[2,"2 etaje",0],[3,"3 etaje",250],[4,"4 etaje",500]];
const PKG = [
  ["tort",  "Tort de eveniment",         "~150 g / invitat · decor inclus",           "tort-nunta"],
  ["candy", "Candy bar",                 "~4 dulciuri / invitat, aranjat la locație", "candy-bar"],
  ["platou","Platouri de prăjituri",     "3 prăjituri / invitat, de casă",            "platou-prajituri"],
  ["pachet","Pachețele pentru invitați", "cutie cu 4 prăjituri",                      "cutie-cadou"]
];
const PRICE = {candy:18, platou:12, pachet:16};  // lei / persoană
const LIVR_EV = 150;                             // livrare și montaj la locație
const AVANS = 0.3;                               // avans 30%
const DISC_MIN_GUESTS = 150, DISC = 0.07;        // −7% pentru evenimente mari
const GUESTS = {min:20, max:300, step:10, def:120};

/* calendar: 14 luni începând cu noiembrie 2026; weekenduri ocupate / limitate (date demo) */
const CAL_START = new Date(2026, 10, 1), CAL_MONTHS = 14, CAL_FIRST_FREE = new Date(2026, 10, 14);
function calSlot(y, mo, i){
  const wd = new Date(y, mo, i).getDay(), we = wd == 6 || wd == 0;
  if ((wd == 6 && (i*7 + mo) % 3 == 0) || (wd == 0 && (i + mo) % 4 == 0)) return "full";
  if (we && i % 2 == 0) return "lim";
  return we ? "free" : "";
}

/* ——— cozonaci de Crăciun ——— */
const COZ = [
  {name:"Nucă și cacao",        note:"clasic",       price:55},
  {name:"Rahat și stafide",     note:"ca la bunica", price:55},
  {name:"Nucă, rahat, stafide", note:"plin",         price:65},
  {name:"Mac și lămâie",        note:"",             price:60}
];
const COZ_DAYS = [{d:"21 dec", stock:32}, {d:"22 dec", stock:6}, {d:"23 dec", stock:0}];
const COZ_TOTAL = 200, COZ_RESERVED = 162, COZ_MAX = 6, COZ_CLOSE = "18 decembrie";
