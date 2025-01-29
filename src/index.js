const { MainWindow } = require('./gameGui/mainWindow.js');

const mainWindow = new MainWindow();
mainWindow.show();

// 防止应用退出
setInterval(() => {}, 1000);