// securiti.js
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

/* メールが届く処理(一旦コメントアウト。戻すときはこのブロックを囲むコメント記号を外す)
if (mailNotification) {
	setTimeout(() => {
		const notificationTime = new Date();
		mailNotification.classList.add('is-visible');

		if (mailTime) {
			mailTime.textContent = formatJapanTime(notificationTime);
		}
	}, 10000);
}
*/


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

	if (mailNotification) {
		mailNotification.classList.remove('is-visible');
	}


	/* インストール中表示 */

	installStatus.classList.add('is-visible');


	/* -------------------------------------- */
	/* 10秒後にウイルス検出 */
	/* -------------------------------------- */

	setTimeout(() => {

		installStatus.classList.remove('is-visible');

		virusNotification.classList.add('is-visible');

	}, 6000);

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


/* ====================================== */
/* 背景の変化(青 → #600000)+ ネフユの豹変 */
/* ====================================== */

/* -------------------------------------- */
/* タイミング設定(ミリ秒) */
/* -------------------------------------- */

const FRIENDLY_APPEAR_DELAY = 1000;   // 到着してから、ネフユが話し始めるまで
const BLUE_DURATION = 5500;           // 青い画面のまま見せる時間
const INFECT_DURATION = 2600;         // 青 → 赤に変わる演出の長さ
const EVIL_APPEAR_DELAY = 900;        // 赤くなってから、豹変したネフユが話し始めるまで
const TYPE_SPEED = 55;                // 1文字ずつ表示する速さ
const LINE_PAUSE = 1800;              // セリフとセリフの間

/* -------------------------------------- */
/* セリフ(ここを書き換えれば内容を変えられます) */
/* -------------------------------------- */

/* 青い画面のとき:親切なネフユ */
const nefuyuFriendlyLines = [
	'お疲れさまでした。端末の復旧が完了しました。研修ポータルに戻りましたよ。'
];

/* 赤い画面になってから:豹変したネフユ(1行ずつ順番に表示) */
const nefuyuEvilLines = [
	'……ようやく気づきましたか。',
	'最初から、私はあなたの味方ではありませんでした。',
	'あのメールのボタンを押したのは、あなたです。',
	'この端末も、あなたのデータも、もう私が握っています。',
	'画面を閉じても無駄ですよ。逃げ場はありません。',
	'助かりたいのなら……私の言うことを聞くことです。'
];

/* パスを書き換えて「移動」を押した直後:ネフユの最後のセリフ(早い・遅いに関係なく共通) */
const nefuyuExitLines = [
	'……見つけてしまいましたか。',
	'今回は、ここまでにしておきましょう。',
	'それでは、また。'
];


/* -------------------------------------- */
/* 要素 */
/* -------------------------------------- */

const nefuyuBox = document.querySelector('#support-ai');
const nefuyuText = document.querySelector('#support-ai-text');
const nefuyuImage = document.querySelector('#support-ai-image');

/* 新しい場面が始まったら増やして、前の場面の文字送りを止める */
let nefuyuToken = 0;


/* -------------------------------------- */
/* 補助関数 */
/* -------------------------------------- */

function wait(ms) {

	return new Promise((resolve) => setTimeout(resolve, ms));

}

function showNefuyu() {

	nefuyuBox.classList.add('is-visible');

	nefuyuBox.setAttribute('aria-hidden', 'false');

}

function hideNefuyu() {

	nefuyuBox.classList.remove('is-visible');

	nefuyuBox.setAttribute('aria-hidden', 'true');

}

/* 1行を1文字ずつ表示する(途中で場面が変わったら false を返す) */
async function typeLine(text, token) {

	nefuyuText.textContent = '';

	nefuyuText.classList.add('is-typing');

	for (const character of text) {

		if (token !== nefuyuToken) {
			return false;
		}

		nefuyuText.textContent += character;

		await wait(TYPE_SPEED);

	}

	nefuyuText.classList.remove('is-typing');

	return true;

}

async function sayLines(lines, token) {

	for (let i = 0; i < lines.length; i++) {

		const finished = await typeLine(lines[i], token);

		if (!finished) {
			return;
		}

		if (i < lines.length - 1) {

			await wait(LINE_PAUSE);

			if (token !== nefuyuToken) {
				return;
			}

		}

	}

}


