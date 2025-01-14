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
	const c=detectShuffleCard(`Power.log updated: D 21:36:38.1379117 GameState.DebugPrintPowerList() - Count=38
D 21:36:38.1379117 GameState.DebugPrintPower() - BLOCK_START BlockType=DECK_ACTION Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] EffectCardId=System.Collections.Generic.Lis1[System.String] EffectIndex=0 Target=0 SubOption=-1
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=2245 value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=RESOURCES_USED value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=NUM_RESOURCES_SPENT_THIS_GAME value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=CARD_TARGET value=58
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=JUST_PLAYED value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=3557 value=6

D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=IS_USING_TRADE_OPTION value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=REVEALED value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=1068 value=2

D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=1068 value=0

D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=1037 value=0

D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=ZONE_POSITION value=0
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=1043 value=0

D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=ZONE value=DECK
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=1043 value=1

D 21:36:38.1379117 GameState.DebugPrintPower() -     META_DATA - Meta=SLUSH_TIME Data=3000 InfoCount=1
D 21:36:38.1379117 GameState.DebugPrintPower() -                 Info[0] = [entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2]
D 21:36:38.1379117 GameState.DebugPrintPower() -     BLOCK_START BlockType=POWER Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=0 Target=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] SubOption=-1
D 21:36:38.1379117 GameState.DebugPrintPower() -         TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=2166 value=67
D 21:36:38.1379117 GameState.DebugPrintPower() -         TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=467 value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -         SHOW_ENTITY - Updating Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=67 zone=DECK zonePos=0 cardId= player=2] CardID=CORE_SW_072
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=CONTROLLER value=2
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=CARDTYPE value=MINION
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=TAG_LAST_KNOWN_COST_IN_HAND value=3
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=479 value=3
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=COST value=3
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=ATK value=3
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=HEALTH value=4
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=ZONE value=HAND
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=ENTITY_ID value=67
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=CARDRACE value=PET
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=RARITY value=COMMON
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=BATTLECRY value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=478 value=2
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=858 value=64720
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=1037 value=2
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=1043 value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=1068 value=0
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=SPAWN_TIME_COUNT value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=TRADEABLE value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=DECK_ACTION_COST value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=HAS_ACTIVATE_POWER value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -             tag=3085 value=4
D 21:36:38.1379117 GameState.DebugPrintPower() -         TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=67 zone=DECK zonePos=0 cardId= player=2] tag=NUM_TURNS_IN_HAND value=1
D 21:36:38.1379117 GameState.DebugPrintPower() -         TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=67 zone=DECK zonePos=0 cardId= player=2] tag=ZONE_POSITION value=6
D 21:36:38.1379117 GameState.DebugPrintPower() -         TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=67 zone=DECK zonePos=0 cardId= player=2] tag=ZONE_POSITION value=0
D 21:36:38.1379117 GameState.DebugPrintPower() -         TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=67 zone=DECK zonePos=0 cardId= player=2] tag=ZONE_POSITION value=6
D 21:36:38.1379117 GameState.DebugPrintPower() -         TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=NUM_CARDS_DRAWN_THIS_TURN value=2
D 21:36:38.1379117 GameState.DebugPrintPower() -         TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=995 value=2
D 21:36:38.1379117 GameState.DebugPrintPower() -         TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=67 zone=DECK zonePos=0 cardId= player=2] tag=1570 value=2
D 21:36:38.1379117 GameState.DebugPrintPower() -         TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=467 value=0
D 21:36:38.1379117 GameState.DebugPrintPower() -     BLOCK_END
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=1037 value=2

D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=IS_USING_TRADE_OPTION value=0
D 21:36:38.1379117 GameState.DebugPrintPower() -     HIDE_ENTITY - Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=ZONE value=DECK
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=REVEALED value=0
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=1323 value=2
D 21:36:38.1379117 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=NUM_OPTIONS_PLAYED_THIS_TURN value=1
D 21:36:38.1379117 GameState.DebugPrintPower() - BLOCK_END
D 21:36:38.1379117 GameState.DebugPrintPower() - META_DATA - Meta=SLUSH_TIME Data=1000 InfoCount=1
D 21:36:38.1379117 GameState.DebugPrintPower() -             Info[0] = [entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2]
D 21:36:38.1379117 PowerTaskList.DebugDump() - ID=45 ParentID=0 PreviousID=0 TaskCount=16
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() - BLOCK_START BlockType=DECK_ACTION Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=0 Target=0 SubOption=-1
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=2245 value=1
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=RESOURCES_USED value=1
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=NUM_RESOURCES_SPENT_THIS_GAME value=1
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=CARD_TARGET value=58
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=JUST_PLAYED value=1
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=3557 value=6
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=IS_USING_TRADE_OPTION value=1
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=REVEALED value=1
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=1068 value=2
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=1068 value=0
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=1037 value=0
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=ZONE_POSITION value=0
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=1043 value=0
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=ZONE value=DECK
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2] tag=1043 value=1
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -     META_DATA - Meta=SLUSH_TIME Data=3000 InfoCount=1
D 21:36:38.1379117 PowerTaskList.DebugPrintPower() -                 Info[0] = [entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2]
D 21:36:38.1379117 PowerTaskList.DebugDump() - Block End=(null)
D 21:36:38.1379117 PowerProcessor.PrepareHistoryForCurrentTaskList() - m_currentTaskList=45
D 21:36:38.1379117 PowerProcessor.DoTaskListForCard() - unhandled BlockType DECK_ACTION for sourceEntity [entityName=Big Game Hunter id=58 zone=HAND zonePos=6 cardId=CORE_EX1_005 player=2]
D 21:36:38.1551630 GameState.DebugPrintOptions() - id=4
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 0 type=END_TURN mainEntity= error=INVALID errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 1 type=POWER mainEntity=[entityName=The Coin id=84 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=2] error=NONE errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 2 type=POWER mainEntity=[entityName=Wind-Up Musician id=70 zone=HAND zonePos=1 cardId=TOY_509 player=2] error=REQ_ENOUGH_MANA errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 3 type=POWER mainEntity=[entityName=Wind-Up Musician id=70 zone=HAND zonePos=1 cardId=TOY_509 player=2] error=REQ_ENOUGH_MANA errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 4 type=POWER mainEntity=[entityName=Speaker Stomper id=63 zone=HAND zonePos=2 cardId=JAM_034 player=2] error=REQ_ENOUGH_MANA errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 5 type=POWER mainEntity=[entityName=Speaker Stomper id=63 zone=HAND zonePos=2 cardId=JAM_034 player=2] error=REQ_ENOUGH_MANA errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 6 type=POWER mainEntity=[entityName=Guild Trader id=55 zone=HAND zonePos=3 cardId=SW_061 player=2] error=REQ_ENOUGH_MANA errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 7 type=POWER mainEntity=[entityName=Guild Trader id=55 zone=HAND zonePos=3 cardId=SW_061 player=2] error=REQ_ENOUGH_MANA errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 8 type=POWER mainEntity=[entityName=Traveling Merchant id=52 zone=HAND zonePos=4 cardId=SW_307 player=2] error=REQ_ENOUGH_MANA errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 9 type=POWER mainEntity=[entityName=Traveling Merchant id=52 zone=HAND zonePos=4 cardId=SW_307 player=2] error=REQ_ENOUGH_MANA errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 10 type=POWER mainEntity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=67 zone=DECK zonePos=0 cardId= player=2] error=REQ_ENOUGH_MANA errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 11 type=POWER mainEntity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=67 zone=DECK zonePos=0 cardId= player=2] error=REQ_ENOUGH_MANA errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 12 type=POWER mainEntity=[entityName=Banshee Tyrande id=80 zone=PLAY zonePos=0 cardId=HERO_09x player=1] error=REQ_YOUR_TURN errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 13 type=POWER mainEntity=[entityName=Lesser Heal id=81 zone=PLAY zonePos=0 cardId=HERO_09dbp player=1] error=REQ_YOUR_TURN errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 14 type=POWER mainEntity=[entityName=Rexxar id=82 zone=PLAY zonePos=0 cardId=HERO_05 player=2] error=REQ_ATTACK_GREATER_THAN_0 errorParam=
D 21:36:38.1551630 GameState.DebugPrintOptions() -   option 15 type=POWER mainEntity=[entityName=Steady Shot id=83 zone=PLAY zonePos=0 cardId=HERO_05bp player=2] error=REQ_ENOUGH_MANA errorParam=

	`,cardsdata,'刚裂的夏侯惇');
	console.log(c);
})();
