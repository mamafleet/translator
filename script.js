/* script.js */
//conventient failure messages
const Fs = ([cF, rF, uF, dF] = ["create", "read", "update", "delete"].map(
  (op) => `failed to ${op} translation[s]`
));

/* wapi setup */
const wapi = wapiInit("https://auth.web10.app");
const sirs = [
  {
    service: "translator",
    cross_origins: ["docs.web10.app", "localhost", "docs.localhost"],
  },
];
wapi.SMROnReady(sirs, []);
authButton.onclick = wapi.openAuthPortal;

function initApp() {
  authButton.innerHTML = "log out";
  authButton.onclick = () => {
    wapi.signOut();
    window.location.reload();
  };
  const t = wapi.readToken();
  message.innerHTML = `hello ${t["provider"]}/${t["username"]},<br>`;
  readLines();
}

if (wapi.isSignedIn()) initApp();
else wapi.authListen(initApp);

/* CRUD Calls */
function readLines() {
  wapi
    .read("translator", {})
    .then((response) => displayTranslations(response.data))
    .catch(
      (error) => (message.innerHTML = `${rF} : ${error.response.data.detail}`)
    );
}
function createLine(latin, english) {
  wapi
    .create("translator", { latin: latin, english: english, date: String(new Date()) })
    .then(() => {
      readLines();
      curr.value = "";
    })
    .catch(
      (error) => (message.innerHTML = `${cF} : ${error.response.data.detail}`)
    );
}
function updateLine(id) {
  const latin = String(document.getElementById("latin"+id).value);
  const english = String(document.getElementById("english"+id).value);
  wapi
    .update(
      "translator",
      { _id: id },
      { $set: { english: english, latin: latin } }
    )
    .then(readLines)
    .catch(
      (error) => (message.innerHTML = `${uF} : ${error.response.data.detail}`)
    );
}
function deleteLine(id) {
  wapi
    .delete("translator", { _id: id })
    .then(readLines)
    .catch(
      (error) => (message.innerHTML = `${dF} : ${error.response.data.detail}`)
    );
}

/* display */
function displayTranslations(data) {
  function contain(line) {
    return `<div>
                <p style="font-family:monospace;">${line.date}</p>
                <textarea id="latin${line._id}">${line.latin}</textarea>
                <textarea id="english${line._id}">${line.english}</textarea>
                <button onclick="updateLine('${line._id}')">Update</button>
                <button onclick="deleteLine('${line._id}')">Delete</button>
            </div>`;
  }
  lineview.innerHTML = data.map(contain).reverse().join(`<br>`);
}
