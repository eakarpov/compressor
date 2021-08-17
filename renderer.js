// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const {ipcRenderer} = require("electron");

document.getElementById("myButton").addEventListener("click", myFunction);

function myFunction(){
    const value = document.getElementById("quality").value;
    ipcRenderer.send("button-clicked", parseInt(value, 10));
}

ipcRenderer.on("directory-picked", () => {
    document.getElementById("waitText").hidden = false;
    document.getElementById("myButton").disabled = true;
    document.getElementById("quality").disabled = true;
});
