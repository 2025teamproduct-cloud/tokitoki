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

    if (japanTime) {
        japanTime.textContent = formatJapanTime(now);
        japanTime.dateTime = now.toISOString();
    }
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

const closeMailWindow = document.querySelector('#close-mail-window');
const minimizeBtn = document.querySelector('#minimize-btn');
const maximizeBtn = document.querySelector('#maximize-btn');


/* -------------------------------------- */
/* メール通知をクリック */
/* -------------------------------------- */

if (mailNotification && mailWindow && windowOverlay) {
    mailNotification.addEventListener('click', () => {
        mailWindow.classList.add('is-open');
        windowOverlay.classList.add('is-open');

        mailWindow.setAttribute('aria-hidden', 'false');
    });
}


/* -------------------------------------- */
/* メールウィンドウを閉じる */
/* -------------------------------------- */

function closeMail() {
    if (!mailWindow || !windowOverlay) {
        return;
    }

    mailWindow.classList.remove('is-open');
    windowOverlay.classList.remove('is-open');

    mailWindow.setAttribute('aria-hidden', 'true');
}


/* -------------------------------------- */
/* 閉じるボタン */
/* -------------------------------------- */

if (closeMailWindow) {
    closeMailWindow.addEventListener('click', () => {
        closeMail();
    });
}


/* -------------------------------------- */
/* 背景クリックで閉じる */
/* -------------------------------------- */

if (windowOverlay) {
    windowOverlay.addEventListener('click', () => {
        closeMail();
    });
}


/* -------------------------------------- */
/* 最小化 */
/* -------------------------------------- */

if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
        closeMail();
    });
}


/* -------------------------------------- */
/* 最大化 */
/* -------------------------------------- */

let isMaximized = false;

if (maximizeBtn && mailWindow) {
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
}


/* -------------------------------------- */
/* 詳細説明.txt（メモ帳風ウィンドウ） */
/* -------------------------------------- */

const detailLink = document.querySelector('#detail-link');
const textFileWindow = document.querySelector('#text-file-window');
const textFileOverlay = document.querySelector('#text-file-overlay');
const closeTextFileBtn = document.querySelector('#close-text-file');


/* -------------------------------------- */
/* 詳細説明.txtを開く */
/* -------------------------------------- */

function openTextFile() {
    if (!textFileWindow || !textFileOverlay) {
        return;
    }

    textFileWindow.classList.add('is-open');
    textFileOverlay.classList.add('is-open');

    textFileWindow.setAttribute('aria-hidden', 'false');
    textFileOverlay.setAttribute('aria-hidden', 'false');

    if (closeTextFileBtn) {
        closeTextFileBtn.focus();
    }
}

if (detailLink) {
    detailLink.addEventListener('click', () => {
        openTextFile();
    });
}


/* -------------------------------------- */
/* 詳細説明.txtを閉じる */
/* -------------------------------------- */

function closeTextFile() {
    if (!textFileWindow || !textFileOverlay) {
        return;
    }

    textFileWindow.classList.remove('is-open');
    textFileOverlay.classList.remove('is-open');

    textFileWindow.setAttribute('aria-hidden', 'true');
    textFileOverlay.setAttribute('aria-hidden', 'true');
}

if (closeTextFileBtn) {
    closeTextFileBtn.addEventListener('click', () => {
        closeTextFile();
    });
}


/* -------------------------------------- */
/* 詳細説明.txtの背景クリックで閉じる */
/* -------------------------------------- */

if (textFileOverlay) {
    textFileOverlay.addEventListener('click', () => {
        closeTextFile();
    });
}


/* -------------------------------------- */
/* Escキーで開いているウィンドウを閉じる */
/* -------------------------------------- */

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (textFileWindow && textFileWindow.classList.contains('is-open')) {
            closeTextFile();
        } else if (mailWindow && mailWindow.classList.contains('is-open')) {
            closeMail();
        }
    }
});
