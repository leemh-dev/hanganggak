// demo/beta-quality-completion/quote-client.mjs
var quoteOrigin = "https://hanganggak-realtime-demo.onrender.com";

// demo/beta-quality-completion/report-confirm.mjs
var id = location.hash.slice(1);
var form = document.querySelector("form");
var code = document.querySelector("#code");
var status = document.querySelector("[role=status]");
if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) {
  form.hidden = true;
  status.textContent = "\uC778\uC99D \uBA54\uC77C\uC5D0 \uC788\uB294 \uB9C1\uD06C\uB97C \uB2E4\uC2DC \uC5F4\uC5B4 \uC8FC\uC138\uC694.";
}
form.onsubmit = async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  if (button.disabled) return;
  button.disabled = true;
  status.textContent = "\uC811\uC218 \uC911\u2026";
  try {
    const response = await fetch(quoteOrigin + "/reports/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, code: code.value }), signal: AbortSignal.timeout(25e3) });
    const result = await response.json();
    if (!response.ok) throw Error(result.error || "\uC811\uC218\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694.");
    form.reset();
    form.hidden = true;
    status.textContent = "\uC811\uC218 \uC644\uB8CC \xB7 \uBE44\uACF5\uAC1C \uC774\uC288 #" + result.number;
  } catch (error) {
    status.textContent = error.message;
    button.disabled = false;
  }
};
