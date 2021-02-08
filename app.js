'use strict';
const fs = require("fs");
const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const dialog = electron.dialog;
let ipcMain = electron.ipcMain;
let path = "", bookmark = [], separator;
let setting = {debug: true, path: ""};

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

// console.log('file://' + __dirname)

let monkeyWindow, adbWindow , exploreWindow;
const BrowserWindow = electron.BrowserWindow;
function createMonkeyWindow (callback) {
	monkeyWindow = new BrowserWindow({
		width: 9000, height: 9000,
		webPreferences: {
			nodeIntegration: true,  // 注入node模块
			enableRemoteModule: true
		}
	});

	// 
	if(setting.debug == true)
		monkeyWindow.loadURL('http://localhost:8080/monkey.html');
	else
		monkeyWindow.loadURL('https://jimc052.github.io/shell/monkey.html');
		// monkeyWindow.loadURL('file://' + __dirname + '/monkey.html');
	
	// monkeyWindow.loadURL('https://4exvp.csb.app/');
	// 

	if(setting.debug == true) // 開啟開發者工具
		monkeyWindow.webContents.openDevTools();

	monkeyWindow.on('closed', function() {
		monkeyWindow = null;
	});
	monkeyWindow.webContents.on('dom-ready', () => {
		// monkeyWindow.webContents.setZoomFactor(1.2);
	});
	monkeyWindow.on('focus', (e)=>{
		focus(e, monkeyWindow)
	});
	
	if(typeof callback == "function"){
		callback();
	} else {
		refreshMenu();	
	}
}

