const electron = require('electron');
const Menu = electron.Menu;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const debug = app.getAppPath().indexOf(".app/Contents/Resources/app") == -1 ? true : false;

function Window(props) {
  this.props = props;
}

Window.prototype.createMenu = function(){
	let template = [ {
		label: "檔案", 
		submenu: this.menu.concat([{
				type: 'separator'				
			}, {
				label: '結束',
				accelerator: 'Command+Q',
				click: function () {
					app.quit()
				}
			}
		])
	}, {
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
			// }, {
			// 	label: '搜尋',
			// 	accelerator: 'CmdOrCtrl+F',
			// 	//key: 'reopenMenuItem',
			// 	click: function () {
			// 		monkeyWindow.webContents.send("search");
			// 	}
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
		},
		{
			label: 'Window',
			submenu: [
				{ role: 'minimize' },
				{ role: 'zoom' },
				...(process.platform === 'darwin' ? [
					{ type: 'separator' },
					{ role: 'front' },
					{ type: 'separator' },
					{ role: 'window' }
				] : [
					{ role: 'close' }
				])
			]
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
				label: '退出',
				accelerator: 'Command+Q',
				click: function () {
					app.quit()
				}
			}]
		});
	}
	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

Window.prototype.create = function(){
  const BrowserWindow = electron.BrowserWindow;
	this.window = new BrowserWindow({
		width: 9000, height: 9000,
		webPreferences: {
			nodeIntegration: true,  // 注入node模块
			enableRemoteModule: true
		}
	});
  this.window.loadURL( 
    (debug == true ? 'http://localhost:8080' : 'https://jimc052.github.io/shell')
		// 'https://jimc052.github.io/shell' 
    + '/'+ this.props.name + '.html'
  );
	
	if(debug == true) // 開啟開發者工具
		this.window.webContents.openDevTools();

	this.window.on('closed', function() {
		this.window = null;
	});
	this.window.webContents.on('dom-ready', () => {
		// this.window.webContents.setZoomFactor(1.2);
	});
	this.window.on('focus', (e)=>{
		// focus(e, this.window)
	});
	
	this.createMenu();
};


module.exports = Window;
