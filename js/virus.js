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

		}

	}, 60);