function createAdbWindow (callback) { // 
	adbWindow = new BrowserWindow({
		width: 9000, height: 9000,
		webPreferences: {
			nodeIntegration: true,  // 注入node模块
			enableRemoteModule: true
		}
	});

	// adbWindow.loadURL('file://' + __dirname + '/vue/adb.html');
	adbWindow.loadURL('http://localhost:8080/adb.html');

	if(setting.debug == true) // 開啟開發者工具
		adbWindow.webContents.openDevTools();

	adbWindow.on('closed', function() {
		adbWindow = null;
	});
	adbWindow.webContents.on('dom-ready', () => {
		// adbWindow.webContents.setZoomFactor(1.2);
	});
	
	if(typeof callback == "function"){
		callback();
	} else {
		refreshMenu();	
	}
}
function createExploreWindow (callback) {
	exploreWindow = new BrowserWindow({
		width: 9000, height: 9000,
		webPreferences: {
			nodeIntegration: true,  // 注入node模块
			enableRemoteModule: true
		}
	});

	// exploreWindow.loadURL('file://' + __dirname + '/vue/adb.html');
	exploreWindow.loadURL('http://localhost:8080/explore.html');

	if(setting.debug == true) // 開啟開發者工具
		exploreWindow.webContents.openDevTools();

	exploreWindow.on('closed', function() {
		exploreWindow = null;
	});
	exploreWindow.webContents.on('dom-ready', () => {
		// exploreWindow.webContents.setZoomFactor(1.2);
	});

	exploreWindow.on('focus', (e)=>{
		focus(e, exploreWindow)
	});
	
	if(typeof callback == "function"){
		callback();
	} else {
		refreshMenu();	
	}
}
function refreshMenu(){
	const menu = Menu.buildFromTemplate(createMenu())
	Menu.setApplicationMenu(menu);	
}
function createMenu(){
	let file = {
		label: "檔案", 
		submenu: [
			{
				// visible: isAdmin == true ? true : false,
				label: 'monkey',
				accelerator: 'CmdOrCtrl+M',
				click: function (item, focusedWindow) {
					if(focusedWindow == monkeyWindow) {

					} else if(monkeyWindow == null)
						createMonkeyWindow();
					else {
						monkeyWindow.show();
					}
				}
			},  {
				label: '檔案管理',
				accelerator: 'Command+F',
				// visible: isAdmin == true ? true : false,
				click: function (item, focusedWindow) {
					if(focusedWindow == exploreWindow) {

					} else if(exploreWindow == null)
						createExploreWindow();
					else {
						exploreWindow.show();
					}
				}
			}, {
				type: 'separator'				
			}, {
				label: '結束',
				accelerator: 'Command+Q',
				click: function () {
					app.quit()
				}
			}
		]
	};

	let template = [ file, {
		label: '编輯',
		submenu: [{
				label: '復原',
				accelerator: 'CmdOrCtrl+Z',
				role: 'undo'
			}, {
				label: '取消復原',
				accelerator: 'Shift+CmdOrCtrl+Z',
				role: 'redo'
			}, {
				type: 'separator'
			}, {
				label: '剪下',
				accelerator: 'CmdOrCtrl+X',
				role: 'cut'
			}, {
				label: '複製',
				accelerator: 'CmdOrCtrl+C',
				role: 'copy'
			}, {
				label: '貼上',
				accelerator: 'CmdOrCtrl+V',
				role: 'paste'
			}, {
				label: '全選',
				accelerator: 'CmdOrCtrl+A',
				role: 'selectall'
			}, {
				type: 'separator'
			}, {
				label: '搜尋',
				accelerator: 'CmdOrCtrl+F',
				//key: 'reopenMenuItem',
				click: function () {
					monkeyWindow.webContents.send("search");
				}
			}]
		}, {
		label: '查看',
		submenu: [{
				label: '重新載入',
				accelerator: 'CmdOrCtrl+R',
				click: function (item, focusedWindow) {
					if (focusedWindow) {
						if (focusedWindow.id === 1) {
							BrowserWindow.getAllWindows().forEach(function (win) {
								if (win.id > 1) {
									win.close();
								}
							})
						}
						focusedWindow.reload();
						focusedWindow.show();
					}
				}
			}, {
				label: '切換全螢幕',
				accelerator: (function () {
					if (process.platform === 'darwin') {
						return 'Ctrl+Command+F'
					} else {
						return 'F11'
					}
				})(),
				click: function (item, focusedWindow) {
					if (focusedWindow) {
						focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
					}
				}
			}, {
				label: '開發者工具',
				accelerator: (function () {
					if (process.platform === 'darwin') {
						return 'Alt+Command+I'
					} else {
						return 'Ctrl+Shift+I'
					}
				})(),
				click: function (item, focusedWindow) {
					if (focusedWindow) {
						focusedWindow.toggleDevTools()
					}
				}
			}]
		}
	];

	if (process.platform === 'darwin') {
		const name = electron.app.getName();
		template.unshift({
			label: name,
			submenu: [{
				label: `關於 ${name}`,
				role: 'about'
			}, {
				type: 'separator'
			}, {
				type: 'separator'
			}, {
				label: '退出',
				accelerator: 'Command+Q',
				click: function () {
					app.quit()
				}
			}]
		});
	}
	return template;

	function createBookmark(){
		let arr = [];
		for(let i = 0; i < bookmark.length; i++){
			arr.push({label: bookmark[i].title,
				click: function () {
					monkeyWindow.webContents.send('app-open', bookmark[i].title);
				}
			});
		}
		return arr;
	}
}
/*** 只能有一個 instance ****/
// var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
//   if (monkeyWindow) {
//     if (monkeyWindow.isMinimized()) monkeyWindow.restore();
//     monkeyWindow.focus();
//   }
//   return true;
// });

// if (shouldQuit) {
//   app.quit();
//   return;
// }
/*** 只能有一個 instance ****/

let focus = (evt, win)=>{
	// console.log("window.focus..........jim")
	// console.log(evt, win)
}

app.on('ready', ()=>{
	createMonkeyWindow();
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
	if (monkeyWindow === null) {
		createMonkeyWindow();
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
