// security.js
const japanTime = document.querySelector('#japan-time');
const mailNotification = document.querySelector('#mail-notification');
const mailTime = document.querySelector('#mail-window .mail-time');

function formatJapanTime(date) {
	const formatter = new Intl.DateTimeFormat('ja-JP', {
		timeZone: 'Asia/Tokyo',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});

	return formatter.format(date);
}

function updateJapanTime() {
	const now = new Date();
	japanTime.textContent = formatJapanTime(now);
	japanTime.dateTime = now.toISOString();
}

updateJapanTime();
setInterval(updateJapanTime, 60000);

/* -------------------------------------- */
/* 5秒後にメール通知を表示 */
/* -------------------------------------- */

if (mailNotification) {
	setTimeout(() => {
		const notificationTime = new Date();
		mailNotification.classList.add('is-visible');

		if (mailTime) {
			mailTime.textContent = formatJapanTime(notificationTime);
		}
	}, 5000);
}


/* -------------------------------------- */
/* メールウィンドウ */
/* -------------------------------------- */

const mailWindow = document.querySelector('#mail-window');
const windowOverlay = document.querySelector('#window-overlay');

const closeMailWindow =
	document.querySelector('#close-mail-window');

const minimizeBtn =
	document.querySelector('#minimize-btn');

const maximizeBtn =
	document.querySelector('#maximize-btn');


/* -------------------------------------- */
/* メール通知をクリック */
/* -------------------------------------- */

if (mailNotification) {
	mailNotification.addEventListener('click', () => {

		mailWindow.classList.add('is-open');

		windowOverlay.classList.add('is-open');

		mailWindow.setAttribute(
			'aria-hidden',
			'false'
		);

	});
}


/* -------------------------------------- */
/* メールウィンドウを閉じる */
/* -------------------------------------- */

function closeMail() {

	mailWindow.classList.remove('is-open');

	windowOverlay.classList.remove('is-open');

	mailWindow.setAttribute(
		'aria-hidden',
		'true'
	);

}


/* -------------------------------------- */
/* 閉じるボタン */
/* -------------------------------------- */

closeMailWindow.addEventListener('click', () => {

	closeMail();

});


/* -------------------------------------- */
/* 背景クリックで閉じる */
/* -------------------------------------- */

windowOverlay.addEventListener('click', () => {

	closeMail();

});


/* -------------------------------------- */
/* 最小化 */
/* -------------------------------------- */

minimizeBtn.addEventListener('click', () => {

	closeMail();

});


/* -------------------------------------- */
/* 最大化 */
/* -------------------------------------- */

let isMaximized = false;

maximizeBtn.addEventListener('click', () => {

	if (isMaximized === false) {

		mailWindow.classList.add('maximized');

		isMaximized = true;

		maximizeBtn.textContent = '❐';

	} else {

		mailWindow.classList.remove('maximized');

		isMaximized = false;

		maximizeBtn.textContent = '□';

	}

});