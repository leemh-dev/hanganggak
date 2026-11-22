// demo/beta-quality-completion/quote-client.mjs
var quoteOrigin = "https://hanganggak-realtime-demo.onrender.com";

// demo/shared/nickname.mjs
function nickname(value) {
  if (typeof value !== "string") return null;
  const name = value.normalize("NFKC").trim();
  return !/\p{Default_Ignorable_Code_Point}/u.test(name) && /^[\p{L}\p{M}\p{N}_-]{1,16}$/u.test(name) ? name : null;
}

// demo/beta-quality-completion/map-entry.mjs
var input = document.querySelector("#nickname");
var form = input.form;
var button = form.querySelector("button");
var status = form.querySelector("[role=status]");
var nicknameKey = "hanganggak-last-nickname";
var normalized = () => nickname(input.value);
var entering = false;
function validate() {
  const valid = Boolean(normalized());
  button.disabled = entering || !valid;
  status.textContent = input.value && !valid ? "\uB2C9\uB124\uC784\uC740 \uACF5\uBC31 \uC5C6\uC774 1~16\uC790\uB85C \uC785\uB825\uD574 \uC8FC\uC138\uC694." : "";
}
input.addEventListener("input", validate);
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  validate();
  if (button.disabled) return;
  entering = true;
  button.disabled = true;
  input.readOnly = true;
  let navigating = false;
  status.textContent = "\uCF54\uC2A4\uD53C \uB4F1\uB77D\uB960\uC744 \uD655\uC778\uD558\uACE0 \uC788\uC5B4\uC694.";
  try {
    const response = await fetch(quoteOrigin + "/maps/entry", { cache: "no-store", signal: AbortSignal.timeout(45e3) });
    if (!response.ok) throw Error();
    const { map, change } = await response.json();
    if (!["river", "lounge"].includes(map)) throw Error();
    const name = normalized();
    try {
      sessionStorage.setItem("map-entry", JSON.stringify({ map, name, indexChange: Number.isFinite(change) ? change : null }));
    } catch {
      status.textContent = "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC138\uC158 \uC800\uC7A5\uC744 \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694.";
      return;
    }
    try {
      localStorage.setItem(nicknameKey, name);
    } catch {
    }
    const roomUrl = new URL("./" + map + "/", location.href);
    roomUrl.searchParams.set("enter", "1");
    const version = new URL(import.meta.url).searchParams.get("v");
    if (version) roomUrl.searchParams.set("v", version);
    location.assign(roomUrl);
    navigating = true;
  } catch {
    status.textContent = "\uCF54\uC2A4\uD53C\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC785\uC7A5\uD574 \uC8FC\uC138\uC694.";
  } finally {
    if (!navigating) {
      entering = false;
      button.disabled = false;
      input.readOnly = false;
    }
  }
});
window.addEventListener("pageshow", () => {
  try {
    sessionStorage.removeItem("map-entry");
  } catch {
  }
  const rejected = new URL(location.href).searchParams.get("nickname") === "invalid";
  input.value = "";
  if (!rejected) {
    try {
      input.value = nickname(localStorage.getItem(nicknameKey)) ?? "";
    } catch {
    }
  }
  input.readOnly = false;
  entering = false;
  validate();
  if (rejected) status.textContent = "\uB2C9\uB124\uC784\uC744 \uACF5\uBC31 \uC5C6\uC774 \uB2E4\uC2DC \uC785\uB825\uD574 \uC8FC\uC138\uC694.";
});
