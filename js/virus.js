const aiTrigger = document.querySelector('#ai-trigger');

if (aiTrigger) {
	aiTrigger.addEventListener('click', () => {
		window.location.href = './virus-quiz.html';
	});
}

const japanTime = document.querySelector('#japan-time');

if (japanTime) {
	function updateJapanTime() {
		const now = new Date();
		const formatter = new Intl.DateTimeFormat('ja-JP', {
			timeZone: 'Asia/Tokyo',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
		japanTime.textContent = formatter.format(now);
	}

	updateJapanTime();
	setInterval(updateJapanTime, 60000);
}
