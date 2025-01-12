const block = `D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=JUST_PLAYED value=1 
D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=3557 value=5        
D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=1068 value=1        
D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=1068 value=0        
D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=Scarab Keychain id=16 zone=HAND zonePos=6 cardId=TOY_006 player=1] tag=ZONE_POSITION value=5
D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=ZONE_POSITION value=0
D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=SPAWN_TIME_COUNT value=0
D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=SPAWN_TIME_COUNT value=1
D 18:06:23.8485131 GameState.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=The Coin id=68 zone=HAND zonePos=5 cardId=MUDAN_COIN1 player=1] tag=ZONE value=PLAY`;

const card = block.match(/GameState\.DebugPrintPower\(\) -\s+TAG_CHANGE Entity=\[.*?\] tag=ZONE value=PLAY/);

if (card) {
  const idMatch = card[0].match(/cardId=([^\s]+)\b/);
  if (idMatch) {
    console.log('Captured cardId:', idMatch[1]); // 输出 cardId
  } else {
    console.log('cardId not found in matched string.');
  }
} else {
  console.log('No matching block found.');
}
