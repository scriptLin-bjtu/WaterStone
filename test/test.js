const fs = require('fs');
const path = require('path');
fs.watch(__dirname,(event,filename)=>{
	console.log(__dirname);
	console.log(`事件:${event},文件名:${filename}`);
});