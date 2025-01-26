const {
	LocalStorage
} = require('node-localstorage');
const localStorage = new LocalStorage('./userdata');

//抽牌更新逻辑
function DrawCardUpdate(hand, drawcards, deck) {
	const updatedHand = hand.concat(drawcards); // 复制 hand 以避免修改原数组
	const updatedDeck = [...deck]; // 拼接 drawcards 到 deck

	// 删除 deck 中与 drawcards 匹配的元素（逐一匹配）
	for (const card of drawcards) {
		const index = updatedDeck.indexOf(card);
		if (index !== -1) {
			updatedDeck.splice(index, 1); // 删除第一个匹配的元素
		}
	}
	return {
		hand: updatedHand,
		deck: updatedDeck
	};
}
//换牌逻辑
function SwitchCardUpdate(hand, switchcards, deck) {
	// 深拷贝 switchcards 确保不被手牌的替换逻辑修改
	const switchcardsForHand = {
		old: [...switchcards.old],
		new: [...switchcards.new]
	};
	const switchcardsForDeck = {
		old: [...switchcards.old],
		new: [...switchcards.new]
	};

	// 更新手牌
	const updatedHand = hand.map(item => {
		const index = switchcardsForHand.old.indexOf(item);
		if (index !== -1) {
			const replacement = switchcardsForHand.new[index];
			switchcardsForHand.old.splice(index, 1);
			switchcardsForHand.new.splice(index, 1);
			return replacement;
		}
		return item;
	});

	// 更新牌库
	const updatedDeck = deck.map(item => {
		const index = switchcardsForDeck.new.indexOf(item);
		if (index !== -1) {
			const replacement = switchcardsForDeck.old[index];
			switchcardsForDeck.new.splice(index, 1);
			switchcardsForDeck.old.splice(index, 1);
			return replacement;
		}
		return item;
	});

	return {
		hand: updatedHand,
		deck: updatedDeck
	};
}

//洗牌逻辑
function ShuffleCardUpdate(hand, shufflecards, deck) {
	const updatedHand = [...hand]; // 复制 hand 以避免修改原数组
	const updatedDeck = [...deck, ...shufflecards]; // 拼接 shufflecards 到 deck

	// 删除 hand 中与 shufflecards 匹配的元素（逐一匹配）
	for (const card of shufflecards) {
		const index = updatedHand.indexOf(card);
		if (index !== -1) {
			updatedHand.splice(index, 1); // 删除第一个匹配的元素
		}
	}
	return {
		hand: updatedHand,
		deck: updatedDeck
	};
}

//重置逻辑
function ResetUpdate(hand, deck) {
	return {
		hand: [],
		deck: []
	}
}


let hand = ['a', 'a', 'b', 'c', 'd'];
let deck = ['d', 'e', 'f', 'g', 'g'];
let switchcards = {
	old: ['a', 'b'],
	new: ['f', 'g']
}

function findDeckCode(content) {
	if (content.includes('Finding Game With Deck')) {
		// 使用新的正则表达式匹配直到换行符或字符串结束
		const match = content.match(/AAE.+/);
		return match ? match[0] : null;
	}
	return null;
}

function findDeckNameAndId(content) {
    console.log(content);
    if (content.includes('Finding Game With Deck')) {
        // 匹配名称
        const nameMatch = content.match(/###\s(.*?)\r?\n/);  // 允许 \r?\n 作为换行符
        console.log(nameMatch);
        
        // 匹配ID
        const idMatch = content.match(/Deck ID:\s(\d+)\r?\n/); // 同样调整换行符匹配
        console.log(idMatch);
        
        // 如果找到了名称和ID，则返回
        if (nameMatch && idMatch) {
            return [nameMatch[1], idMatch[1]];  // nameMatch[1]是名称，idMatch[1]是ID
        } else {
            console.error('套牌匹配失败');
        }
    }
    return null;
}


const content = `I 23:07:38.4243141 Finding Game With Deck:
I 23:07:38.4243141 ### Custom Rogue
I 23:07:38.4243141 # Deck ID: 8781500833
I 23:07:38.4243141 AAEBAaIHCoUXkbwCr5ED/+4Dr7YEzKAF16MFs6kGrcUGkeYGCumwA/PdA/afBPefBIrJBPXdBO6eBvylBq2nBra1BgAA`;

const i=findDeckNameAndId(content);
console.log(i);
// 输出： AAEBAZrxBgqFF/W7ApG8Aq+RA//uA6+2BMygBdejBbOpBpHmBgrpsAPz3QP2nwT3nwSKyQT13QTungb8pQatpwa2tQYAAA==