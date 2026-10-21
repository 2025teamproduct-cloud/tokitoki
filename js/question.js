document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'security-quiz-session';

    const cards = Array.from(document.querySelectorAll('.question-card'));
    const folderButtons = Array.from(document.querySelectorAll('.folder-item'));
    const stage = document.querySelector('.question-stage');
    const questionTime = document.querySelector('#question-time');
    const answerFeedbackTemplate = document.querySelector('#answer-feedback-template');

    /* ====================================== */
    /* exe による問題07以降のロック解除 */
    /* ====================================== */

    const UNLOCK_KEY = 'security-quiz-unlocked';
    const UNLOCK_CODE = '123456';      // ← 本番のコードに変更してください
    const LOCKED_FROM_INDEX = 6;       // 問題07(index 6)以降をロック

    const exeIcon = document.querySelector('#exe-icon');
    const unlockDialog = document.querySelector('#unlock-dialog');
    const unlockInput = document.querySelector('#unlock-input');
    const unlockSubmit = document.querySelector('#unlock-submit');
    const unlockClose = document.querySelector('#unlock-close');
    const unlockMessage = document.querySelector('#unlock-message');

    function isUnlocked() {
        try {
            return sessionStorage.getItem(UNLOCK_KEY) === '1';
        } catch (error) {
            return false;
        }
    }

    function setUnlocked() {
        try {
            sessionStorage.setItem(UNLOCK_KEY, '1');
        } catch (error) {
            // 保存できない環境では、リロードするとロックに戻る
        }
    }

    function isAvailable(index) {
        return index < LOCKED_FROM_INDEX || isUnlocked();
    }

    function applyLockState() {
        const unlocked = isUnlocked();

        folderButtons.forEach((button) => {
            const locked = Number(button.dataset.index) >= LOCKED_FROM_INDEX && !unlocked;
            button.classList.toggle('is-locked', locked);
        });

        if (exeIcon) {
            exeIcon.classList.toggle('is-solved', unlocked);
        }
    }

    function openUnlockDialog() {
        if (isUnlocked() || !unlockDialog) {
            return;
        }

        // 問題カードを閉じる
        if (stage) {
            stage.classList.remove('has-active');
        }

        folderButtons.forEach((button) => {
            button.classList.remove('is-active');
            button.setAttribute('aria-pressed', 'false');
        });

        unlockInput.value = '';
        unlockMessage.textContent = '';
        unlockMessage.classList.remove('correct', 'wrong');
        unlockDialog.hidden = false;
        unlockInput.focus();
    }

    function showUnlockMessage(text) {
        unlockMessage.textContent = text;
        unlockMessage.classList.remove('correct');
        unlockMessage.classList.add('wrong');
    }

    function submitUnlock() {
        const value = unlockInput.value;

        if (value.length !== 6) {
            showUnlockMessage('6桁の数字を入力してください');
            return;
        }

        if (value !== UNLOCK_CODE) {
            showUnlockMessage('不正解');
            return;
        }

        setUnlocked();
        applyLockState();
        unlockDialog.hidden = true;
        openQuestion(LOCKED_FROM_INDEX);   // 問題07を開く
    }


    /* ====================================== */
    /* 日本時間表示 */
    /* ====================================== */

    function formatJapanTime(date) {
        return new Intl.DateTimeFormat('ja-JP', {
            timeZone: 'Asia/Tokyo',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    }

    function updateQuestionTime() {
        if (questionTime) {
            questionTime.textContent = formatJapanTime(new Date());
        }
    }

    updateQuestionTime();
    setInterval(updateQuestionTime, 60000);


    /* ====================================== */
    /* セッション状態の読み込み・保存 */
    /* ====================================== */

    function loadSessionState() {
        try {
            return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
        } catch (error) {
            return {};
        }
    }

    function saveSessionState(state) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function showAnswerFeed(card) {
        if (!answerFeedbackTemplate || card.querySelector('.answer-feed')) {
            return;
        }

        const feed = answerFeedbackTemplate.content.firstElementChild.cloneNode(true);
        const explanation = feed.querySelector('p');
        const answerRow = card.querySelector('.answer-row');

        if (explanation) {
            explanation.textContent = card.dataset.explanation || '';
        }

        if (answerRow) {
            card.insertBefore(feed, answerRow);
        }
    }


    /* ====================================== */
    /* 入力欄の状態を同期 */
    /* ====================================== */

    function syncInputState() {
        cards.forEach((card) => {
            const inputs = Array.from(card.querySelectorAll('.answer-input'));
            const isSolved = card.classList.contains('is-solved');

            inputs.forEach((input) => {
                // 未回答なら入力可能。回答済み(正解)の場合のみ disabled にする
                input.disabled = isSolved;
            });
        });
    }


    /* ====================================== */
    /* 問題を開く */
    /* ====================================== */

    function openQuestion(index) {
        // ロック中の問題は開かない
        if (!isAvailable(index)) {
            return;
        }

        // コード入力ダイアログが開いていれば閉じる
        if (unlockDialog) {
            unlockDialog.hidden = true;
        }

        cards.forEach((card) => {
            const isActive = Number(card.dataset.index) === index;
            card.classList.toggle('active', isActive);
            card.setAttribute('aria-hidden', String(!isActive));
        });

        folderButtons.forEach((button) => {
            const isActive = Number(button.dataset.index) === index;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        syncInputState();

        if (stage) {
            stage.classList.add('has-active');
        }
    }


    /* ====================================== */
    /* フォルダの回答済み状態を更新 */
    /* ====================================== */

    function updateFolderStates() {
        const state = loadSessionState();

        folderButtons.forEach((button) => {
            const index = Number(button.dataset.index);
            const solved = Boolean(
                state[index] &&
                state[index].answered &&
                state[index].correct
            );

            button.classList.toggle('is-solved', solved);
        });
    }


    /* ====================================== */
    /* 回答結果をカードに反映 */
    /* ====================================== */

    function setCardState(card, values, correct) {
        const badge = card.querySelector('.result-badge');
        const inputs = Array.from(card.querySelectorAll('.answer-input'));
        const state = loadSessionState();

        // 入力された値を保存
        inputs.forEach((input, index) => {
            input.value = values[index] || '';
            input.disabled = true;
        });

        // 結果表示
        badge.textContent = correct ? '正解' : '不正解';
        badge.classList.remove('correct', 'wrong');
        badge.classList.add(correct ? 'correct' : 'wrong');

        if (correct) {
            showAnswerFeed(card);
        }

        // 回答済みにする
        card.classList.add('is-solved');

        // セッションに保存
        const cardIndex = Number(card.dataset.index);

        state[cardIndex] = {
            answered: true,
            correct: correct,
            values: values
        };

        saveSessionState(state);

        // フォルダのチェックマークなどを更新
        updateFolderStates();

        // 入力欄を同期
        syncInputState();
    }


    /* ====================================== */
    /* 保存された状態を復元 */
    /* ====================================== */

    function restoreState() {
        const state = loadSessionState();

        cards.forEach((card) => {
            const cardIndex = Number(card.dataset.index);
            const saved = state[cardIndex];
            const inputs = Array.from(card.querySelectorAll('.answer-input'));
            const badge = card.querySelector('.result-badge');

            // 保存データがない場合
            if (!saved) {
                inputs.forEach((input) => {
                    input.value = '';
                    input.disabled = false;
                });

                badge.textContent = '';
                badge.classList.remove('correct', 'wrong');
                card.classList.remove('is-solved');

                return;
            }

            // 保存された回答を復元
            inputs.forEach((input, index) => {
                input.value =
                    saved.values && saved.values[index]
                        ? saved.values[index]
                        : '';
            });

            // 回答済みなら結果を復元
            if (saved.answered) {
                badge.textContent = saved.correct ? '正解' : '不正解';
                badge.classList.remove('correct', 'wrong');
                badge.classList.add(saved.correct ? 'correct' : 'wrong');

                if (saved.correct) {
                    card.classList.add('is-solved');
                    showAnswerFeed(card);
                }
            }
        });

        applyLockState();
        updateFolderStates();
        syncInputState();

        // 最初にまだ回答していない(かつロックされていない)問題を探す
        const firstOpenIndex = cards.findIndex((card) => {
            const cardIndex = Number(card.dataset.index);
            const saved = state[cardIndex];

            return isAvailable(cardIndex) && (!saved || !saved.answered);
        });

        // 未回答の問題がある場合、その問題を開く
        if (firstOpenIndex >= 0) {
            openQuestion(Number(cards[firstOpenIndex].dataset.index));
            return;
        }

        // 開ける問題がない場合(全問回答済み、またはロック中)
        if (stage) {
            stage.classList.remove('has-active');
        }
    }


    /* ====================================== */
    /* フォルダクリック */
    /* ====================================== */

    folderButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.index);
            openQuestion(index);
        });
    });


    /* ====================================== */
    /* 入力欄の処理(半角英数字を受け付ける) */
    /* ====================================== */

    cards.forEach((card) => {
        const inputs = Array.from(card.querySelectorAll('.answer-input'));

        inputs.forEach((input, index) => {

            /* -------------------------------- */
            /* フォーカス・クリック時に全選択 */
            /* → 入力済みの欄でもそのまま上書きできる */
            /* -------------------------------- */

            input.addEventListener('focus', () => input.select());
            input.addEventListener('click', () => input.select());


            /* -------------------------------- */
            /* 入力時 */
            /* -------------------------------- */

            const handleInput = () => {
                // 全角文字は受け付けず、半角英数字での入力を案内する
                const badge = card.querySelector('.result-badge');
                const fullWidthMessage = '全角文字は入力できません。半角英数字に切り替えて入力してください。';

                if ([...input.value].some((character) => character.codePointAt(0) > 0x7F)) {
                    input.value = '';
                    badge.textContent = fullWidthMessage;
                    badge.classList.remove('correct');
                    badge.classList.add('wrong');
                    return;
                }

                input.value = input.value
                    .replace(/[^0-9A-Za-z]/g, '')
                    .slice(-1);

                if (badge.textContent === fullWidthMessage) {
                    badge.textContent = '';
                    badge.classList.remove('wrong');
                }

                // 1文字入力されたら次の入力欄へ移動
                if (input.value && index < inputs.length - 1) {
                    const nextInput = inputs[index + 1];

                    if (nextInput && !nextInput.disabled) {
                        nextInput.focus();
                    }
                }
            };

            input.addEventListener('input', (event) => {
                // IME変換中は触らない
                if (event.isComposing) {
                    return;
                }

                handleInput();
            });

            input.addEventListener('compositionend', handleInput);


            /* -------------------------------- */
            /* Backspace */
            /* -------------------------------- */

            input.addEventListener('keydown', (event) => {
                if (
                    event.key === 'Backspace' &&
                    !input.value &&
                    index > 0
                ) {
                    const previousInput = inputs[index - 1];

                    if (previousInput && !previousInput.disabled) {
                        previousInput.focus();
                    }
                }
            });
        });
    });


    /* ====================================== */
    /* 決定ボタン */
    /* ====================================== */

    cards.forEach((card) => {
        const submitButton = card.querySelector('.submit-btn');
        const inputs = Array.from(card.querySelectorAll('.answer-input'));

        if (!submitButton) {
            return;
        }

        submitButton.addEventListener('click', () => {

            // すでに回答済みなら何もしない
            if (card.classList.contains('is-solved')) {
                return;
            }

            // 入力値を取得
            const values = inputs.map((input) => input.value.trim());

            // 6文字すべて入力されているか確認
            const isComplete = values.every((value) => value.length === 1);

            // 未入力がある場合
            if (!isComplete) {
                const badge = card.querySelector('.result-badge');

                badge.textContent = '未入力';
                badge.classList.remove('correct', 'wrong');
                badge.classList.add('wrong');

                return;
            }

            // 正解判定
            const answer = card.dataset.answer;
            const entered = values.join('');
            const correct = entered === answer;

            if (!correct) {
                const badge = card.querySelector('.result-badge');

                badge.textContent = '不正解';
                badge.classList.remove('correct', 'wrong');
                badge.classList.add('wrong');

                return;
            }

            // 結果を保存
            setCardState(card, values, correct);
        });
    });


    /* ====================================== */
    /* exe・コード入力ダイアログのイベント */
    /* ====================================== */

    if (exeIcon) {
        exeIcon.addEventListener('click', openUnlockDialog);
    }

    if (unlockInput) {
        unlockInput.addEventListener('input', () => {
            unlockInput.value = unlockInput.value.replace(/[^0-9]/g, '').slice(0, 6);
            unlockMessage.textContent = '';
            unlockMessage.classList.remove('correct', 'wrong');
        });

        unlockInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                submitUnlock();
            }
        });
    }

    if (unlockSubmit) {
        unlockSubmit.addEventListener('click', submitUnlock);
    }

    if (unlockClose) {
        unlockClose.addEventListener('click', () => {
            unlockDialog.hidden = true;
        });
    }


    /* ====================================== */
    /* 初期化 */
    /* ====================================== */

    restoreState();

});