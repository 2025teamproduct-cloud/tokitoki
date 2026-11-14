// taskbar.js  ※ script.js より後に読み込む(どちらも defer のまま、この順で並べる)
(() => {
	const startButton = document.querySelector('#start-button');
	const startMenu = document.querySelector('#start-menu');
	const startNote = document.querySelector('#start-menu-note');
	const japanDate = document.querySelector('#japan-date');

	const trainingButton = document.querySelector('#taskbar-app-training');
	const mailButton = document.querySelector('#taskbar-app-mail');

	if (!startButton || !startMenu) {
		return;
	}

	const NOTE_DEFAULT = 'SECURITY TRAINING';
	const NOTE_UNAVAILABLE = 'このアプリは現在利用できません';
	const NOTE_DURATION = 2000;


	/* -------------------------------------- */
	/* 日付表示(時刻は script.js が #japan-time を更新する) */
	/* -------------------------------------- */

	function updateJapanDate() {

		if (!japanDate) {
			return;
		}

		japanDate.textContent = new Intl.DateTimeFormat('ja-JP', {
			timeZone: 'Asia/Tokyo',
			month: 'numeric',
			day: 'numeric',
			weekday: 'short'
		}).format(new Date());

	}

	updateJapanDate();
	setInterval(updateJapanDate, 60000);


	/* -------------------------------------- */
	/* スタートメニューの開閉 */
	/* -------------------------------------- */

	function isMenuOpen() {

		return startMenu.classList.contains('is-open');

	}

	function openMenu() {

		startMenu.classList.add('is-open');

		startMenu.setAttribute('aria-hidden', 'false');

		startButton.setAttribute('aria-expanded', 'true');

	}

	function closeMenu() {

		startMenu.classList.remove('is-open');

		startMenu.setAttribute('aria-hidden', 'true');

		startButton.setAttribute('aria-expanded', 'false');

		resetNote();

	}

	startButton.addEventListener('click', (event) => {

		/* document の click(外側クリックで閉じる処理)に渡さない */
		event.stopPropagation();

		if (isMenuOpen()) {
			closeMenu();
		} else {
			openMenu();
		}

	});

	/* メニューの外をクリックしたら閉じる */
	document.addEventListener('click', (event) => {

		if (!isMenuOpen()) {
			return;
		}

		if (startMenu.contains(event.target) || startButton.contains(event.target)) {
			return;
		}

		closeMenu();

	});

	/* Esc で閉じて、ボタンにフォーカスを戻す */
	document.addEventListener('keydown', (event) => {

		if (event.key === 'Escape' && isMenuOpen()) {

			closeMenu();

			startButton.focus();

		}

	});


	/* -------------------------------------- */
	/* メニュー下部の一時メッセージ */
	/* -------------------------------------- */

	let noteTimer = null;

	function resetNote() {

		clearTimeout(noteTimer);

		if (startNote) {
			startNote.textContent = NOTE_DEFAULT;
			startNote.classList.remove('is-warning');
		}

	}

	function showNote(text) {

		if (!startNote) {
			return;
		}

		clearTimeout(noteTimer);

		startNote.textContent = text;
		startNote.classList.add('is-warning');

		noteTimer = setTimeout(resetNote, NOTE_DURATION);

	}


	/* -------------------------------------- */
	/* メールウィンドウの開閉(script.js 側の要素を利用) */
	/* -------------------------------------- */

	function hasMailWindow() {

		return typeof mailWindow !== 'undefined'
			&& typeof windowOverlay !== 'undefined'
			&& mailWindow
			&& windowOverlay;

	}

	function openMailWindow() {

		if (!hasMailWindow()) {
			return;
		}

		mailWindow.classList.add('is-open');

		windowOverlay.classList.add('is-open');

		mailWindow.setAttribute('aria-hidden', 'false');

	}

	function closeMailWindow() {

		if (typeof closeMail === 'function') {
			closeMail();
		}

	}


	/* -------------------------------------- */
	/* スタートメニューの項目 */
	/* -------------------------------------- */

	startMenu.querySelectorAll('.start-menu-item').forEach((item) => {

		item.addEventListener('click', () => {

			const action = item.dataset.action;

			if (action === 'mail' && hasMailWindow()) {

				closeMenu();

				openMailWindow();

				return;

			}

			/* まだ中身のないアプリ */

			showNote(NOTE_UNAVAILABLE);

		});

	});


	/* -------------------------------------- */
	/* タスクバーのウィンドウボタン */
	/* -------------------------------------- */

	/* メールボタン:押すたびに 開く ⇔ 最小化(閉じる) */

	if (mailButton) {

		mailButton.addEventListener('click', () => {

			if (!hasMailWindow()) {
				return;
			}

			if (mailWindow.classList.contains('is-open')) {
				closeMailWindow();
			} else {
				openMailWindow();
			}

		});

	}

	/* 研修ウィンドウ(常時表示):メールが開いている間は背面になる */

	function syncAppButtons() {

		if (!hasMailWindow() || !mailButton) {
			return;
		}

		const mailOpen = mailWindow.classList.contains('is-open');

		/* メールウィンドウを開いている間だけ、タスクバーに出す */

		if (mailOpen && mailButton.hidden) {

			mailButton.hidden = false;

			mailButton.classList.add('is-entering');

			setTimeout(() => mailButton.classList.remove('is-entering'), 300);

		}

		if (!mailOpen) {
			mailButton.hidden = true;
		}

		mailButton.classList.toggle('is-active', mailOpen);
		mailButton.setAttribute('aria-pressed', String(mailOpen));

		if (trainingButton) {
			trainingButton.classList.toggle('is-active', !mailOpen);
			trainingButton.setAttribute('aria-pressed', String(!mailOpen));
		}

	}

	if (hasMailWindow()) {

		/* is-open クラスの付け外しを監視して、ボタンの状態を合わせる */

		new MutationObserver(syncAppButtons).observe(mailWindow, {
			attributes: true,
			attributeFilter: ['class']
		});

		syncAppButtons();

	}

})();