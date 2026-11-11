/* ====================================== */
/* 日本時間 */
/* ====================================== */

const japanTime = document.querySelector('#japan-time');

function updateJapanTime() {
	if (!japanTime) return;

	const formatter = new Intl.DateTimeFormat('ja-JP', {
		timeZone: 'Asia/Tokyo',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});

	japanTime.textContent = formatter.format(new Date());
}

updateJapanTime();
setInterval(updateJapanTime, 60000);


/* ====================================== */
/* ウイルス警告ウインドウ */
/* ====================================== */

const virusWindows = document.querySelector('#virus-windows');

/* ---------- 設定(ここを変えると演出が変わる) ---------- */

/*
 * 画面の広さから個数を決める(30〜70個)
 */
const TOTAL = Math.min(
	70,
	Math.max(30, Math.round((window.innerWidth * window.innerHeight) / 25000))
);

/*
 * 3段階で悪化していく
 *   ratio    : 全体のうち何割をこの段階で出すか
 *   interval : 1個出すまでの間隔(ms)
 *   mode     : cascade = 左上から斜めに重ねる / scatter = ランダムに散らす
 *   shake    : true なら震えるウインドウにする
 */
const PHASES = [
	{ ratio: 0.15, interval: 450, mode: 'cascade', shake: false },
	{ ratio: 0.45, interval: 160, mode: 'scatter', shake: false },
	{ ratio: 0.40, interval: 50,  mode: 'scatter', shake: true  }
];

/* 全部出てからサポートAIが出るまでの時間(ms) */
const AI_DELAY = 5000;

/* ウインドウの大きさ(配置計算用) */
const WIN_MIN_WIDTH = 170;
const WIN_MAX_WIDTH = 260;
const WIN_HEIGHT = 110;

/* カスケード1段ごとのずれ */
const CASCADE_STEP_X = 34;
const CASCADE_STEP_Y = 30;

const TOP_LIMIT = 40;


/* ---------- メッセージ ---------- */

const ERROR_TITLES = [
	'system error',
	'Security Error',
	'Threat Detected',
	'セキュリティ警告'
];

const MESSAGES = [
	'ウイルスを検知',
	'ウイルスを1件検出',
	'不正なプログラムを検出',
	'ファイルへのアクセスに失敗しました',
	'システムに異常が発生しました',
	'ウイルスを駆除できません',
	'不正なアクセスを検知',
	'システム保護機能が停止しました'
];

/*
 * エラーコードは 0x800 + ランダムな5桁(16進数)
 * 例: 0x8003A7F2
 */
function randomErrorCode() {
	const random = Math.floor(Math.random() * 0x100000)
		.toString(16)
		.toUpperCase()
		.padStart(5, '0');

	return `0x800${random}`;
}

/*
 * 文字列、または呼び出すたびに文字列を返す関数を入れる
 */
const SUB_MESSAGES = [
	() => `エラーコード: ${randomErrorCode()}`,
	() => `エラーコード: ${randomErrorCode()}`,
	'この画面を閉じないでください',
	'ファイルが破損している可能性があります',
	'ネットワークへの接続を確認しています',
	'感染範囲を調査中…'
];

function pick(list) {
	return list[Math.floor(Math.random() * list.length)];
}

function pickSubMessage() {
	const item = pick(SUB_MESSAGES);
	return typeof item === 'function' ? item() : item;
}

function randomBetween(min, max) {
	return min + Math.random() * (max - min);
}


/* ---------- 配置範囲 ---------- */

function getBounds() {
	const taskbar = document.querySelector('.taskbar');
	const taskbarTop = taskbar
		? taskbar.getBoundingClientRect().top
		: window.innerHeight - 42;

	return {
		minX: 0,
		maxX: Math.max(0, window.innerWidth - WIN_MAX_WIDTH),
		minY: TOP_LIMIT,
		maxY: Math.max(TOP_LIMIT, taskbarTop - WIN_HEIGHT - 10)
	};
}

/*
 * カスケード: 左上から斜めに並べる。
 * 下か右にはみ出したら、少し右にずらして上からやり直す。
 */
