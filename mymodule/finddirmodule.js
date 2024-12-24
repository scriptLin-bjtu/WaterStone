const { exec } = require('child_process');
const fsPromises = require('fs').promises;
const path = require('path');

async function getLastModifiedItemAsync(dirPath) {
    try {
        const items = await fsPromises.readdir(dirPath, { withFileTypes: true });

        if (items.length === 0) {
            console.log('文件夹为空');
            return null;
        }

        const details = await Promise.all(
            items.map(async (item) => {
                const fullPath = path.join(dirPath, item.name);
                try {
                    const stats = await fsPromises.stat(fullPath);
                    return { name: item.name, path: fullPath, mtime: stats.mtime };
                } catch (statError) {
                    console.error(`读取文件 ${item.name} 信息失败:`, statError);
                    return null; // 忽略无法读取的文件
                }
            })
        );

        const validDetails = details.filter((item) => item !== null);
        validDetails.sort((a, b) => b.mtime - a.mtime);

        if (validDetails.length === 0) {
            console.log('没有有效文件');
            return null;
        }

        return validDetails[0];
    } catch (error) {
        console.error('读取文件夹失败:', error);
    }
}

function findLog() {
    return new Promise((resolve, reject) => {
        const registryPath = `"HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Hearthstone"`;

        exec(`reg query ${registryPath} /v InstallLocation`, async (error, stdout, stderr) => {
            if (error) {
                console.error('获取路径失败:', error.message);
                reject(error);
                return;
            }

            if (stderr) {
                console.error('错误信息:', stderr);
                reject(new Error(stderr));
                return;
            }

            const match = stdout.match(/InstallLocation\s+REG_SZ\s+(.+)/);
            if (match) {
                try {
                    const data = await getLastModifiedItemAsync(
                        match[1].trim().replace(/\\/g, '/') + '/Logs'
                    );
                    resolve(data.path.replace(/\\/g,'/'));
                } catch (innerError) {
                    reject(innerError);
                }
            } else {
                console.log('未找到路径');
                resolve(null);
            }
        });
    });
}

module.exports=findLog;