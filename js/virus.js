/* ====================================== */
/* 日本時間 */
/* ====================================== */

const japanTime =
	document.querySelector('#japan-time');


function updateJapanTime() {

	const now = new Date();

	const formatter =
		new Intl.DateTimeFormat('ja-JP', {

			timeZone: 'Asia/Tokyo',

			hour: '2-digit',

			minute: '2-digit',

			hour12: false

		});


	japanTime.textContent =
		formatter.format(now);

}


updateJapanTime();

setInterval(
	updateJapanTime,
	60000
);


/* ====================================== */
/* ウイルス警告ウインドウ */
/* ====================================== */

const virusWindows =
	document.querySelector('#virus-windows');


/* -------------------------------------- */
/* ウィンドウ生成 */
/* -------------------------------------- */

function createVirusWindows() {

	virusWindows.innerHTML = '';


	/*
	 * 大量に表示するウィンドウ数
	 */

	const windowCount = 60;


	for (
		let i = 0;
		i < windowCount;
		i++
	) {

		createVirusWindow(i);

	}

}


/* ====================================== */
/* ウイルス警告ウインドウ1個 */
/* ====================================== */

function createVirusWindow(index) {

	const windowElement =
		document.createElement('div');


	windowElement.className =
		'virus-window';


	/* -------------------------------------- */
	/* ウインドウ位置 */
	/* -------------------------------------- */

	const windowWidth = 190;
	const windowHeight = 90;


	/*
	 * 1個ごとに斜め下へ進む距離
	 */

	const offsetX = 60;
	const offsetY = 45;


	/*
	 * 最下部から上部へ戻ったときの位置
	 */

	const resetOffsetX = 300;
	const resetOffsetY = 40;


	/*
	 * 画面サイズ
	 */

	const screenWidth =
		window.innerWidth;


	/*
	 * タスクバーを取得
	 */

	const taskbar =
		document.querySelector('.taskbar');


	/*
	 * タスクバーの位置を取得
	 */

	const taskbarRect =
		taskbar.getBoundingClientRect();


	/*
	 * ウイルスウインドウを
	 * 表示できる最上部
	 */

	const topLimit = 40;


	/*
	 * ウイルスウインドウを
	 * 表示できる最下部
	 *
	 * タスクバーに接触する直前
	 */

	const bottomLimit =
		taskbarRect.top -
		windowHeight -
		10;


	/*
	 * ウインドウを配置できる高さ
	 */

	const availableHeight =
		Math.max(
			windowHeight,
			bottomLimit - topLimit
		);


	/*
	 * ウインドウを配置できる横幅
	 */

	const availableWidth =
		Math.max(
			windowWidth,
			screenWidth - windowWidth - 20
		);


	/* -------------------------------------- */
	/* 何周目かを計算 */
	/* -------------------------------------- */

	const distanceY =
		index * offsetY;


	const cycle =
		Math.floor(
			distanceY / availableHeight
		);


	/* -------------------------------------- */
	/* 右下・左下をランダムに決定 */
	/* -------------------------------------- */

	/*
	 * 1周目ごとにランダムで方向を決定
	 *
	 *  1  = 右下
	 * -1  = 左下
	 */

	const direction =
		Math.random() < 0.5
			? 1
			: -1;


	/* -------------------------------------- */
	/* その周回の位置 */
	/* -------------------------------------- */

	const localX =
		(
			index * offsetX
		) %
		availableWidth;


	const localY =
		(
			index * offsetY
		) %
		availableHeight;


	/* -------------------------------------- */
	/* X位置 */
	/* -------------------------------------- */

	let x;


	if (direction === 1) {

		/*
		 * 右下方向
		 */

		x =
			20 +
			(cycle * resetOffsetX) +
			localX;

	} else {

		/*
		 * 左下方向
		 */

		x =
			screenWidth -
			windowWidth -
			20 -
			(cycle * resetOffsetX) -
			localX;

	}


	/* -------------------------------------- */
	/* X位置が画面外に出ないようにする */
	/* -------------------------------------- */

	x =
		Math.max(
			0,
			Math.min(
				x,
				screenWidth - windowWidth
			)
		);


	/* -------------------------------------- */
	/* Y位置 */
	/* -------------------------------------- */

	const y =
		topLimit +
		(cycle * resetOffsetY) +
		localY;


	/* -------------------------------------- */
	/* 位置を設定 */
	/* -------------------------------------- */

	windowElement.style.left =
		`${x}px`;

	windowElement.style.top =
		`${y}px`;


	/* -------------------------------------- */
	/* ランダム幅 */
	/* -------------------------------------- */

	const width =
		150 +
		Math.floor(
			Math.random() * 100
		);


	windowElement.style.width =
		`${width}px`;


	/* -------------------------------------- */
	/* 警告メッセージ */
	/* -------------------------------------- */

	const messages = [

		'⚠ ウイルスを検知',

		'⚠ system error',

		'⚠ ウイルスを1件検出',

		'⚠ セキュリティ警告',

		'⚠ 不正なプログラムを検出',

		'⚠ ファイルへのアクセスに失敗しました',

		'⚠ システムに異常が発生しました',

		'⚠ Security Error',

		'⚠ Threat Detected',

		'⚠ ウイルスを駆除できません',

		'⚠ 不正なアクセスを検知',

		'⚠ システム保護機能が停止しました'

	];


	const message =
		messages[
			Math.floor(
				Math.random() *
				messages.length
			)
		];


	/* -------------------------------------- */
	/* ウィンドウHTML */
	/* -------------------------------------- */

	windowElement.innerHTML = `

		<div class="virus-window-titlebar">

			<div class="virus-window-title">

				<span>⚠</span>

				<span>
					system error
				</span>

			</div>


			<button
				type="button"
				class="virus-window-close"
			>
				✕
			</button>

		</div>


		<div class="virus-window-body">

			<p>
				${message}
			</p>

			<p>
				⚠ ウイルスを1件検出
			</p>

		</div>

	`;


	/* -------------------------------------- */
	/* 閉じるボタン */
	/* -------------------------------------- */

	const closeButton =
		windowElement.querySelector(
			'.virus-window-close'
		);


	closeButton.addEventListener(
		'click',
		() => {

			windowElement.remove();

		}
	);


	/* -------------------------------------- */
	/* 表示タイミング */
	/* -------------------------------------- */

	windowElement.style.animationDelay =
		`${index * 0.04}s`;


	virusWindows.appendChild(
		windowElement
	);

}