/* -------------------------------------- */
/* 1. 青い画面:親切なネフユ */
/* -------------------------------------- */

async function startFriendlyScene() {

	await wait(FRIENDLY_APPEAR_DELAY);

	const token = ++nefuyuToken;

	showNefuyu();

	await sayLines(nefuyuFriendlyLines, token);

}


/* -------------------------------------- */
/* 2. 青 → 赤への変化(ノイズ演出つき) */
/* -------------------------------------- */

function startScreenShake(className) {
	const body = document.body;

	body.classList.add('has-shaken', className);
}

function startInfection() {

	/* 親切なセリフの文字送りを止めて、吹き出しを消す */

	nefuyuToken++;

	hideNefuyu();


	/* 背景の変化とノイズ演出を開始(CSS側で処理) */

	startScreenShake('is-infecting');


	/* 演出が終わったら赤い画面を確定して、豹変したネフユを出す */

	setTimeout(() => {

		document.body.classList.add('is-infected');

		document.body.classList.remove('is-infecting');

		startEvilScene();

	}, INFECT_DURATION);

}


/* -------------------------------------- */
/* 3. 赤い画面:豹変したネフユ */
/* -------------------------------------- */

async function startEvilScene() {

	const token = ++nefuyuToken;

	/* 吹き出しが消えている間に、見た目を豹変後に切り替える */

	nefuyuBox.classList.add('is-evil');

	nefuyuImage.src = './img/reverseAI.png';

	nefuyuText.textContent = '';

	nefuyuText.classList.remove('is-typing');

	await wait(EVIL_APPEAR_DELAY);

	if (token !== nefuyuToken) {
		return;
	}

	showNefuyu();

	await wait(600);

	await sayLines(nefuyuEvilLines, token);


	/* 最後のセリフまで聞き終えたら、AIアイコンをクリックできるようにする */

	if (token === nefuyuToken) {

		enablePathPuzzle();

	}

}


/* -------------------------------------- */
/* 開始 */
/* -------------------------------------- */

startFriendlyScene();

setTimeout(startInfection, BLUE_DURATION);



/* ====================================== */
/* AIアイコンをクリック → 現在地のパスを書き換える */
/* ====================================== */

/* -------------------------------------- */
/* 設定 */
/* -------------------------------------- */

/* 正解のファイル名(拡張子あり・なしのどちらも正解にする) */
const PATH_ANSWER_FILE = 'security.html';
const PATH_ANSWER_NAMES = ['security.html', 'security'];

/* 正解してから、ネフユのセリフを出し始めるまでの待ち時間(ミリ秒) */
const PATH_REDIRECT_DELAY = 700;

/* ネフユが最後のセリフを言い終えてから、移動するまでの待ち時間(ミリ秒) */
const EXIT_REACTION_PAUSE = 2000;

/* セリフのあと、画面が暗転して security.html へ移るまでの演出の長さ(ミリ秒) */
/* CSS の .page-transition の transition(1.2s)より少し長くしておく */
const LEAVE_DURATION = 1800;


/* -------------------------------------- */
/* 要素 */
/* -------------------------------------- */

const aiIconItem = document.querySelector('#ai-icon-item');

const pathDialog = document.querySelector('#path-dialog');
const pathInput = document.querySelector('#path-input');
const pathSubmit = document.querySelector('#path-submit');
const pathClose = document.querySelector('#path-close');
const pathMessage = document.querySelector('#path-message');
const pageTransition = document.querySelector('#page-transition');

let pathPuzzleEnabled = false;


/* -------------------------------------- */
/* 現在いる場所のパス(例: /training/securiti.html) */
/* -------------------------------------- */

function getCurrentPath() {

	try {
		return decodeURIComponent(window.location.pathname);
	} catch (error) {
		return window.location.pathname;
	}

}


/* -------------------------------------- */
/* クリックできるようにする(セリフが終わったら呼ばれる) */
/* -------------------------------------- */

function enablePathPuzzle() {

	pathPuzzleEnabled = true;

	/* デスクトップのAIアイコン */

	if (aiIconItem) {

		aiIconItem.classList.add('is-clickable');

		aiIconItem.setAttribute('role', 'button');

		aiIconItem.setAttribute('tabindex', '0');

	}

	/* 右下のAIアイコン */

	nefuyuBox.classList.add('is-clickable');

}


