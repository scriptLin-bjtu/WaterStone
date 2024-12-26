let cardsdata;
//初始化，获取所有卡牌信息
async function initialize() {
	const url = "https://api.hearthstonejson.com/v1/latest/enUS/cards.json";
	try {
		// 获取卡牌数据
		const response = await fetch(url);
		cardsdata = await response.json();
		console.log(`Cards data loaded: ${cardsdata.length} cards`);
	} catch (error) {
		console.error('Failed to fetch cards data:', error);
		process.exit(1);
	}
}
//12324
//解析卡牌内容
function praseCardID(Cards,cardid){
	let cardname;
	Cards.forEach(i=>{
		if(i.id==cardid){
			cardname=i.name;
		}
	});
	return cardname;
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
				//console.log(c1);
				//console.log(c2);
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
//解析玩家换牌
function function2(hands) {
	const arr2Copy = ['a','b','c'];
	const arr1Copy = [ 'The Demon Seed', 'Raise Dead','Darkglare' ];
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
//解析玩家抽牌
function detectDrawCard(block,Cards){
	let drawcard=null;
	try{
		const result=block.match(/TAG_CHANGE Entity=GameEntity tag=NUM_TURNS_IN_PLAY value=([\s\S]*?)TAG_CHANGE Entity=GameEntity tag=NEXT_STEP value=MAIN_END/);
		if(result){
			drawcard=[];
			const cards=result[0].trim().matchAll(/SHOW_ENTITY - Updating Entity=\[.*?\] CardID=([^\s]+)/g);
			for(const match of cards){
				drawcard.push(praseCardID(Cards,match[1]));
			}
		}
	return drawcard;	
	}catch(e){
		console.error(e);
	}
}

(async function(){
	await initialize();
	const c=detectDrawCard(`D 12:42:50.7905301 GameState.DebugPrintPowerList() - Count=36
	D 12:42:50.7905301 GameState.DebugPrintPower() - TAG_CHANGE Entity=GameEntity tag=STEP value=MAIN_READY 
	D 12:42:50.7905301 GameState.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=刚裂的夏侯惇#5866 EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=-1 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=NUM_TURNS_IN_PLAY value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=大魔王加菲猫#5996 tag=NUM_TURNS_IN_PLAY value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=NUM_TURNS_IN_PLAY value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Banshee Tyrande id=87 zone=PLAY zonePos=0 cardId=HERO_09x player=1] tag=NUM_TURNS_IN_PLAY value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Lesser Heal id=88 zone=PLAY zonePos=0 cardId=HERO_09dbp player=1] tag=NUM_TURNS_IN_PLAY value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Nemsy Necrofizzle id=89 zone=PLAY zonePos=0 cardId=HERO_07a player=2] tag=NUM_TURNS_IN_PLAY value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Life Tap id=90 zone=PLAY zonePos=0 cardId=CS2_056_H1 player=2] tag=NUM_TURNS_IN_PLAY value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=RESOURCES value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=NEXT_STEP value=MAIN_START_TRIGGERS 
	D 12:42:50.7905301 GameState.DebugPrintPower() - BLOCK_END
	D 12:42:50.7905301 GameState.DebugPrintPower() - TAG_CHANGE Entity=GameEntity tag=STEP value=MAIN_START_TRIGGERS 
	D 12:42:50.7905301 GameState.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=刚裂的夏侯惇#5866 EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=-1 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=NEXT_STEP value=MAIN_START 
	D 12:42:50.7905301 GameState.DebugPrintPower() - BLOCK_END
	D 12:42:50.7905301 GameState.DebugPrintPower() - TAG_CHANGE Entity=GameEntity tag=STEP value=MAIN_START 
	D 12:42:50.7905301 GameState.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=刚裂的夏侯惇#5866 EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=-1 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=2166 value=80 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=467 value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     SHOW_ENTITY - Updating Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=80 zone=DECK zonePos=0 cardId= player=2] CardID=SCH_514
	D 12:42:50.7905301 GameState.DebugPrintPower() -         tag=CONTROLLER value=2
	D 12:42:50.7905301 GameState.DebugPrintPower() -         tag=CARDTYPE value=SPELL
	D 12:42:50.7905301 GameState.DebugPrintPower() -         tag=ZONE value=HAND
	D 12:42:50.7905301 GameState.DebugPrintPower() -         tag=ENTITY_ID value=80
	D 12:42:50.7905301 GameState.DebugPrintPower() -         tag=RARITY value=COMMON
	D 12:42:50.7905301 GameState.DebugPrintPower() -         tag=478 value=2
	D 12:42:50.7905301 GameState.DebugPrintPower() -         tag=MULTI_CLASS_GROUP value=5
	D 12:42:50.7905301 GameState.DebugPrintPower() -         tag=1037 value=2
	D 12:42:50.7905301 GameState.DebugPrintPower() -         tag=1043 value=1
	D 12:42:50.7905301 GameState.DebugPrintPower() -         tag=1068 value=0
	D 12:42:50.7905301 GameState.DebugPrintPower() -         tag=SPAWN_TIME_COUNT value=1
	D 12:42:50.7905301 GameState.DebugPrintPower() -         tag=SPELL_SCHOOL value=6
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=80 zone=DECK zonePos=0 cardId= player=2] tag=NUM_TURNS_IN_HAND value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=80 zone=DECK zonePos=0 cardId= player=2] tag=ZONE_POSITION value=4 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=80 zone=DECK zonePos=0 cardId= player=2] tag=ZONE_POSITION value=0 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=80 zone=DECK zonePos=0 cardId= player=2] tag=ZONE_POSITION value=4 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=3242 value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=NUM_CARDS_DRAWN_THIS_TURN value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=995 value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=80 zone=DECK zonePos=0 cardId= player=2] tag=1570 value=1 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=467 value=0 
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=NEXT_STEP value=MAIN_ACTION 
	D 12:42:50.7905301 GameState.DebugPrintPower() - BLOCK_END
	D 12:42:50.7905301 GameState.DebugPrintPower() - TAG_CHANGE Entity=GameEntity tag=STEP value=MAIN_ACTION 
	D 12:42:50.7905301 GameState.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=刚裂的夏侯惇#5866 EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=-1 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	D 12:42:50.7905301 GameState.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=NEXT_STEP value=MAIN_END 
	D 12:42:50.7905301 GameState.DebugPrintPower() - BLOCK_END
	`,cardsdata);
	console.log(c);
	

})();