/* ====================================== */
/* 開始 */
/* ====================================== */

/*
 * 最初は何も表示しない
 */

virusWindows.innerHTML = '';


/*
 * 少し時間が経ってから
 * 1個ずつウイルス警告を表示
 */

let virusWindowIndex = 0;


const virusWindowTimer =
	setInterval(() => {

		createVirusWindow(
			virusWindowIndex
		);

		virusWindowIndex++;


		/*
		 * 60個表示したら停止
		 */

		if (virusWindowIndex >= 60) {

			clearInterval(
				virusWindowTimer
			);

			setTimeout(() => {
				const supportAi = document.querySelector('#support-ai');
				if (supportAi) {
					supportAi.classList.add('is-visible');
					supportAi.setAttribute('aria-hidden', 'false');
					supportAi.style.cursor = 'pointer';
				}
			}, 5000);

		}

	}, 60);


/* ====================================== */
/* AI吹き出しから問題表示へ */
/* ====================================== */

const QUIZ_STORAGE_KEY = 'virus-quiz-session';
const quizOverlay = document.querySelector('#quiz-overlay');
const quizGrid = document.querySelector('#quiz-grid');
const quizClose = document.querySelector('#quiz-close');
const supportAi = document.querySelector('#support-ai');

const quizQuestions = [
	{
		id: 0,
		formula: 'VIRUS = 22 - 9 - 18 - 21 - 19',
		answer: '613533'
	},
	{
		id: 1,
		formula: 'SCAN = 17 - 8 - 12 - 20 - 4',
		answer: '914281'
	},
	{
		id: 2,
		formula: 'ALERT = 5 - 14 - 18 - 27 - 2',
		answer: '731268'
	},
	{
		id: 3,
		formula: 'TOKEN = 3 - 18 - 22 - 20 - 15',
		answer: '819934'
	},
	{
		id: 4,
		formula: 'SYSTEM = 18 - 19 - 19 - 20 - 5 - 13',
		answer: '452813'
	}
];

