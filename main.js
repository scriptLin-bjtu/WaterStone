const fs = require('fs');
const findLog = require('./mymodule/finddirmodule.js');
const {
	LocalStorage
} = require('node-localstorage');
const localStorage = new LocalStorage('./userdata');
const {
	findDeckCode,
	decode,
	findDeckNameAndId
} = require('./mymodule/deckTracer.js');
const {
	findPlayerID,
	findStartingHand,
	praseCardID,
	detectGameOver,
	findSwitchCards,
	detectDrawCard,
	detectPlayCard,
	detectShuffleCard
} = require('./mymodule/gameTracer.js');
const {
	ShuffleCardUpdate,
	SwitchCardUpdate,
	ResetUpdate,
	DrawCardUpdate,
	PlayCardUpdate
} = require('./mymodule/gameState.js');
let start = true;
let deckInfo = null;
let filePath = '';
let lastSize = 0;
let gameCode = 0;
let cardsdata = null;
let watcher = null;
let handCards = [];
let deckCards = [];
let playCards = [];
let Cardimgs = new Map();
let playerID = null;
let token = '';
const clientId = '8fc521627888417f9780f71f3aa6e9b0';
const clientSecret = 'yahsvIN51FO2PQfjnVhj7qE7l8bvZXRq';
const credentials = btoa(`${clientId}:${clientSecret}`);
let decknameandid;
let currentDeckRate;
let AllDeckRate;
// 获取token
async function fetchOAuthToken() {
	const url = 'https://oauth.battle.net/token';
	const params = new URLSearchParams();
	params.append('grant_type', 'client_credentials');
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': `Basic ${credentials}`, // Basic Auth
				'Content-Type': 'application/x-www-form-urlencoded', // 表单数据
			},
			body: params.toString(), // 请求体
		});

		// 检查响应状态
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// 解析 JSON 响应
		const data = await response.json();
		return data.access_token;
	} catch (error) {
		console.error('Error fetching OAuth token:', error);
	}
}

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
					// console.log('**********************************************');
					// console.log('Power.log updated:', chunk.toString());
					// console.log('**********************************************');
					gameControler(gameCode, chunk.toString());
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
					const content=chunk.toString();
					const deckCode = findDeckCode(content); //处理deckcode,套牌内容
					if (deckCode) {
						deckInfo = await decode(deckCode, token);
						deckCards = [];
						Cardimgs = new Map();
						deckInfo.cards.forEach(card => {
							deckCards.push(card.name);
							Cardimgs.set(card.name, card.image);
						});
						console.log('find deck info and init deckcards and cardimgs');
					}
					decknameandid=findDeckNameAndId(content);//处理deckname&id,套牌胜率
					console.log('检测到套牌名称与id:'+decknameandid);
					if (decknameandid) {
						if (AllDeckRate[decknameandid[1]]) {
							currentDeckRate = AllDeckRate[decknameandid[1]];
						} else {
							AllDeckRate[decknameandid[1]] = {
								win: 0,
								lost: 0,
								name: decknameandid[0]
							};
							currentDeckRate = AllDeckRate[decknameandid[1]];
						}
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
//token检测
async function tokenDetect() {
	try {
		//获取token
		const token1 = localStorage.getItem('token');
		//获取上一次时间戳
		const timestamp = localStorage.getItem('timestamp');
		const newstamp = new Date().getTime();
		if (!token1 || !timestamp || newstamp - timestamp > 43200000) {
			token = await fetchOAuthToken();
			localStorage.setItem('token', token);
			localStorage.setItem('timestamp', newstamp);
		} else {
			token = token1;
		}
	} catch (e) {
		console.error('Failed to detecttoken:' + e);
	}
}
//套牌胜率检测
async function DeckRateDetect() {
	try {
		const AllDeckRate1 = localStorage.getItem('alldeckrate');
		if (AllDeckRate1) {
			AllDeckRate = JSON.parse(AllDeckRate1);
		} else {
			const obj = {};
			localStorage.setItem('alldeckrate', JSON.stringify(obj));
			AllDeckRate = {};
		}
	} catch (e) {
		console.error('Failed to detectDeckRate:' + e);
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
					const drawobj = DrawCardUpdate(handCards, cardNames, deckCards);
					handCards = drawobj.hand;
					deckCards = drawobj.deck;
					gameCode = 2;
				}
				break;
			case 2: //换牌阶段
				const result = findSwitchCards(content, playerID, cardsdata);
				const gameover0 = detectGameOver(content, playerID);
				if (result == 'no-switch') {
					console.log('检测到玩家没有替换手牌');
					gameCode = 3;
				} else if (result) {
					const switchobj = SwitchCardUpdate(handCards, result, deckCards);
					handCards = switchobj.hand;
					deckCards = switchobj.deck;
					console.log('检测到玩家替换后手牌:' + handCards);
					gameCode = 3;
				}
				if (gameover0) { //处理胜率，游戏结束处理//当有一方投降时
					const overobj = ResetUpdate(handCards, deckCards);
					handCards = overobj.hand;
					deckCards = overobj.deck;
					console.log('检测到游戏结束' + gameover);
					if (gameover == 'WON') {
						AllDeckRate[decknameandid[1]].win += 1;
					} else if (gameover == 'LOST') {
						AllDeckRate[decknameandid[1]].lost += 1;
					}
					localStorage.setItem('alldeckrate', JSON.stringify(AllDeckRate));
					decknameandid = null;
					currentDeckRate = null;
					start = true;
					gameCode = 1;
				}
				break;
			case 3: //对战阶段
				const drawcards = detectDrawCard(content, cardsdata, playerID);
				const playedcards = detectPlayCard(content, cardsdata, playerID);
				let shufflecards = null;
				if (!start) {
					shufflecards = detectShuffleCard(content, cardsdata, playerID);
				}
				const gameover = detectGameOver(content, playerID);
				if (drawcards && drawcards.length > 0) {
					if (start) {
						start = false;
					}
					console.log('检测到玩家抽牌:' + drawcards);
					const drawobj = DrawCardUpdate(handCards, drawcards, deckCards);
					handCards = drawobj.hand;
					deckCards = drawobj.deck;
				}
				if (playedcards && playedcards.length > 0) {
					console.log('检测到玩家出牌:' + playedcards);
					const playobj = PlayCardUpdate(handCards, playedcards, playCards);
					handCards = playobj.hand;
					playCards = playobj.play;
				}
				if (shufflecards && shufflecards.length > 0) {
					console.log('检测到玩家洗牌:' + shufflecards);
					const shuffleobj = ShuffleCardUpdate(handCards, shufflecards, deckCards);
					handCards = shuffleobj.hand;
					deckCards = shuffleobj.deck;
				}
				if (gameover) { //处理胜率，游戏结束处理
					const overobj = ResetUpdate(handCards, deckCards);
					handCards = overobj.hand;
					deckCards = overobj.deck;
					console.log('检测到游戏结束' + gameover);
					if (gameover == 'WON') {
						AllDeckRate[decknameandid[1]].win += 1;
					} else if (gameover == 'LOST') {
						AllDeckRate[decknameandid[1]].lost += 1;
					}
					localStorage.setItem('alldeckrate', JSON.stringify(AllDeckRate));
					decknameandid = null;
					currentDeckRate = null;
					start = true;
					gameCode = 1;
				}
				break;
			default:
		}
	}
	(async function() {
		await tokenDetect();
		await DeckRateDetect();
		await initialize();
		await monitorLogDir();
	})();