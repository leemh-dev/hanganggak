// demo/beta-quality-completion/quote-client.mjs
var quoteOrigin = "https://hanganggak-realtime-demo.onrender.com";

// demo/beta-quality-completion/map-guest.mjs
var guestKey = "hanganggak-map-guest";
var memoryToken;
function storedGuest() {
  try {
    const saved = localStorage.getItem(guestKey);
    if (saved) return saved;
  } catch {
  }
  try {
    return sessionStorage.getItem(guestKey) || memoryToken;
  } catch {
    return memoryToken;
  }
}
async function guestToken(signal) {
  const previous = storedGuest();
  const res = await fetch(quoteOrigin + "/maps/guest", { method: "POST", body: /^[a-f0-9]{32}\.[a-f0-9]{64}$/.test(previous) ? previous : "", signal, cache: "no-store" });
  if (!res.ok) throw Error("\uBC29 \uC11C\uBC84\uC5D0 \uC5F0\uACB0\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694.");
  const { token } = await res.json();
  if (!token) throw Error("\uBC29 \uC785\uC7A5 \uC815\uBCF4\uB97C \uBC1B\uC9C0 \uBABB\uD588\uC5B4\uC694.");
  function remember() {
    const current = storedGuest();
    memoryToken = current && current !== previous ? current : token;
    try {
      localStorage.setItem(guestKey, memoryToken);
    } catch {
      try {
        sessionStorage.setItem(guestKey, memoryToken);
      } catch {
      }
    }
    return memoryToken;
  }
  return navigator.locks ? navigator.locks.request("hanganggak-guest-save", { signal }, remember) : remember();
}

// demo/shared/owner-nickname.mjs
function isOwnerNickname(value) {
  return typeof value === "string" && value.normalize("NFKC").replace(/[\s\p{Default_Ignorable_Code_Point}]/gu, "").normalize("NFC") === "\uAC1C\uBC1C\uAC1C\uBBF8";
}

// demo/beta-quality-completion/map-entry.mjs
var panel = document.querySelector("#owner");
var email = document.querySelector("#owner-email");
var code = document.querySelector("#owner-code");
var sendCode = document.querySelector("#send-code");
var codeRow = document.querySelector("#code-row");
var challenge;
var input = document.querySelector("#nickname");
var form = input.form;
var button = form.querySelector("[type=submit]");
var status = form.querySelector("[role=status]");
var normalized = () => input.value.normalize("NFKC").trim();
var entering = false;
function validate() {
  const valid = /^[\p{L}\p{M}\p{N}_ -]{1,16}$/u.test(normalized());
  panel.hidden = !isOwnerNickname(normalized());
  if (panel.hidden) {
    panel.open = false;
    clearCode();
    email.value = "";
  }
  button.disabled = entering || !valid;
  status.textContent = input.value && !valid ? "\uB2C9\uB124\uC784\uC740 \uD55C\uAE00\xB7\uC601\uBB38\xB7\uC22B\uC790 \uB4F1\uC744 \uC0AC\uC6A9\uD574 1~16\uC790\uB85C \uC785\uB825\uD574 \uC8FC\uC138\uC694." : "";
}
function clearCode() {
  challenge = null;
  code.value = "";
  codeRow.hidden = true;
}
async function ownerRequest(path, fields = {}) {
  const signal = AbortSignal.timeout(45e3);
  const token = await guestToken(signal);
  const res = await fetch(quoteOrigin + "/maps/owner/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, ...fields }),
    signal,
    cache: "no-store"
  });
  const data = await res.json();
  if (!res.ok) throw Error(data.error || "\uC6B4\uC601\uC790 \uC778\uC99D\uC744 \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694.");
  return data;
}
function lock(value) {
  entering = value;
  button.disabled = value;
  input.readOnly = value;
  sendCode.disabled = value;
  email.readOnly = value;
  code.readOnly = value;
}
email.addEventListener("input", clearCode);
sendCode.addEventListener("click", async () => {
  if (entering) return;
  if (!email.value.trim()) {
    status.textContent = "\uC6B4\uC601\uC790 \uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.";
    email.focus();
    return;
  }
  lock(true);
  status.textContent = "\uC778\uC99D \uCF54\uB4DC\uB97C \uC694\uCCAD\uD558\uACE0 \uC788\uC5B4\uC694.";
  try {
    const result = await ownerRequest("code", { email: email.value.trim() });
    challenge = result.id;
    codeRow.hidden = false;
    code.value = "";
    status.textContent = "\uBA54\uC77C\uC5D0 \uB3C4\uCC29\uD55C \uCF54\uB4DC 6\uC790\uB9AC\uB97C 10\uBD84 \uC548\uC5D0 \uC785\uB825\uD574 \uC8FC\uC138\uC694.";
  } catch (err) {
    status.textContent = err.message;
  } finally {
    lock(false);
    if (challenge) code.focus();
  }
});
input.addEventListener("input", validate);
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  validate();
  if (button.disabled) return;
  lock(true);
  let navigating = false;
  try {
    if (isOwnerNickname(normalized())) {
      status.textContent = "\uC6B4\uC601\uC790 \uC778\uC99D\uC744 \uD655\uC778\uD558\uACE0 \uC788\uC5B4\uC694.";
      try {
        if (!(await ownerRequest("access")).approved) {
          panel.open = true;
          if (!challenge || !/^\d{6}$/.test(code.value)) {
            status.textContent = "\uC774 \uC774\uB984\uC740 \uC6B4\uC601\uC790 \uC804\uC6A9\uC785\uB2C8\uB2E4. \uC774\uBA54\uC77C\uB85C \uC778\uC99D\uD558\uAC70\uB098 \uB2E4\uB978 \uB2C9\uB124\uC784\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.";
            return;
          }
          await ownerRequest("verify", { id: challenge, code: code.value });
          clearCode();
        }
      } catch (err) {
        status.textContent = err.message;
        return;
      }
    }
    status.textContent = "\uCF54\uC2A4\uD53C \uB4F1\uB77D\uB960\uC744 \uD655\uC778\uD558\uACE0 \uC788\uC5B4\uC694.";
    const response = await fetch(quoteOrigin + "/maps/entry", { cache: "no-store", signal: AbortSignal.timeout(45e3) });
    if (!response.ok) throw Error();
    const { map } = await response.json();
    if (!["river", "lounge"].includes(map)) throw Error();
    try {
      sessionStorage.setItem("map-entry", JSON.stringify({ map, name: normalized() }));
    } catch {
      status.textContent = "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC138\uC158 \uC800\uC7A5\uC744 \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694.";
      return;
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
    if (!navigating) lock(false);
  }
});
window.addEventListener("pageshow", () => {
  try {
    sessionStorage.removeItem("map-entry");
  } catch {
  }
  input.value = "";
  lock(false);
  validate();
  if (new URL(location.href).searchParams.get("nickname") === "reserved") status.textContent = "\uC6B4\uC601\uC790 \uC778\uC99D\uC744 \uB2E4\uC2DC \uD558\uAC70\uB098 \uB2E4\uB978 \uB2C9\uB124\uC784\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.";
});
