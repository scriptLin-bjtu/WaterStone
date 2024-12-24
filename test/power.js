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

(async function(){
	await initialize();
	 const r=findSwitchCards(`D 12:42:50.3073454 GameState.DebugPrintPowerList() - Count=80
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_END
	 D 12:42:50.3073454 GameState.DebugPrintPower() - TAG_CHANGE Entity=大魔王加菲猫#5996 tag=MULLIGAN_STATE value=DEALING 
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=大魔王加菲猫#5996 EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=-1 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=16 zone=DECK zonePos=0 cardId= player=1] tag=ZONE value=HAND 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=16 zone=DECK zonePos=0 cardId= player=1] tag=ZONE_POSITION value=2 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=30 zone=HAND zonePos=2 cardId= player=1] tag=ZONE_POSITION value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=30 zone=HAND zonePos=2 cardId= player=1] tag=ZONE value=DECK 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=24 zone=DECK zonePos=0 cardId= player=1] tag=ZONE value=HAND 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=24 zone=DECK zonePos=0 cardId= player=1] tag=ZONE_POSITION value=3 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=38 zone=HAND zonePos=3 cardId= player=1] tag=ZONE_POSITION value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=38 zone=HAND zonePos=3 cardId= player=1] tag=ZONE value=DECK 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=47 zone=DECK zonePos=0 cardId= player=1] tag=ZONE value=HAND 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=47 zone=DECK zonePos=0 cardId= player=1] tag=ZONE_POSITION value=4 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=15 zone=HAND zonePos=4 cardId= player=1] tag=ZONE_POSITION value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=15 zone=HAND zonePos=4 cardId= player=1] tag=ZONE value=DECK 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=大魔王加菲猫#5996 tag=MULLIGAN_STATE value=WAITING 
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_END
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=大魔王加菲猫#5996 EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=-1 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=大魔王加菲猫#5996 tag=MULLIGAN_STATE value=DONE 
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_END
	 D 12:42:50.3073454 GameState.DebugPrintPower() - TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=MULLIGAN_STATE value=DEALING 
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=刚裂的夏侯惇#5866 EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=-1 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     SHOW_ENTITY - Updating Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=66 zone=DECK zonePos=0 cardId= player=2] CardID=LOOT_014
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CONTROLLER value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CARDTYPE value=MINION
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=TAG_LAST_KNOWN_COST_IN_HAND value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=479 value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=COST value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ATK value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=HEALTH value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ZONE value=HAND
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ENTITY_ID value=66
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=FACTION value=NEUTRAL
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=RARITY value=COMMON
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=BATTLECRY value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=478 value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1037 value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1043 value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1068 value=0
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=SPAWN_TIME_COUNT value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=HAS_ACTIVATE_POWER value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=3085 value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=66 zone=DECK zonePos=0 cardId= player=2] tag=NUM_TURNS_IN_HAND value=1 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=66 zone=DECK zonePos=0 cardId= player=2] tag=ZONE_POSITION value=1 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Demon Seed id=65 zone=HAND zonePos=1 cardId=SW_091 player=2] tag=1068 value=2 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Demon Seed id=65 zone=HAND zonePos=1 cardId=SW_091 player=2] tag=1068 value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Demon Seed id=65 zone=HAND zonePos=1 cardId=SW_091 player=2] tag=1037 value=2 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Demon Seed id=65 zone=HAND zonePos=1 cardId=SW_091 player=2] tag=ZONE_POSITION value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Demon Seed id=65 zone=HAND zonePos=1 cardId=SW_091 player=2] tag=1043 value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     HIDE_ENTITY - Entity=[entityName=The Demon Seed id=65 zone=HAND zonePos=1 cardId=SW_091 player=2] tag=ZONE value=DECK
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Demon Seed id=65 zone=HAND zonePos=1 cardId=SW_091 player=2] tag=ZONE value=DECK 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     SHOW_ENTITY - Updating Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=63 zone=DECK zonePos=0 cardId= player=2] CardID=LOOT_017
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CONTROLLER value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CARDTYPE value=SPELL
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=TAG_LAST_KNOWN_COST_IN_HAND value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=COST value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ZONE value=HAND
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ENTITY_ID value=63
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=FACTION value=ALLIANCE
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=RARITY value=COMMON
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=478 value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1037 value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1043 value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1068 value=0
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=SPAWN_TIME_COUNT value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=SPELL_SCHOOL value=6
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=63 zone=DECK zonePos=0 cardId= player=2] tag=NUM_TURNS_IN_HAND value=1 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=63 zone=DECK zonePos=0 cardId= player=2] tag=ZONE_POSITION value=2 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Raise Dead  id=70 zone=HAND zonePos=2 cardId=SCH_514 player=2] tag=1068 value=2 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Raise Dead  id=70 zone=HAND zonePos=2 cardId=SCH_514 player=2] tag=1068 value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Raise Dead  id=70 zone=HAND zonePos=2 cardId=SCH_514 player=2] tag=1037 value=2 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Raise Dead  id=70 zone=HAND zonePos=2 cardId=SCH_514 player=2] tag=ZONE_POSITION value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Raise Dead  id=70 zone=HAND zonePos=2 cardId=SCH_514 player=2] tag=1043 value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     HIDE_ENTITY - Entity=[entityName=Raise Dead  id=70 zone=HAND zonePos=2 cardId=SCH_514 player=2] tag=ZONE value=DECK
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Raise Dead  id=70 zone=HAND zonePos=2 cardId=SCH_514 player=2] tag=ZONE value=DECK 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     SHOW_ENTITY - Updating Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=61 zone=DECK zonePos=0 cardId= player=2] CardID=DEEP_030
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CONTROLLER value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CARDTYPE value=MINION
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=TAG_LAST_KNOWN_COST_IN_HAND value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=479 value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=COST value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ATK value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=HEALTH value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=PREMIUM value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ZONE value=HAND
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ENTITY_ID value=61
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CARDRACE value=ELEMENTAL
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=RARITY value=RARE
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=DEATHRATTLE value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=BATTLECRY value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=478 value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1037 value=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1043 value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1068 value=0
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=SPAWN_TIME_COUNT value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=MINI_SET value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=HAS_ACTIVATE_POWER value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=3085 value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=61 zone=DECK zonePos=0 cardId= player=2] tag=NUM_TURNS_IN_HAND value=1 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=61 zone=DECK zonePos=0 cardId= player=2] tag=ZONE_POSITION value=3 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Darkglare id=74 zone=HAND zonePos=3 cardId=BT_307 player=2] tag=1068 value=2 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Darkglare id=74 zone=HAND zonePos=3 cardId=BT_307 player=2] tag=1068 value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Darkglare id=74 zone=HAND zonePos=3 cardId=BT_307 player=2] tag=1037 value=2 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Darkglare id=74 zone=HAND zonePos=3 cardId=BT_307 player=2] tag=ZONE_POSITION value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Darkglare id=74 zone=HAND zonePos=3 cardId=BT_307 player=2] tag=1043 value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     HIDE_ENTITY - Entity=[entityName=Darkglare id=74 zone=HAND zonePos=3 cardId=BT_307 player=2] tag=ZONE value=DECK
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Darkglare id=74 zone=HAND zonePos=3 cardId=BT_307 player=2] tag=ZONE value=DECK 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=MULLIGAN_STATE value=WAITING 
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_END
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=刚裂的夏侯惇#5866 EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=-1 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=MULLIGAN_STATE value=DONE 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     SHUFFLE_DECK PlayerID=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     SHUFFLE_DECK PlayerID=2
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=刚裂的夏侯惇#5866 tag=TURN value=1 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=GameEntity tag=NEXT_STEP value=MAIN_READY 
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_END
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=37 zone=DECK zonePos=0 cardId= player=1] EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=2 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     SHOW_ENTITY - Updating Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=37 zone=DECK zonePos=0 cardId= player=1] CardID=REV_018
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CONTROLLER value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CARDTYPE value=MINION
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=TAG_LAST_KNOWN_COST_IN_HAND value=3
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=479 value=3
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=COST value=3
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ATK value=3
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=HEALTH value=4
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=PREMIUM value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ZONE value=DECK
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ENTITY_ID value=37
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ELITE value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=RARITY value=LEGENDARY
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=REVEALED value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=478 value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=DECK_RULE_MOD_DECK_SIZE value=40
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1043 value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1068 value=0
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=SPAWN_TIME_COUNT value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=HAS_SIGNATURE_QUALITY value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=HAS_ACTIVATE_POWER value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=2936 value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=3085 value=4
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_END
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=37 zone=DECK zonePos=0 cardId= player=1] EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=0 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=37 zone=DECK zonePos=0 cardId= player=1] tag=TAG_SCRIPT_DATA_NUM_1 value=1 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     HIDE_ENTITY - Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=37 zone=DECK zonePos=0 cardId= player=1] tag=ZONE value=DECK
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=37 zone=DECK zonePos=0 cardId= player=1] tag=REVEALED value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     FULL_ENTITY - Creating ID=92 CardID=
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ZONE value=SETASIDE
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CONTROLLER value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ENTITY_ID value=92
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     SHOW_ENTITY - Updating Entity=92 CardID=REV_018e
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CONTROLLER value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CARDTYPE value=ENCHANTMENT
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=PREMIUM value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ATTACHED value=87
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ZONE value=SETASIDE
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=ENTITY_ID value=92
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CREATOR value=37
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1037 value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=1068 value=0
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=CREATOR_DBID value=79767
	 D 12:42:50.3073454 GameState.DebugPrintPower() -         tag=SPAWN_TIME_COUNT value=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=92 tag=1068 value=1 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=92 tag=1068 value=0 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=92 tag=ZONE value=PLAY 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Banshee Tyrande id=87 zone=PLAY zonePos=0 cardId=HERO_09x player=1] tag=3085 value=40 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Banshee Tyrande id=87 zone=PLAY zonePos=0 cardId=HERO_09x player=1] tag=HEALTH value=40 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Banshee Tyrande id=87 zone=PLAY zonePos=0 cardId=HERO_09x player=1] tag=LAST_AFFECTED_BY value=37 
	 D 12:42:50.3073454 GameState.DebugPrintPower() -     META_DATA - Meta=OVERRIDE_HISTORY Data=0 InfoCount=1
	 D 12:42:50.3073454 GameState.DebugPrintPower() -                 Info[0] = [entityName=UNKNOWN ENTITY [cardType=INVALID] id=37 zone=DECK zonePos=0 cardId= player=1]
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_END
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=GameEntity EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=4 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	 D 12:42:50.3073454 GameState.DebugPrintPower() - BLOCK_END
	 D 12:42:50.3073454 PowerTaskList.DebugDump() - ID=7 ParentID=0 PreviousID=6 TaskCount=0
	 D 12:42:50.3073454 PowerTaskList.DebugDump() - Block Start=(null)
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() - BLOCK_END
	 D 12:42:50.3073454 PowerProcessor.PrepareHistoryForCurrentTaskList() - m_currentTaskList=7
	 D 12:42:50.3073454 PowerProcessor.EndCurrentTaskList() - m_currentTaskList=7
	 D 12:42:50.3073454 PowerTaskList.DebugDump() - ID=8 ParentID=0 PreviousID=0 TaskCount=1
	 D 12:42:50.3073454 PowerTaskList.DebugDump() - Block Start=(null)
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=大魔王加菲猫#5996 tag=MULLIGAN_STATE value=DEALING 
	 D 12:42:50.3073454 PowerTaskList.DebugDump() - Block End=(null)
	 D 12:42:50.3073454 PowerProcessor.PrepareHistoryForCurrentTaskList() - m_currentTaskList=8
	 D 12:42:50.3073454 PowerProcessor.EndCurrentTaskList() - m_currentTaskList=8
	 D 12:42:50.3073454 PowerTaskList.DebugDump() - ID=9 ParentID=0 PreviousID=0 TaskCount=13
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() - BLOCK_START BlockType=TRIGGER Entity=大魔王加菲猫#5996 EffectCardId=System.Collections.Generic.List1[System.String] EffectIndex=-1 Target=0 SubOption=-1 TriggerKeyword=TAG_NOT_SET
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=16 zone=DECK zonePos=0 cardId= player=1] tag=ZONE value=HAND 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=16 zone=DECK zonePos=0 cardId= player=1] tag=ZONE_POSITION value=2 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=30 zone=HAND zonePos=2 cardId= player=1] tag=ZONE_POSITION value=0 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=30 zone=HAND zonePos=2 cardId= player=1] tag=ZONE value=DECK 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=24 zone=DECK zonePos=0 cardId= player=1] tag=ZONE value=HAND 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=24 zone=DECK zonePos=0 cardId= player=1] tag=ZONE_POSITION value=3 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=38 zone=HAND zonePos=3 cardId= player=1] tag=ZONE_POSITION value=0 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=38 zone=HAND zonePos=3 cardId= player=1] tag=ZONE value=DECK 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=47 zone=DECK zonePos=0 cardId= player=1] tag=ZONE value=HAND 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=47 zone=DECK zonePos=0 cardId= player=1] tag=ZONE_POSITION value=4 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=15 zone=HAND zonePos=4 cardId= player=1] tag=ZONE_POSITION value=0 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=15 zone=HAND zonePos=4 cardId= player=1] tag=ZONE value=DECK 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=大魔王加菲猫#5996 tag=MULLIGAN_STATE value=WAITING 
	 D 12:42:50.3073454 PowerTaskList.DebugPrintPower() - BLOCK_END
	 D 12:42:50.3073454 PowerProcessor.PrepareHistoryForCurrentTaskList() - m_currentTaskList=9
	 `, '刚裂的夏侯惇#5866', [ 'The Demon Seed', 'Raise Dead', 'Darkglare' ],cardsdata);
	 console.log("换牌后:"+r);
})();
