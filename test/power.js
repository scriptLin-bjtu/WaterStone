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
			const cards = block.matchAll(/GameState\.DebugPrintPower\(\).*SHOW_ENTITY - Updating Entity=\[.*?\] CardID=([^\s]+)/g);

			for (const match of cards) {
				drawcard.push(praseCardID(Cards, match[1]));
			}
		}
		return drawcard;
	} catch (e) {
		console.error(e);
	}
}
function detectShuffleCard(block, Cards,playerid) {
	let shufflecards;
	try {
		if(!(block.match(playerid)&&block.match('GameState.DebugPrintPower()')))return shufflecards;
		const matchs=block.match(/HIDE_ENTITY - Entity=\[.*?\] tag=ZONE value=DECK/g);
		if(matchs){
			shufflecards=[];
			matchs.forEach(match=>{
				const idMatch = match.match(/cardId=([^\s]+)\b/);
				shufflecards.push(praseCardID(Cards, idMatch[1]));
			});
		}else{
			//检测洗入的生成的牌
			//检测生成的法术
			if(block.match("SUB_SPELL_START")&&block.match("SHUFFLE_DECK")){
				shufflecards=[];
				const subs=block.match(/SHOW_ENTITY[\s\S]*?HIDE_ENTITY/g);
				subs.forEach(sub=>{
					const idMatch=sub.match(/CardID=([^\s]+)\b/);
					shufflecards.push(praseCardID(Cards, idMatch[1]));
				});
			}
		}
		return shufflecards;
	} catch (e) {
		console.error(e);
	}
}
(async function(){
	await initialize();
	const c=detectDrawCard(`
	D 12:42:50.7905301 GameState.DebugPrintPowerList() - Count=36
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

`,cardsdata,'刚裂的夏侯惇');
	console.log(c);
})();
