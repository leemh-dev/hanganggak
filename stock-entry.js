// demo/beta-quality-completion/quote-client.mjs
var quoteOrigin = "https://hanganggak-realtime-demo.onrender.com";

// demo/beta-quality-completion/map-entry.mjs
var input = document.querySelector("#nickname");
var buttons = [...document.querySelectorAll("[data-map]")];
var status = document.querySelector("[role=status]");
var normalized = () => input.value.normalize("NFKC").trim();
function validate() {
  const ok = /^[\p{L}\p{M}\p{N}_ -]{1,16}$/u.test(normalized());
  for (const button of buttons) button.disabled = !ok;
  status.textContent = input.value && !ok ? "\uB2C9\uB124\uC784\uC740 1~16\uC790\uB85C \uC785\uB825\uD574 \uC8FC\uC138\uC694." : "";
}
input.oninput = validate;
for (const button of buttons) button.onclick = () => {
  validate();
  if (button.disabled) return;
  try {
    sessionStorage.setItem("map-entry", JSON.stringify({ map: button.dataset.map, name: normalized() }));
    location.assign("./" + button.dataset.map + "/?enter=1");
  } catch {
    status.textContent = "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC138\uC158 \uC800\uC7A5\uC744 \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694.";
  }
};
async function counts() {
  try {
    const r = await fetch(quoteOrigin + "/rooms/occupancy", { cache: "no-store", signal: AbortSignal.timeout(2e4) });
    if (!r.ok) throw Error();
    const { counts: counts2 } = await r.json();
    for (const b of buttons) b.querySelector("span").textContent = (counts2[b.dataset.map] ?? 0) + "\uBA85";
  } catch {
    for (const b of buttons) b.querySelector("span").textContent = "\uC778\uC6D0 \uBBF8\uD655\uC778";
  }
}
window.addEventListener("pageshow", () => {
  sessionStorage.removeItem("map-entry");
  input.value = "";
  validate();
  counts();
});
setInterval(() => {
  if (!document.hidden) counts();
}, 15e3);
