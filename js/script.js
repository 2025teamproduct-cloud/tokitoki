const japanTime = document.querySelector('#japan-time');
const mailNotification = document.querySelector('#mail-notification');

function updateJapanTime() {
	const now = new Date();
	const formatter = new Intl.DateTimeFormat('ja-JP', {
		timeZone: 'Asia/Tokyo',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});

	japanTime.textContent = formatter.format(now);
	japanTime.dateTime = now.toISOString();
}

updateJapanTime();
setInterval(updateJapanTime, 60000);

setTimeout(() => {
	mailNotification.classList.add('is-visible');
}, 10000);


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

mailNotification.addEventListener('click', () => {

	mailWindow.classList.add('is-open');

	windowOverlay.classList.add('is-open');

	mailWindow.setAttribute(
		'aria-hidden',
		'false'
	);

});


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


/* ====================================== */
/* インストール処理 */
/* ====================================== */

const downloadBtn =
	document.querySelector('#download-btn');

const installStatus =
	document.querySelector('#install-status');

const virusNotification =
	document.querySelector('#virus-notification');

const virusNotificationClose =
	document.querySelector('#virus-notification-close');


/* -------------------------------------- */
/* インストールボタンをクリック */
/* -------------------------------------- */

downloadBtn.addEventListener('click', () => {

	/* ボタンを一度押したら無効化 */

	downloadBtn.disabled = true;

	downloadBtn.textContent = 'インストール中...';


	/* メールウィンドウを閉じる */

	closeMail();


	/* メール通知も消す */

	mailNotification.classList.remove('is-visible');


	/* インストール中表示 */

	installStatus.classList.add('is-visible');


	/* -------------------------------------- */
	/* 10秒後にウイルス検出 */
	/* -------------------------------------- */

	setTimeout(() => {

		installStatus.classList.remove('is-visible');

		virusNotification.classList.add('is-visible');

	}, 10000);

});

/* ====================================== */
/* ウイルス検出通知の× */
/* ====================================== */

function goToVirusPage() {

	window.location.href = 'virus.html';

}


/* -------------------------------------- */
/* ×ボタンをクリック */
/* -------------------------------------- */

virusNotificationClose.addEventListener('click', () => {

	goToVirusPage();

});


/* -------------------------------------- */
/* ウイルス通知表示中は画面全体をクリック可能 */
/* -------------------------------------- */

document.addEventListener('click', (event) => {

	/* ウイルス通知が表示されている場合のみ */

	if (virusNotification.classList.contains('is-visible')) {

		goToVirusPage();

	}

});