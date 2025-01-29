const {
	EventEmitter
} = require('events');
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

class GameListener extends EventEmitter {
	constructor() {
		super();
		this.start = true;
		this.deckInfo = null;
		this.filePath = '';
		this.lastSize = 0;
		this.gameCode = 0;
		this.cardsdata = null;
		this.watcher = null;
		this.handCards = [];
		this.deckCards = [];
		this.playCards = [];
		this.playerID = null;
		this.token = '';
		this.clientId = '8fc521627888417f9780f71f3aa6e9b0';
		this.clientSecret = 'yahsvIN51FO2PQfjnVhj7qE7l8bvZXRq';
		this.credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
		this.decknameandid = null;
		this.currentDeckRate = null;
		this.AllDeckRate = null;
		this.lang='English';
		this.langVar1='';
		this.langVar2='';
	}

	async fetchOAuthToken() {
		const url = 'https://oauth.battle.net/token';
		const params = new URLSearchParams();
		params.append('grant_type', 'client_credentials');
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Authorization': `Basic ${this.credentials}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: params.toString(),
			});
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const data = await response.json();
			return data.access_token;
		} catch (error) {
			console.error('Error fetching OAuth token:', error);
		}
	}

	async monitorLogDir() {
		try {
			setInterval(async () => {
				const latestLog = await findLog();
				if (latestLog !== this.filePath) {
					if (fs.existsSync(latestLog + '/Decks.log')) {
						if (this.filePath !== '') {
							fs.unwatchFile(this.filePath + '/Decks.log');
							fs.unwatchFile(this.filePath + '/Power.log');
						}
						console.log(`日志目录更新：${latestLog}`);
						this.emit('showMessage',`日志目录更新：${latestLog}`);
						this.filePath = latestLog;
						this.lastSize = 0;
						this.startWatchingDeck(this.filePath + '/Decks.log');
						if (fs.existsSync(latestLog + '/Power.log')) {
							this.setupPowerLogFile(latestLog + '/Power.log');
						} else {
							this.startWatchingPower(this.filePath);
						}
					}
				}
			}, 5000);
		} catch (err) {
			console.error('目录监控错误:', err);
		}
	}

	async startWatchingPower(Path) {
		try {
			if (this.watcher) this.watcher.close();
			this.watcher = fs.watch(Path, (event, filename) => {
				if (event == 'rename' && filename == 'Power.log') {
					this.setupPowerLogFile(Path + '/Power.log');
					this.watcher.close();
				}
			});
		} catch (err) {
			console.error(err);
		}
	}

	setupPowerLogFile(powerLogPath) {
		console.log('正在监测Power.log:');
		this.emit('showMessage','正在监测Power.log:');
		this.emit('showMessage','********************准备就绪********************');
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
						end: curr.size
					});
					stream.on('data', (chunk) => {
						this.gameControler(this.gameCode, chunk.toString());
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

	async startWatchingDeck(deckLogPath) {
		console.log('正在监测Decks.log:');
		this.emit('showMessage','正在监测Decks.log:');
		try {
			const stats = fs.statSync(deckLogPath);
			this.lastSize = stats.size;
			fs.watchFile(deckLogPath, {
				interval: 500
			}, (curr, prev) => {
				if (curr.size > prev.size) {
					const stream = fs.createReadStream(deckLogPath, {
						start: this.lastSize,
						end: curr.size
					});
					stream.on('data', async (chunk) => {
						const content = chunk.toString();
						const deckCode = findDeckCode(content);
						if (deckCode) {
							this.deckInfo = await decode(deckCode, this.token,this.langVar2);
							this.deckCards = [];
							this.deckInfo.cards.forEach(card => {
								this.deckCards.push(card.name);
							});
							console.log('find deck info and init deckcards');
							this.emit('showMessage','find deck info and init deckcards and cardimgs');
						}
						this.decknameandid = findDeckNameAndId(content);
						console.log('检测到套牌名称与id:' + this.decknameandid);
						this.emit('showMessage','检测到套牌名称与id:' + this.decknameandid);
						if (this.decknameandid) {
							if (this.AllDeckRate[this.decknameandid[1]]) {
								if(this.AllDeckRate[this.decknameandid[1]].name!==this.decknameandid[0]){
									this.AllDeckRate[this.decknameandid[1]].name=this.decknameandid[0];
								}
								this.currentDeckRate = this.AllDeckRate[this.decknameandid[1]];
							} else {
								this.AllDeckRate[this.decknameandid[1]] = {
									win: 0,
									lost: 0,
									name: this.decknameandid[0]
								};
								this.currentDeckRate = this.AllDeckRate[this.decknameandid[1]];
							}
						}
					});
					stream.on('end', () => {
						this.lastSize = curr.size;
					});
				}
			});
		} catch (err) {
			console.error(err);
		}
	}

	async initialize() {
		const url = `https://api.hearthstonejson.com/v1/latest/${this.langVar1}/cards.collectible.json`;
		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
				}
			});
			this.cardsdata = await response.json();
			this.emit('init',this.cardsdata,this.langVar1);
			console.log(`Cards data loaded: ${this.cardsdata.length} cards`);
			this.emit('showMessage',`Cards data loaded: ${this.cardsdata.length} cards`);
		} catch (error) {
			console.error('Failed to fetch cards data:', error);
			process.exit(1);
		}
	}

	async tokenDetect() {
		try {
			const token1 = localStorage.getItem('token');
			const timestamp = localStorage.getItem('timestamp');
			const newstamp = new Date().getTime();
			if (!token1 || !timestamp || newstamp - timestamp > 43200000) {
				this.token = await this.fetchOAuthToken();
				localStorage.setItem('token', this.token);
				localStorage.setItem('timestamp', newstamp);
			} else {
				this.token = token1;
			}
		} catch (e) {
			console.error('Failed to detecttoken:' + e);
		}
	}

	async DeckRateDetect() {
		try {
			const AllDeckRate1 = localStorage.getItem('alldeckrate');
			if (AllDeckRate1) {
				this.AllDeckRate = JSON.parse(AllDeckRate1);
			} else {
				const obj = {};
				localStorage.setItem('alldeckrate', JSON.stringify(obj));
				this.AllDeckRate = {};
			}
		} catch (e) {
			console.error('Failed to detectDeckRate:' + e);
		}
	}
	
	async LangDetect(){//处理卡牌语言
		try {
			const language = localStorage.getItem('language');
			if (language) {
				this.lang = language;
			} 
			if(this.lang=='English'){
				this.langVar1='enUS';
				this.langVar2='en_US';
			}else if(this.lang=='中文'){
				this.langVar1='zhCN';
				this.langVar2='zh_CN';
			}
		} catch (e) {
			console.error('Failed to LangDetect:' + e);
		}
	}

	async gameControler(code, content) {
		switch (code) {
			case 0:
				const ID = findPlayerID(content);
				if (ID) {
					this.playerID = ID;
					console.log('检测到玩家ID:' + this.playerID);
					this.emit('showMessage','检测到玩家ID:' + this.playerID);
					this.gameCode = 1;
					this.emit('gameStart',this.deckCards,this.currentDeckRate); // 触发游戏开始事件
				}
				break;
			case 1:
				const hands = findStartingHand(content);
				if (hands) {
					const cardNames = hands.map(cardid => praseCardID(this.cardsdata, cardid));
					console.log('检测到初始手牌:' + cardNames);
					this.emit('showMessage','检测到初始手牌:' + cardNames);
					const drawobj = DrawCardUpdate(this.handCards, cardNames, this.deckCards);
					this.handCards = drawobj.hand;
					this.deckCards = drawobj.deck;
					this.emit('update', this.deckCards);
					this.gameCode = 2;

				}
				break;
			case 2:
				const result = findSwitchCards(content, this.playerID, this.cardsdata);
				const gameover0 = detectGameOver(content, this.playerID);
				if (result == 'no-switch') {
					console.log('检测到玩家没有替换手牌');
					this.emit('showMessage','检测到玩家没有替换手牌');
					this.gameCode = 3;
				} else if (result) {
					const switchobj = SwitchCardUpdate(this.handCards, result, this.deckCards);
					this.handCards = switchobj.hand;
					this.deckCards = switchobj.deck;
					console.log('检测到玩家替换后手牌:' + this.handCards);
					this.emit('showMessage','检测到玩家替换后手牌:' + this.handCards);
					this.emit('update', this.deckCards);
					this.gameCode = 3;
				}
				if (gameover0) {
					const overobj = ResetUpdate(this.handCards, this.deckCards);
					this.handCards = overobj.hand;
					this.deckCards = overobj.deck;
					console.log('检测到游戏结束' + gameover0);
					this.emit('showMessage','检测到游戏结束' + gameover0);
					if (gameover0 == 'WON') {
						this.AllDeckRate[this.decknameandid[1]].win += 1;
					} else if (gameover0 == 'LOST') {
						this.AllDeckRate[this.decknameandid[1]].lost += 1;
					}
					localStorage.setItem('alldeckrate', JSON.stringify(this.AllDeckRate));
					this.decknameandid = null;
					this.currentDeckRate = null;
					this.start = true;
					this.gameCode = 0;
					this.emit('gameOver', gameover0); // 触发游戏结束事件
				}
				break;
			case 3:
				const drawcards = detectDrawCard(content, this.cardsdata, this.playerID);
				const playedcards = detectPlayCard(content, this.cardsdata, this.playerID);
				let shufflecards = null;
				if (!this.start) {
					shufflecards = detectShuffleCard(content, this.cardsdata, this.playerID);
				}
				const gameover = detectGameOver(content, this.playerID);
				if (drawcards && drawcards.length > 0) {
					if (this.start) this.start = false;
					console.log('检测到玩家抽牌:' + drawcards);
					this.emit('showMessage','检测到玩家抽牌:' + drawcards);
					const drawobj = DrawCardUpdate(this.handCards, drawcards, this.deckCards);
					this.handCards = drawobj.hand;
					this.deckCards = drawobj.deck;
					this.emit('update', this.deckCards);
				}
				if (playedcards && playedcards.length > 0) {
					console.log('检测到玩家出牌:' + playedcards);
					this.emit('showMessage','检测到玩家出牌:' + playedcards);
					const playobj = PlayCardUpdate(this.handCards, playedcards, this.playCards);
					this.handCards = playobj.hand;
					this.playCards = playobj.play;
					this.emit('update', this.deckCards);
				}
				if (shufflecards && shufflecards.length > 0) {
					console.log('检测到玩家洗牌:' + shufflecards);
					this.emit('showMessage','检测到玩家洗牌:' + shufflecards);
					const shuffleobj = ShuffleCardUpdate(this.handCards, shufflecards, this.deckCards);
					this.handCards = shuffleobj.hand;
					this.deckCards = shuffleobj.deck;
					this.emit('update', this.deckCards);
				}
				if (gameover) {
					const overobj = ResetUpdate(this.handCards, this.deckCards);
					this.handCards = overobj.hand;
					this.deckCards = overobj.deck;
					console.log('检测到游戏结束' + gameover);
					this.emit('showMessage','检测到游戏结束' + gameover);
					if (gameover == 'WON') {
						this.AllDeckRate[this.decknameandid[1]].win += 1;
					} else if (gameover == 'LOST') {
						this.AllDeckRate[this.decknameandid[1]].lost += 1;
					}
					localStorage.setItem('alldeckrate', JSON.stringify(this.AllDeckRate));
					this.decknameandid = null;
					this.currentDeckRate = null;
					this.start = true;
					this.gameCode = 0;
					this.emit('gameOver', gameover); // 触发游戏结束事件
				}
				break;
			default:
		}
	}

	async startListening() {
		await this.tokenDetect();
		await this.DeckRateDetect();
		await this.LangDetect();
		await this.initialize();
		await this.monitorLogDir();
	}
}

module.exports = new GameListener();