//解析卡牌内容
function praseCardID(Cards, cardid) {
	let cardname;
	Cards.forEach(i => {
		if (i.id == cardid) {
			cardname = i.name;
		}
	});
	return cardname;
}
//解析玩家ID
function findPlayerID(block) {
	try {
		let playerid = null;
		let result;
		if (block.match(/PlayerID=1, PlayerName=UNKNOWN HUMAN PLAYER/)) {
			result = block.match(/PlayerID=2, PlayerName=([^\n]*\d)/);
		} else if (block.match(/PlayerID=2, PlayerName=UNKNOWN HUMAN PLAYER/)) {
			result = block.match(/PlayerID=1, PlayerName=([^\n]*\d)/);
		}
		if (result) {
			playerid = result[1];
		}
		return playerid;
	} catch (err) {
		console.error(err);
	}
}
//解析玩家初始手牌
function findStartingHand(block) {
	try {
		let hands;
		if (block.match(/TAG_CHANGE Entity=GameEntity tag=TURN value=1/)) {
			const results = block.match(/SHOW_ENTITY - Updating Entity=\[.*?\] CardID=([^\s]+)/g); //捕获所有cardid
			hands = results.map(result => {
				return result.match(/CardID=([^\s]+)/)[1];
			});
		}
		return hands;
	} catch (e) {
		console.error(e);
	}
}
//解析玩家换牌
function findSwitchCards(block, playerid, hands, cards) {
	try {
		const reg1 = new RegExp(`TAG_CHANGE Entity=${playerid} tag=MULLIGAN_STATE value=DEALING`);
		const reg2 = new RegExp(`TAG_CHANGE Entity=${playerid} tag=MULLIGAN_STATE value=WAITING`);
		const reg3 = new RegExp(
			`TAG_CHANGE Entity=${playerid} tag=MULLIGAN_STATE value=DEALING([\\s\\S]*?)TAG_CHANGE Entity=${playerid} tag=MULLIGAN_STATE value=WAITING`
		);
		if (block.match(reg1) && block.match(reg2)) {
			const result = block.match(reg3)[1].trim();
			const cards1 = result.match(/SHOW_ENTITY - Updating Entity=\[.*?\] CardID=([^\s]+)/g); //替换的卡牌数组
			const cards2 = result.match(/HIDE_ENTITY - Entity=\[.*?cardId=([^\s]+).*?\] tag=ZONE value=DECK/g) //新换的卡牌数组
			if (cards1 && cards2) {
				const c1 = cards1.map(result => {
					return praseCardID(cards, result.match(/CardID=([^\s]+)/)[1]);
				});
				const c2 = cards2.map(result => {
					return praseCardID(cards, result.match(/cardId=([^\s]+)/)[1]);
				});
				const arr2Copy = [...c1];
				const arr1Copy = [...c2];
				return hands.map(item => {
					const index = arr1Copy.indexOf(item);
					if (index !== -1) {
						const replacement = arr2Copy[index];
						arr1Copy.splice(index, 1);
						arr2Copy.splice(index, 1);
						return replacement;
					}
					return item;
				});
			}
			return hands;
		}
		return null;
	} catch (e) {
		console.error(e);
	}
}
//解析玩家抽牌
function detectDrawCard(block,Cards,playerid) {
	let drawcard;
	try {
		if(!(block.match(playerid)&&block.match('GameState.DebugPrintPower()')))return drawcard;
		const result = block.match(
			/TAG_CHANGE Entity=GameEntity tag=NUM_TURNS_IN_PLAY value=([\s\S]*?)TAG_CHANGE Entity=GameEntity tag=NEXT_STEP value=MAIN_END/
			);
		if (result) {
			drawcard = [];
			const cards = result[0].trim().matchAll(/SHOW_ENTITY - Updating Entity=\[.*?\] CardID=([^\s]+)/g);
			for (const match of cards) {
				drawcard.push(praseCardID(Cards, match[1]));
			}
		}else if(block.match('NUM_CARDS_DRAWN_THIS_TURN')){
			drawcard = [];
			const cards = block.matchAll(/SHOW_ENTITY - Updating Entity=\[.*?\] CardID=([^\s]+)/g);
			for (const match of cards) {
				drawcard.push(praseCardID(Cards, match[1]));
			}
		}
		return drawcard;
	} catch (e) {
		console.error(e);
	}
}
//解析玩家洗牌
function detectShuffleCard(block, Cards,playerid) {
	let shufflecards;
	try {
		if(!(block.match(playerid)&&block.match('GameState.DebugPrintPower()')))return shufflecards;
		const matchs=block.match(/HIDE_ENTITY - Entity=\[.*?\] tag=ZONE value=DECK/);
		if(matchs){
			shufflecards=[];
			matchs.forEach(match=>{
				const idMatch = match.match(/cardId=([^\s]+)\b/);
				shufflecards.push(praseCardID(Cards, idMatch[1]));
			});
		}else{
			//检测洗入的生成的牌
		}
		return shufflecards;
	} catch (e) {
		console.error(e);
	}
}
//解析玩家打出牌
function detectPlayCard(block, Cards,playerid) {
	try {
		let play;
		if(!(block.match(playerid)&&block.match('GameState.DebugPrintPower()')))return play;
		if(block.match('BLOCK_START BlockType=PLAY')){
			const playcard=block.match(/TAG_CHANGE Entity=\[.*?\] tag=ZONE value=PLAY/);
			const idMatch = playcard[0].match(/cardId=([^\s]+)\b/);
			play=praseCardID(Cards, idMatch[1]);
		}
		return play;
	} catch (e) {
		console.error(e);
	}
}
//解析游戏结束
function detectGameOver(block) {
	try {
		if (block.match(/TAG_CHANGE Entity=GameEntity tag=STEP value=FINAL_GAMEOVER/)) return true;
		return false;
	} catch (e) {
		console.error(e);
	}
}
exports.findPlayerID = findPlayerID;
exports.findStartingHand = findStartingHand;
exports.praseCardID = praseCardID;
exports.findSwitchCards = findSwitchCards;
exports.detectGameOver = detectGameOver;
exports.detectDrawCard = detectDrawCard;