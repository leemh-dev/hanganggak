// demo/shared/demo-stocks.mjs
var MARKET_CAP_SNAPSHOT = Object.freeze({ "asOf": "2026-11-10", "asOfTime": "2026-11-10 15:10+09:00", "unit": "\uC5B5\uC6D0", "sourceUrl": "https://stockgo.kr/market", "sourceLabel": "\uC8FC\uC2DD\uC54C\uB77C\uBBF8 \uC2DC\uAC00\uCD1D\uC561 \uD45C", "fetchedAt": "2026-11-10T06:15:41.669707+00:00" });
var DEMO_STOCKS = Object.freeze([{ "id": "005930", "name": "\uC0BC\uC131\uC804\uC790", "market": "KOSPI", "change": 1.2, "map": "rooftop", "marketCap": 11669172 }, { "id": "000660", "name": "SK\uD558\uC774\uB2C9\uC2A4", "market": "KOSPI", "change": 2.4, "map": "rooftop", "marketCap": 8933921 }, { "id": "035420", "name": "NAVER", "market": "KOSPI", "change": -1.3, "map": "river", "marketCap": 294330 }, { "id": "009150", "name": "\uC0BC\uC131\uC804\uAE30", "market": "KOSPI", "change": 0.8, "map": "rooftop", "marketCap": 659545 }, { "id": "010140", "name": "\uC0BC\uC131\uC911\uACF5\uC5C5", "market": "KOSPI", "change": -0.7, "map": "river", "marketCap": 144408 }, { "id": "005380", "name": "\uD604\uB300\uCC28", "market": "KOSPI", "change": 1.1, "map": "rooftop", "marketCap": 559532 }, { "id": "000270", "name": "\uAE30\uC544", "market": "KOSPI", "change": -0.6, "map": "river", "marketCap": 375186 }, { "id": "373220", "name": "LG\uC5D0\uB108\uC9C0\uC194\uB8E8\uC158", "market": "KOSPI", "change": 1.5, "map": "rooftop", "marketCap": 776880 }, { "id": "207940", "name": "\uC0BC\uC131\uBC14\uC774\uC624\uB85C\uC9C1\uC2A4", "market": "KOSPI", "change": -1, "map": "river", "marketCap": 678162 }, { "id": "105560", "name": "KB\uAE08\uC735", "market": "KOSPI", "change": 0.4, "map": "rooftop", "marketCap": 541253 }].map((stock) => {
  const sample = true ? { "000660": 5, "000270": -5 }[stock.id] : void 0;
  return Object.freeze(sample === void 0 ? stock : { ...stock, change: sample });
}));

// demo/beta-quality-completion/stock-route.mjs
var mapForChange = (change) => Number.isFinite(change) ? change < 0 ? "river" : "lounge" : null;
function stockURL(stock, gender = "male") {
  const map = mapForChange(stock?.change);
  if (!map || !stock?.id) return null;
  return `${map}/?${new URLSearchParams(gender ? { stock: stock.id, gender: gender === "female" ? "female" : "male" } : { stock: stock.id })}`;
}

// demo/beta-quality-completion/stock-policy.mjs
function ensureStockRoute() {
  const q = new URLSearchParams(location.search), stock = DEMO_STOCKS.find((s) => s.id === q.get("stock")), url = stockURL(stock, q.get("gender"));
  if (!url) {
    location.replace("../?" + new URLSearchParams({ gender: q.get("gender") === "female" ? "female" : "male" }));
    return false;
  }
  const expected = new URL("../" + url, location.href);
  if (expected.pathname !== location.pathname) {
    location.replace(expected);
    return false;
  }
  return true;
}
export {
  ensureStockRoute
};