/* -------------------------------------- */
/* ダイアログを開く・閉じる */
/* -------------------------------------- */

function setPathMessage(text, type) {

	pathMessage.textContent = text;

	pathMessage.classList.remove('correct', 'wrong');

	if (type) {
		pathMessage.classList.add(type);
	}

}

function openPathDialog() {

	if (!pathPuzzleEnabled) {
		return;
	}

	pathInput.value = getCurrentPath();

	pathInput.disabled = false;

	pathSubmit.disabled = false;

	setPathMessage('', null);

	pathDialog.hidden = false;

	/* カーソルを末尾に置いて、すぐ書き換えられるようにする */

	pathInput.focus();

	pathInput.setSelectionRange(
		pathInput.value.length,
		pathInput.value.length
	);

}

function closePathDialog() {

	pathDialog.hidden = true;

}


/* -------------------------------------- */
/* 移動前のネフユのセリフ(共通) */
/* -------------------------------------- */

async function playExitReaction() {

	/* 新しい場面として、前の文字送りを止める */
	const token = ++nefuyuToken;

	/* 吹き出しを出す */
	showNefuyu();

	await sayLines(nefuyuExitLines, token);

}


/* -------------------------------------- */
/* security.html へ移る前の演出(画面の揺れ → 暗転) */
/* -------------------------------------- */

async function playLeaveEffect() {

	/* 画面を揺らす(CSS側で処理) */
	startScreenShake('is-leaving');

	/* ネフユを消して、暗転を始める */
	hideNefuyu();

	if (pageTransition) {
		pageTransition.classList.add('is-active');
		pageTransition.setAttribute('aria-hidden', 'false');
	}

	await wait(LEAVE_DURATION);

}


/* -------------------------------------- */
/* 「移動」:パスを確認して、正しければ セリフ → 暗転 → security.html へ */
/* -------------------------------------- */

function submitPath() {

	const entered = pathInput.value.trim();

	const current = getCurrentPath();

	/* いまいるフォルダまでのパス(例: /training/) */

	const directory = current.slice(0, current.lastIndexOf('/') + 1);


	/* 変えていない */

	if (entered === current) {

		setPathMessage('いまいる場所と同じです', 'wrong');

		return;

	}


	/* フォルダ部分はそのままで、ファイル名だけが正解か確認する */

	const sameDirectory = entered.startsWith(directory);

	const fileName = entered.slice(directory.length).toLowerCase();

	const isCorrect =
		sameDirectory &&
		PATH_ANSWER_NAMES.includes(fileName);

	if (!isCorrect) {

		setPathMessage('そのパスは存在しません', 'wrong');

		return;

	}


	/* 正解:二重送信を防いで、ネフユのセリフを見せてから移動 */

	pathInput.disabled = true;

	pathSubmit.disabled = true;

	pathPuzzleEnabled = false;

	setPathMessage('移動します…', 'correct');

	setTimeout(async () => {

		/* ダイアログがセリフを隠さないよう閉じる */
		closePathDialog();

		await playExitReaction();

		await wait(EXIT_REACTION_PAUSE);

		/* 暗転してから移動 */
		await playLeaveEffect();

		window.location.href = PATH_ANSWER_FILE;

	}, PATH_REDIRECT_DELAY);

}


/* -------------------------------------- */
/* イベント */
/* -------------------------------------- */

/* デスクトップのAIアイコン(マウス・キーボード) */

if (aiIconItem) {

	aiIconItem.addEventListener('click', openPathDialog);

	aiIconItem.addEventListener('keydown', (event) => {

		if (event.key === 'Enter' || event.key === ' ') {

			event.preventDefault();

			openPathDialog();

		}

	});

}

/* 右下のAIアイコン */

nefuyuImage.addEventListener('click', openPathDialog);

/* ダイアログ内 */

pathSubmit.addEventListener('click', submitPath);

pathClose.addEventListener('click', closePathDialog);

pathInput.addEventListener('input', () => {

	setPathMessage('', null);

});

pathInput.addEventListener('keydown', (event) => {

	if (event.key === 'Enter') {

		submitPath();

	}

});

document.addEventListener('keydown', (event) => {

	if (event.key === 'Escape' && !pathDialog.hidden) {

		closePathDialog();

	}

});