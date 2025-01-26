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

//解析游戏结束
function detectGameOver(block,playerid) {
	try {
		if (block.match(/TAG_CHANGE Entity=GameEntity tag=STEP value=FINAL_GAMEOVER/)) {
			let result;
			let reg1=new RegExp(`TAG_CHANGE Entity=${playerid} tag=PLAYSTATE value=WON`);
			let reg2=new RegExp(`TAG_CHANGE Entity=${playerid} tag=PLAYSTATE value=LOST`);
			if(block.match(reg1)){
				result='WON'
			}else if(block.match(reg2)){
				result='LOST'
			}
			return result;
		};
		return false;
	} catch (e) {
		console.error(e);
	}
}
(async function(){
	await initialize();
	const c=detectGameOver(`
	D 12:43:40.9084902 GameState.DebugPrintPowerList() - Count=15
	D 12:43:40.9084902 GameState.DebugPrintPower() - TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=PLAYSTATE value=CONCEDED 
	D 12:43:40.9084902 GameState.DebugPrintPower() - TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=3479 value=1 
	D 12:43:40.9084902 GameState.DebugPrintPower() - TAG_CHANGE Entity=大魔王加菲猫#5996 tag=PLAYSTATE value=WON 
	D 12:43:40.9084902 GameState.DebugPrintPower() - TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=PLAYSTATE value=LOST 
	D 12:43:40.9084902 GameState.DebugPrintPower() - TAG_CHANGE Entity=[entityName=Kobold Librarian id=66 zone=HAND zonePos=1 cardId=LOOT_014 player=2] tag=NUM_TURNS_IN_HAND value=2 
	D 12:43:40.9084902 GameState.DebugPrintPower() - TAG_CHANGE Entity=[entityName=Dark Pact id=63 zone=HAND zonePos=2 cardId=LOOT_017 player=2] tag=NUM_TURNS_IN_HAND value=2 
	D 12:43:40.9084902 GameState.DebugPrintPower() - TAG_CHANGE Entity=[entityName=Elementium Geode id=61 zone=HAND zonePos=3 cardId=DEEP_030 player=2] tag=NUM_TURNS_IN_HAND value=2 
	D 12:43:40.9084902 GameState.DebugPrintPower() - TAG_CHANGE Entity=[entityName=Raise Dead  id=80 zone=HAND zonePos=4 cardId=SCH_514 player=2] tag=NUM_TURNS_IN_HAND value=2 
	D 12:43:40.9084902 GameState.DebugPrintPower() - TAG_CHANGE Entity=GameEntity tag=NEXT_STEP value=FINAL_WRAPUP 
	D 12:43:40.9084902 GameState.DebugPrintPower() - TAG_CHANGE Entity=GameEntity tag=STEP value=FINAL_WRAPUP 
	D 12:43:40.9084902 GameState.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=GameEntity EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=-1 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	D 12:43:40.9084902 GameState.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=NEXT_STEP value=FINAL_GAMEOVER 
	D 12:43:40.9084902 GameState.DebugPrintPower() - BLOCK_END
	D 12:43:40.9084902 GameState.DebugPrintPower() - TAG_CHANGE Entity=GameEntity tag=STEP value=FINAL_GAMEOVER 
	D 12:43:40.9084902 GameState.DebugPrintPower() - TAG_CHANGE Entity=GameEntity tag=STATE value=COMPLETE 
	D 12:43:40.9084902 PowerTaskList.DebugDump() - ID=25 ParentID=0 PreviousID=0 TaskCount=10
	D 12:43:40.9084902 PowerTaskList.DebugDump() - Block Start=(null)
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=PLAYSTATE value=CONCEDED 
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=3479 value=1 
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=大魔王加菲猫#5996 tag=PLAYSTATE value=WON 
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=PLAYSTATE value=LOST 
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Kobold Librarian id=66 zone=HAND zonePos=1 cardId=LOOT_014 player=2] tag=NUM_TURNS_IN_HAND value=2 
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Dark Pact id=63 zone=HAND zonePos=2 cardId=LOOT_017 player=2] tag=NUM_TURNS_IN_HAND value=2 
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Elementium Geode id=61 zone=HAND zonePos=3 cardId=DEEP_030 player=2] tag=NUM_TURNS_IN_HAND value=2 
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Raise Dead  id=80 zone=HAND zonePos=4 cardId=SCH_514 player=2] tag=NUM_TURNS_IN_HAND value=2 
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=NEXT_STEP value=FINAL_WRAPUP 
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=STEP value=FINAL_WRAPUP 
	D 12:43:40.9084902 PowerTaskList.DebugDump() - Block End=(null)
	D 12:43:40.9084902 PowerTaskList.DebugDump() - ID=26 ParentID=0 PreviousID=0 TaskCount=1
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=GameEntity EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=-1 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=NEXT_STEP value=FINAL_GAMEOVER 
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() - BLOCK_END
	D 12:43:40.9084902 PowerTaskList.DebugDump() - ID=27 ParentID=0 PreviousID=0 TaskCount=2
	D 12:43:40.9084902 PowerTaskList.DebugDump() - Block Start=(null)
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=STEP value=FINAL_GAMEOVER 
	D 12:43:40.9084902 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=STATE value=COMPLETE 
	D 12:43:40.9084902 PowerTaskList.DebugDump() - Block End=(null)

`,'刚裂的夏侯惇#5866');
	console.log(c);
})();
