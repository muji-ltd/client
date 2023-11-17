const { app, BrowserWindow, systemPreferences, session } = require("electron");
const axios = require("axios");
const express = require("express");
const colors = require("colors");

const server = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const myUrl = "http://localhost:8080/login";
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "public")));
server.listen(8080, () => {
  console.log(`The express server is running on port 8080`.green);
  console.log(`http://localhost:8080`.yellow);
});

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

server.use(cors(corsOptions));

server.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Credentials-Only", true);
});

server.get("/app", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Credentials-Only", true);
});

server.get(":endpoint([\\/\\w\\.-]*)", (req, res) => {
  let endpoint = "https://discord.com/" + req.params[0];

  axios
    .get(endpoint)
    .then((response) => {
      res.setHeader("Content-Type", response.headers["content-type"]);
      res.send(response.data);
    })
    .catch(() => {
      res.sendStatus(404);
    });
});

async function createWindow() {
  let win = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    icon: __dirname + "/appAssets/app.ico",
    title: "Mammon Client",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webSecurity: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
    },
  });

  if (systemPreferences && systemPreferences.askForMediaAccess) systemPreferences.askForMediaAccess("microphone");
  win.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });

  win.loadURL(myUrl);
  const filter = {
    urls: ["<all_urls>"],
  };
  const { session } = win.webContents;

  session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    if (
      [
        "https://discord.com/api/v9/users/@me/library",
        "https://discord.com/api/v9/users/@me/guilds/premium/subscriptions",
        "https://discord.com/api/v9/science",
      ].includes(details.url) ||
      details.url.includes("https://discord.com/api/v9/users/@me/billing/trials/") ||
      details.url.includes("https://discord.com/api/v9/users/@me/applications/")
    ) {
      return callback({ cancel: true });
    }
    if (details.url.startsWith("https://discord.com/assets")) {
      details.requestHeaders["User-Agent"] =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36";
    } else {
      delete details.requestHeaders["User-Agent"];
    }

    callback({ requestHeaders: details.requestHeaders });
  });
}

app.whenReady().then(() => {
  createWindow();
  session.defaultSession.clearCache();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
