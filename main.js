const fs = require('fs');
const findLog = require('./mymodule/finddirmodule.js');
const {
	findDeckCode,
	decode
} = require('./mymodule/deckTracer.js');
const {
	findPlayerID,
	findStartingHand,
	praseCardID,
	detectGameOver,
	findSwitchCards,
	detectDrawCard
} = require('./mymodule/gameTracer.js');
const token = 'EU0AAthRMPTDMbEA9nivDDa7aRb9Qbejn3';
let deckInfo = null;
let filePath = '';
let lastSize = 0;
let gameCode = 0;
let cardsdata = null;
let watcher = null;
let handCards = [];
let playerID = null;
//监控日志目录
async function monitorLogDir() {
	try {
		setInterval(async () => {
			const latestLog = await findLog();
			if (latestLog !== filePath) {
				if (fs.existsSync(latestLog + '/Decks.log')) {
					if (filePath !== '') {
						fs.unwatchFile(filePath + '/Decks.log');
						fs.unwatchFile(filePath + '/Power.log');
					}
					console.log(`日志目录更新：${latestLog}`);
					filePath = latestLog;
					lastSize = 0;
					startWatchingDeck(filePath + '/Decks.log');
					if (fs.existsSync(latestLog + '/Power.log')) {
						setupPowerLogFile(latestLog + '/Power.log');
					} else {
						startWatchingPower(filePath);
					}
				}
			}
		}, 5000);
	} catch (err) {
		console.error('目录监控错误:', err);
	}
}
//监控当Power.log创建时
async function startWatchingPower(Path) {
	try {
		if (watcher) {
			watcher.close();
		}
		watcher = fs.watch(Path, (event, filename) => {
			if (event == 'rename' && filename == 'Power.log') {
				setupPowerLogFile(Path + '/Power.log');
				watcher.close();
			}
		});
	} catch (err) {
		console.error(err);
	}
}
//监控Power.log
function setupPowerLogFile(powerLogPath) {
	console.log('正在监测Power.log:');
	try {
		let lastSize = 0;
		const stats = fs.statSync(powerLogPath);
		lastSize = stats.size;
		fs.watchFile(powerLogPath, {
			interval: 500
		}, (curr, prev) => {
			if (curr.size > prev.size) {
				const stream = fs.createReadStream(powerLogPath, {
					start: lastSize,
					end: curr.size,
				});
				stream.on('data', (chunk) => {
					console.log('**********************************************');
					console.log('Power.log updated:', chunk.toString());
					console.log('**********************************************');
					//gameControler(gameCode, chunk.toString());
				});
				stream.on('end', () => {
					lastSize = curr.size;
				});
			}
		});
	} catch (err) {
		console.error(err);
	}
}
//监控Decks.log
async function startWatchingDeck(deckLogPath) {
	console.log('正在监测Decks.log:');
	try {
		const stats = fs.statSync(deckLogPath);
		lastSize = stats.size;
		fs.watchFile(deckLogPath, {
			interval: 500
		}, (curr, prev) => {
			if (curr.size > prev.size) {
				const stream = fs.createReadStream(deckLogPath, {
					start: lastSize,
					end: curr.size
				});
				stream.on('data', async (chunk) => {
					const deckCode = findDeckCode(chunk.toString());
					if (deckCode) {
						deckInfo = await decode(deckCode, token);
						//console.log(deckInfo);
						console.log('find deck info');
					}
				});
				stream.on('end', () => {
					lastSize = curr.size;
				});
			}
		});
	} catch (err) {
		console.error(err);
	}
}

//初始化，获取所有卡牌信息
async function initialize() {
	const url = "https://api.hearthstonejson.com/v1/latest/enUS/cards.json";
	try {
		// 获取卡牌数据
		const response = await fetch(url, {
			method: "GET",
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
			}
		});
		cardsdata = await response.json();
		console.log(`Cards data loaded: ${cardsdata.length} cards`);
	} catch (error) {
		console.error('Failed to fetch cards data:', error);
		process.exit(1);
	}
}
// 游戏控制器逻辑
async function gameControler(code, content) {
		switch (code) {
			case 0: //解析玩家id
				const ID = findPlayerID(content);
				if (ID) {
					playerID = ID;
					console.log('检测到玩家ID:' + playerID);
					gameCode = 1;
				}
				break;
			case 1: //初始抽牌阶段
				const hands = findStartingHand(content);
				if (hands) {
					const cardNames = hands.map(cardid => praseCardID(cardsdata, cardid));
					console.log('检测到初始手牌:' + cardNames);
					gameCode = 2;
				}
				break;
			case 2: //换牌阶段
				const result = findSwitchCards(content, playerID, handCards, cardsdata);
				if (result) {
					handCards = result;
				}
				console.log('检测到玩家替换后手牌:' + handCards);
				gameCode = 3;
				break;
			case 3: //对战阶段
				const drawcards = detectDrawCard(content, cardsdata)
				if (drawcards) {
					console.log('检测到玩家回合开始抽牌:' + drawcards);
					handCards.push(...drawcards);
				} else
				if (detectGameOver(content)) {
					console.log('检测到游戏结束');
					gameCode = 1;
				}
				break;
			default:
		}
	}
	(async function() {
		await initialize();
		await monitorLogDir();
	})();