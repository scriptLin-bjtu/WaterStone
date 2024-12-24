function findDeckCode(content) {
	if (content.includes('Finding Game With Deck')) {
		const match = content.match(/AAE[\w+=]+/);
		return match ? match[0] : null;
	};
	return null;
}

async function decode(deckcode, token) {
	try {
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

exports.findDeckCode=findDeckCode;
exports.decode=decode;