function cascadePosition(step, bounds) {
	const rows = Math.max(
		1,
		Math.floor((bounds.maxY - bounds.minY) / CASCADE_STEP_Y)
	);

	const column = Math.floor(step / rows);
	const row = step % rows;

	return {
		x: Math.min(bounds.maxX, 30 + column * 140 + row * CASCADE_STEP_X),
		y: bounds.minY + row * CASCADE_STEP_Y
	};
}

function scatterPosition(bounds) {
	return {
		x: randomBetween(bounds.minX, bounds.maxX),
		y: randomBetween(bounds.minY, bounds.maxY)
	};
}


/* ---------- ウインドウ1個 ---------- */

let zCounter = 0;

function createVirusWindow(position, shake) {
	const el = document.createElement('div');

	/*
	 * 種類: error(赤) / warning(黄)
	 * 3割は進捗バー付き
	 */
	const isWarning = Math.random() < 0.35;
	const hasProgress = Math.random() < 0.3;

	el.className = 'virus-window';
	el.classList.add(isWarning ? 'is-warning' : 'is-error');
	if (hasProgress) el.classList.add('has-progress');
	if (shake) el.classList.add('is-shaking');

	el.style.left = `${position.x}px`;
	el.style.top = `${position.y}px`;
	el.style.width = `${Math.round(randomBetween(WIN_MIN_WIDTH, WIN_MAX_WIDTH))}px`;
	el.style.zIndex = String(++zCounter);

	const title = isWarning ? 'Warning' : pick(ERROR_TITLES);

	el.innerHTML = `
		<div class="virus-window-titlebar">
			<div class="virus-window-title">
				<span>⚠</span>
				<span>${title}</span>
			</div>
			<button type="button" class="virus-window-close" aria-label="閉じる">✕</button>
		</div>
		<div class="virus-window-body">
			<p class="virus-window-main">${pick(MESSAGES)}</p>
			<p class="virus-window-sub">${pickSubMessage()}</p>
			${hasProgress ? '<div class="virus-window-progress"><span></span></div>' : ''}
		</div>
	`;

	el.querySelector('.virus-window-close').addEventListener('click', () => {
		el.remove();
	});

	virusWindows.appendChild(el);
}


/* ---------- 段階ごとの進行 ---------- */

function showSupportAi() {
	const supportAi = document.querySelector('#support-ai');
	if (!supportAi) return;

	supportAi.classList.add('is-visible');
	supportAi.setAttribute('aria-hidden', 'false');
}

function runVirusWindows() {
	virusWindows.innerHTML = '';

	const bounds = getBounds();

	/*
	 * 段階ごとの個数を決める(合計が TOTAL になるよう最後で調整)
	 */
	const counts = PHASES.map((phase) => Math.round(TOTAL * phase.ratio));
	const used = counts.slice(0, -1).reduce((sum, n) => sum + n, 0);
	counts[counts.length - 1] = Math.max(0, TOTAL - used);

	let phaseIndex = 0;
	let shownInPhase = 0;
	let cascadeStep = 0;

	function next() {
		/* 空の段階は飛ばす */
		while (phaseIndex < PHASES.length && shownInPhase >= counts[phaseIndex]) {
			phaseIndex++;
			shownInPhase = 0;
		}

		if (phaseIndex >= PHASES.length) {
			setTimeout(showSupportAi, AI_DELAY);
			return;
		}

		const phase = PHASES[phaseIndex];

		const position =
			phase.mode === 'cascade'
				? cascadePosition(cascadeStep++, bounds)
				: scatterPosition(bounds);

		createVirusWindow(position, phase.shake);
		shownInPhase++;

		setTimeout(next, phase.interval);
	}

	/* 赤い画面を見せてから始める */
	setTimeout(next, 800);
}

if (virusWindows) {
	runVirusWindows();
}


/* ====================================== */
/* サポートAIをクリックして質問ページへ */
/* ====================================== */

const aiTrigger = document.querySelector('#ai-trigger');

if (aiTrigger) {
	const goToQuestion = () => {
		window.location.href = 'virus_question.html';
	};

	aiTrigger.addEventListener('click', goToQuestion);
	aiTrigger.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			goToQuestion();
		}
	});
}