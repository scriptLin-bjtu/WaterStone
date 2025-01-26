function findDeckCode(content) {
	if (content.includes('Finding Game With Deck')) {
		const match = content.match(/AAE.+/);
		return match ? match[0] : null;
	}
	return null;
}

function findDeckNameAndId(content) {
	if (content.includes('Finding Game With Deck')) {
		// 匹配名称
		const nameMatch = content.match(/###\s(.*?)\r?\n/); // 允许 \r?\n 作为换行符
		// 匹配ID
		const idMatch = content.match(/Deck ID:\s(\d+)\r?\n/); // 同样调整换行符匹配
		// 如果找到了名称和ID，则返回
		if (nameMatch && idMatch) {
			return [nameMatch[1], idMatch[1]]; // nameMatch[1]是名称，idMatch[1]是ID
		} else {
			console.error('套牌匹配失败');
		}
	}
	return null;
}


async function decode(deckcode, token) {
	try {
		//console.log(deckcode,token);
		const response = await fetch(
			`https://us.api.blizzard.com/hearthstone/deck?code=${deckcode}&locale=en_US`, {
				method: 'GET',
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				}
			});
		const data = await response.json();
		return data;
	} catch (err) {
		console.error(err);
	}
}

exports.findDeckCode = findDeckCode;
exports.findDeckNameAndId = findDeckNameAndId;
exports.decode = decode;