function loadQuizState() {
	try {
		return JSON.parse(sessionStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
	} catch (error) {
		return {};
	}
}

function saveQuizState(state) {
	sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(state));
}

function getCurrentQuizState() {
	return loadQuizState();
}

function openQuiz() {
	if (!quizOverlay) return;
	quizOverlay.classList.add('is-visible');
	quizOverlay.setAttribute('aria-hidden', 'false');
}

function closeQuiz() {
	if (!quizOverlay) return;
	quizOverlay.classList.remove('is-visible');
	quizOverlay.setAttribute('aria-hidden', 'true');
}

function createQuizCard(question) {
	const article = document.createElement('article');
	article.className = 'quiz-card';
	article.dataset.index = String(question.id);

	const storedState = getCurrentQuizState()[question.id] || {};
	const answered = Boolean(storedState.answered);
	const correct = Boolean(storedState.correct);
	const submittedAnswer = storedState.answer || '';

	article.innerHTML = `
		<div class="quiz-card-header">
			<div class="quiz-card-icons" aria-hidden="true">
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>
			<h3>問題文</h3>
		</div>

		<p class="quiz-formula">${question.formula}</p>
		<div class="quiz-input-row">
			<input type="text" maxlength="1" inputmode="numeric" aria-label="問題${question.id + 1}の1文字目">
			<input type="text" maxlength="1" inputmode="numeric" aria-label="問題${question.id + 1}の2文字目">
			<input type="text" maxlength="1" inputmode="numeric" aria-label="問題${question.id + 1}の3文字目">
			<input type="text" maxlength="1" inputmode="numeric" aria-label="問題${question.id + 1}の4文字目">
			<input type="text" maxlength="1" inputmode="numeric" aria-label="問題${question.id + 1}の5文字目">
			<input type="text" maxlength="1" inputmode="numeric" aria-label="問題${question.id + 1}の6文字目">
		</div>
		<div class="quiz-actions">
			<button type="button" class="quiz-submit">決定</button>
			<p class="quiz-result" aria-live="polite">${answered ? (correct ? '正解' : '不正解') : ''}</p>
		</div>
	`;

	if (answered) {
		article.classList.add(correct ? 'is-correct' : 'is-wrong');
		const result = article.querySelector('.quiz-result');
		result.classList.add(correct ? 'is-correct' : 'is-wrong');
		result.textContent = correct ? '正解' : '不正解';
	}

	const inputs = article.querySelectorAll('input');
	if (answered) {
		inputs.forEach((input, index) => {
			input.disabled = true;
			input.value = submittedAnswer[index] || '';
		});
	}

	const submitBtn = article.querySelector('.quiz-submit');
	const result = article.querySelector('.quiz-result');

	inputs.forEach((input, index) => {
		input.addEventListener('input', () => {
			input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
			if (input.value && index < inputs.length - 1) {
				inputs[index + 1].focus();
			}
		});

		input.addEventListener('keydown', (event) => {
			if (event.key === 'Backspace' && !input.value && index > 0) {
				inputs[index - 1].focus();
			}
		});
	});

	submitBtn.addEventListener('click', () => {
		if (answered) return;

		const answerValue = [...inputs].map((item) => item.value || '').join('');
		const isCorrect = answerValue === question.answer;
		const newState = getCurrentQuizState();
		newState[question.id] = {
			answered: true,
			correct: isCorrect,
			answer: answerValue
		};
		saveQuizState(newState);

		inputs.forEach((input) => {
			input.disabled = true;
		});
		submitBtn.disabled = true;
		result.textContent = isCorrect ? '正解' : '不正解';
		result.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
		article.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
	});

	return article;
}

function renderQuiz() {
	if (!quizGrid) return;
	quizGrid.innerHTML = '';
	quizQuestions.forEach((question) => {
		quizGrid.appendChild(createQuizCard(question));
	});
}

if (supportAi) {
	supportAi.addEventListener('click', openQuiz);
	supportAi.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openQuiz();
		}
	});
}

if (quizClose) {
	quizClose.addEventListener('click', closeQuiz);
}

if (quizOverlay) {
	quizOverlay.addEventListener('click', (event) => {
		if (event.target === quizOverlay) {
			closeQuiz();
		}
	});
}

renderQuiz();