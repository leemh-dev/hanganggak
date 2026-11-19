// demo/shared/demo-stocks.mjs
var MARKET_CAP_SNAPSHOT = Object.freeze({ "asOf": "2026-11-10", "asOfTime": "2026-11-10 15:10+09:00", "unit": "\uC5B5\uC6D0", "sourceUrl": "https://stockgo.kr/market", "sourceLabel": "\uC8FC\uC2DD\uC54C\uB77C\uBBF8 \uC2DC\uAC00\uCD1D\uC561 \uD45C", "fetchedAt": "2026-11-10T06:15:41.669707+00:00" });
var DEMO_STOCKS = Object.freeze([{ "id": "005930", "name": "\uC0BC\uC131\uC804\uC790", "market": "KOSPI", "change": 1.2, "map": "rooftop", "marketCap": 11669172 }, { "id": "000660", "name": "SK\uD558\uC774\uB2C9\uC2A4", "market": "KOSPI", "change": 2.4, "map": "rooftop", "marketCap": 8933921 }, { "id": "035420", "name": "NAVER", "market": "KOSPI", "change": -1.3, "map": "river", "marketCap": 294330 }, { "id": "009150", "name": "\uC0BC\uC131\uC804\uAE30", "market": "KOSPI", "change": 0.8, "map": "rooftop", "marketCap": 659545 }, { "id": "010140", "name": "\uC0BC\uC131\uC911\uACF5\uC5C5", "market": "KOSPI", "change": -0.7, "map": "river", "marketCap": 144408 }, { "id": "005380", "name": "\uD604\uB300\uCC28", "market": "KOSPI", "change": 1.1, "map": "rooftop", "marketCap": 559532 }, { "id": "000270", "name": "\uAE30\uC544", "market": "KOSPI", "change": -0.6, "map": "river", "marketCap": 375186 }, { "id": "373220", "name": "LG\uC5D0\uB108\uC9C0\uC194\uB8E8\uC158", "market": "KOSPI", "change": 1.5, "map": "rooftop", "marketCap": 776880 }, { "id": "207940", "name": "\uC0BC\uC131\uBC14\uC774\uC624\uB85C\uC9C1\uC2A4", "market": "KOSPI", "change": -1, "map": "river", "marketCap": 678162 }, { "id": "105560", "name": "KB\uAE08\uC735", "market": "KOSPI", "change": 0.4, "map": "rooftop", "marketCap": 541253 }].map((stock) => {
  const sample = true ? { "000660": 5, "000270": -5 }[stock.id] : void 0;
  return Object.freeze(sample === void 0 ? stock : { ...stock, change: sample });
}));

// demo/shared/stock-search.mjs
var normalizeSearch = (value) => String(value).normalize("NFKC").replace(/\s+/gu, "").toLocaleLowerCase("ko");
var byCode = (a, b) => a.id.localeCompare(b.id);
function searchStocks(query = "", sort = "cap", stocks = DEMO_STOCKS) {
  const q = normalizeSearch(query);
  return stocks.filter((s) => normalizeSearch(s.name).includes(q) || s.id.startsWith(q)).sort((a, b) => {
    if (sort === "code") return byCode(a, b);
    if (sort === "name") return a.name.localeCompare(b.name, "ko") || byCode(a, b);
    const cap = (s) => Number.isFinite(s.marketCap) ? s.marketCap : -Infinity;
    return cap(b) - cap(a) || 0 || byCode(a, b);
  });
}

// demo/beta-quality-completion/stock-route.mjs
var mapForChange = (change) => Number.isFinite(change) ? change < 0 ? "river" : "lounge" : null;
function stockURL(stock, gender2 = "male") {
  const map = mapForChange(stock?.change);
  if (!map || !stock?.id) return null;
  return `${map}/?${new URLSearchParams(gender2 ? { stock: stock.id, gender: gender2 === "female" ? "female" : "male" } : { stock: stock.id })}`;
}

// demo/beta-quality-completion/stock-entry.mjs
var search = document.querySelector("#choose-stock");
var list = document.querySelector("#stock-list");
var enter = document.querySelector("#stock-enter");
var status = document.querySelector("#selection");
var chosen = null;
var gender = new URLSearchParams(location.search).get("gender");
var female = document.querySelector('[value="female"]');
if (female && gender === "female") female.checked = true;
function paint() {
  list.replaceChildren();
  for (const s of searchStocks(search.value, "name", DEMO_STOCKS)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "stock-row";
    button.dataset.stock = s.id;
    button.setAttribute("aria-pressed", String(chosen?.id === s.id));
    const name = document.createElement("span"), change = document.createElement("span");
    name.textContent = s.name;
    change.textContent = `${s.change >= 0 ? "+" : ""}${s.change.toFixed(1)}%`;
    change.className = s.change < 0 ? "down" : "up";
    button.append(name, change);
    button.onclick = () => {
      chosen = s;
      search.blur();
      status.textContent = `${s.name} \u2192 ${mapForChange(s.change) === "river" ? "\uD55C\uAC15\uACF5\uC6D0" : "\uB8E8\uD504\uD0D1 \uB77C\uC6B4\uC9C0"}`;
      enter.disabled = false;
      paint();
    };
    list.append(button);
  }
  if (!list.childElementCount) list.textContent = "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC5B4\uC694.";
}
search.oninput = () => {
  chosen = null;
  enter.disabled = true;
  status.textContent = "\uC885\uBAA9\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.";
  paint();
};
enter.onclick = () => {
  const url = stockURL(chosen, document.querySelector('[name="gender"]:checked')?.value ?? null);
  if (url) location.assign(url);
};
paint();
