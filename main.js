// Modules to control application life and create native browser window
const {app, dialog, ipcMain, BrowserWindow} = require('electron')
const path = require('path');
const sharp = require("sharp");
const fs = require('fs');

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

ipcMain.on("button-clicked", async (event, value) => {
  const res = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  const directory = res.filePaths[0];
  if (directory) {
    event.reply("directory-picked");
  }
  await compressImages(directory, value);
  app.quit();
});

async function readFiles(dirname, quality) {
  const files = fs.readdirSync(dirname);
  console.log(dirname);
  for await (const file of files) {
    if (!fs.lstatSync(path.join(dirname, file)).isDirectory()) {
      const f = fs.readFileSync(path.join(dirname, file));
      const resF = await sharp(f).jpeg({ mozjpeg: true, quality }).toBuffer();
      console.log(resF);
      const [filename, ext] = file.split('.');
      fs.writeFileSync(path.join(dirname, "result", [filename, "jpg"].join('.')), resF);
    }
  }
}


async function compressImages(directory, quality) {
  if (fs.existsSync(path.join(directory, "result"))) {
    fs.rmdirSync(path.join(directory, "result"), {recursive: true });
    fs.mkdirSync(path.join(directory, "result"));
  } else {
    fs.mkdirSync(path.join(directory, "result"));
  }
  await readFiles(directory, quality);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
