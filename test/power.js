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
(async function(){
	await initialize();
	const c=detectPlayCard(`
	Power.log updated: D 18:06:23.8485131 GameState.DebugPrintPowerList() - Count=25
	D 18:06:23.8485131 GameState.DebugPrintPower() - BLOCK_START BlockType=PLAY Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=0 Target=0 SubOption=-1
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=NUM_CARDS_PLAYED_THIS_TURN value=1
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=430 value=1
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=JUST_PLAYED value=1 
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=3557 value=5        
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=1068 value=1        
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=1068 value=0        
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Scarab Keychain id=16 zone=HAND zonePos=6 cardId=TOY_006 player=1] tag=ZONE_POSITION value=5
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=ZONE_POSITION value=0
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=SPAWN_TIME_COUNT value=0
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=SPAWN_TIME_COUNT value=1
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=ZONE value=PLAY     
	D 18:06:23.8485131 GameState.DebugPrintPower() -     META_DATA - Meta=SLUSH_TIME Data=3000 InfoCount=1
	D 18:06:23.8485131 GameState.DebugPrintPower() -                 Info[0] = [entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1]
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=NUM_SPELLS_PLAYED_THIS_GAME value=1
	D 18:06:23.8485131 GameState.DebugPrintPower() -     BLOCK_START BlockType=POWER Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=0 Target=0 SubOption=-1
	D 18:06:23.8485131 GameState.DebugPrintPower() -         TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=TEMP_RESOURCES value=1
	D 18:06:23.8485131 GameState.DebugPrintPower() -     BLOCK_END
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=1068 value=4        
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=1068 value=0        
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=ZONE value=GRAVEYARD
	
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=COMBO_ACTIVE value=1
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=1323 value=2
	D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=NUM_OPTIONS_PLAYED_THIS_TURN value=1
	D 18:06:23.8485131 GameState.DebugPrintPower() - BLOCK_END
	D 18:06:23.8485131 GameState.DebugPrintPower() - META_DATA - Meta=SLUSH_TIME Data=1000 InfoCount=1
	D 18:06:23.8485131 GameState.DebugPrintPower() -             Info[0] = [entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1]
	D 18:06:23.8485131 PowerTaskList.DebugDump() - ID=44 ParentID=0 PreviousID=0 TaskCount=13
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() - BLOCK_START BlockType=PLAY Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=0 Target=0 SubOption=-1
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=NUM_CARDS_PLAYED_THIS_TURN value=1
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=430 value=1
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=JUST_PLAYED value=1
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=3557 value=5    
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=1068 value=1    
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=1068 value=0    
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Scarab Keychain id=16 zone=HAND zonePos=6 cardId=TOY_006 player=1] tag=ZONE_POSITION value=5
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=ZONE_POSITION value=0
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=SPAWN_TIME_COUNT value=0
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=SPAWN_TIME_COUNT value=1
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=ZONE value=PLAY 
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     META_DATA - Meta=SLUSH_TIME Data=3000 InfoCount=1
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -                 Info[0] = [entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1]
	D 18:06:23.8485131 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=NUM_SPELLS_PLAYED_THIS_GAME value=1
	D 18:06:23.8485131 PowerTaskList.DebugDump() - Block End=(null)
	D 18:06:23.8485131 PowerProcessor.PrepareHistoryForCurrentTaskList() - m_currentTaskList=44
	D 18:06:23.8485131 PowerProcessor.DoTaskListForCard() - unhandled BlockType PLAY for sourceEntity [entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1]
	D 18:06:23.8659655 GameState.DebugPrintOptions() - id=4
	D 18:06:23.8659655 GameState.DebugPrintOptions() -   option 0 type=END_TURN mainEntity= error=INVALID errorParam=
	D 18:06:23.8659655 GameState.DebugPrintOptions() -   option 1 type=POWER mainEntity=[entityName=Moonstone Mauler id=17 zone=HAND zonePos=1 cardId=GDB_435 player=1] error=NONE errorParam=
	D 18:06:23.8659655 GameState.DebugPrintOptions() -   option 2 type=POWER mainEntity=[entityName=Birdwatching id=27 zone=HAND zonePos=2 cardId=VAC_408 player=1] error=NONE errorParam=
	D 18:06:23.8659655 GameState.DebugPrintOptions() -   option 3 type=POWER mainEntity=[entityName=Patchwork Pals id=32 zone=HAND zonePos=3 cardId=TOY_353 player=1] error=NONE errorParam=
	D 18:06:23.8659655 GameState.DebugPrintOptions() -   option 4 type=POWER mainEntity=[entityName=Safety Inspector id=29 zone=HAND zonePos=4 cardId=DMF_125 player=1] error=NONE errorParam=
	D 18:06:23.8659655 GameState.DebugPrintOptions() -   option 5 type=POWER mainEntity=[entityName=Scarab Keychain id=16 zone=HAND zonePos=5 cardId=TOY_006 player=1] error=NONE errorParam=
	D 18:06:23.8659655 GameState.DebugPrintOptions() -   option 6 type=POWER mainEntity=[entityName=Steady Shot id=65 zone=PLAY zonePos=0 cardId=HERO_05bp player=1] error=NONE errorParam=
	D 18:06:23.8659655 GameState.DebugPrintOptions() -   option 7 type=POWER mainEntity=[entityName=Rexxar id=64 zone=PLAY zonePos=0 cardId=HERO_05 player=1] error=REQ_ATTACK_GREATER_THAN_0 errorParam=
	D 18:06:23.8659655 GameState.DebugPrintOptions() -   option 8 type=POWER mainEntity=[entityName=Cardslinger Saraad id=66 zone=PLAY zonePos=0 cardId=HERO_08ar_Saraad player=2] error=REQ_YOUR_TURN errorParam=
	D 18:06:23.8659655 GameState.DebugPrintOptions() -   option 9 type=POWER mainEntity=[entityName=Fireblast id=67 zone=PLAY zonePos=0 cardId=HERO_08fbp player=2] error=REQ_YOUR_TURN errorParam=
	D 18:06:23.8659655 GameState.DebugPrintOptions() -   option 10 type=POWER mainEntity=[entityName=Babbling Book id=50 zone=PLAY zonePos=1 cardId=CORE_KAR_009 player=2] error=REQ_YOUR_TURN errorParam=
	D 18:06:23.8659655 PowerProcessor.EndCurrentTaskList() - m_currentTaskList=44
	D 18:06:23.8822353 PowerTaskList.DebugDump() - ID=45 ParentID=44 PreviousID=0 TaskCount=1
	D 18:06:23.8822353 PowerTaskList.DebugPrintPower() - BLOCK_START BlockType=POWER Entity=[entityName=The Coin id=68 zone=PLAY zonePos=0 cardId=MUDAN_COIN1 player=1] EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=0 Target=0 SubOption=-1
	D 18:06:23.8822353 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=TEMP_RESOURCES value=1
	D 18:06:23.8822353 PowerTaskList.DebugPrintPower() - BLOCK_END
	D 18:06:23.8822353 PowerProcessor.PrepareHistoryForCurrentTaskList() - m_currentTaskList=45
	D 18:06:23.8822353 PowerProcessor.EndCurrentTaskList() - m_currentTaskList=45
	D 18:06:23.8822353 PowerTaskList.DebugDump() - ID=46 ParentID=0 PreviousID=44 TaskCount=6
	D 18:06:23.8822353 PowerTaskList.DebugDump() - Block Start=(null)
	D 18:06:23.8822353 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=PLAY zonePos=0 cardId=MUDAN_COIN1 player=1] tag=1068 value=4    
	D 18:06:23.8822353 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=PLAY zonePos=0 cardId=MUDAN_COIN1 player=1] tag=1068 value=0    
	D 18:06:23.8822353 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=PLAY zonePos=0 cardId=MUDAN_COIN1 player=1] tag=ZONE value=GRAVEYARD
	D 18:06:23.8822353 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=COMBO_ACTIVE value=1
	D 18:06:23.8822353 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=1323 value=2
	D 18:06:23.8822353 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=NUM_OPTIONS_PLAYED_THIS_TURN value=1
	D 18:06:23.8822353 PowerTaskList.DebugPrintPower() - BLOCK_END
	D 18:06:23.8822353 PowerProcessor.PrepareHistoryForCurrentTaskList() - m_currentTaskList=46
	D 18:06:23.8822353 PowerProcessor.DoTaskListForCard() - unhandled BlockType PLAY for sourceEntity [entityName=The Coin id=68 zone=PLAY zonePos=0 cardId=MUDAN_COIN1 player=1]

	`,cardsdata,'刚裂的夏侯惇');
	console.log(c);
})();
