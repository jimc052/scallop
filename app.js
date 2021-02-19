'use strict';
const fs = require("fs");
const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const dialog = electron.dialog;
let ipcMain = electron.ipcMain;
let path = "", bookmark = [], separator;
let setting = {debug: true, path: ""};
const Window = require("./page/window");
const monkey = require("./page/monkey");
const explore = require("./page/explore");

Window.prototype.menu = [{
		label: 'monkey',
		accelerator: 'CmdOrCtrl+M',
		click: function (item, focusedWindow) {
			if(focusedWindow == monkey.window) {

			} else if(monkey.window== null)
				monkey.create();
			else {
				monkey.window.show();
			}
		}
	},  {
		label: '檔案管理',
		accelerator: 'Command+F',
		click: function (item, focusedWindow) {
			if(focusedWindow == explore.window) {

			} else if(explore.window == null)
				explore.create();
			else {
				explore.window.show();
			}
		}
	}
]

try{
	//(process.platform !== 'darwin')
	const fixPath = require('fix-path');
	fixPath();
	if(app.getAppPath().indexOf(".app/Contents/Resources/app") > 0) 
		setting.debug = false;
	
	separator = process.platform == 'darwin' ? "/" : "\\";
	path = app.getAppPath().replace(".app/Contents/Resources/app", "");
	//if(path.indexOf("Users/jimc/Electron") > -1) isAdmin = true;
	
  //console.log(language)
  console.log("path: " + path + ", debug: " + setting.debug)
 	// let text = fs.readFileSync(path + separator + "app.json", 'utf8');
	// if(typeof text == "string" && text.length > 0){
	// 	setting = JSON.parse(text);
	// 	if(typeof setting.output == "undefind" || setting.output.length == "")
	// 		setting.output = path + separator + "output";
	// }

} catch(e){
	console.log(e)
} finally {
	global.sharedObj = {"setting": setting, path: path, language: [], separator};	
	global.sharedObj.platform = process.platform;
}

app.on('ready', ()=>{
	monkey.create();
	// createAdbWindow();
	// createExploreWindow();
});

app.on('browser-window-created', function (event, win) {
	win.webContents.send('app-open');
})

app.on('window-all-closed', function () {
	// OS X 的使用習慣是當所有視窗關閉的時候，上方的 menu bar 仍然維持開啟
	// 此時應用程式還沒有完全關閉，除非使用者強制按 Cmd + Q
	//if (process.platform !== 'darwin') {
		app.quit();
	//}
});

app.on('activate', function () {
	// OS X 通常在應用程式已經起來了，但是所有視窗關閉的時候，還可以重新建立主視窗
	if (monkey.window === null) {
		monkey.create();
	}
});

ipcMain.on('render-adb', (event, arg, admin) => { // 來自 網頁
	
});

/*
monkeyWindow.webContents.send('app-export');
if(navigator.userAgent.indexOf("Electron") > -1){
	const {remote: app, ipcRenderer: ipc, clipboard: clipboard} = require('electron');
	window.app = app; window.ipc = ipc; window.clipboard = clipboard;
	window.fs = require("fs"), window.os = require('os');
}
	
ipc.send("menu-reply", [], false); // 網頁給 app.js

*/
