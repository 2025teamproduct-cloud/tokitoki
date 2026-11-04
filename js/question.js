document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'security-quiz-session';

    const cards = Array.from(document.querySelectorAll('.question-card'));
    const folderButtons = Array.from(document.querySelectorAll('.folder-item'));
    const stage = document.querySelector('.question-stage');
    const questionTime = document.querySelector('#question-time');
    const answerFeedbackTemplate = document.querySelector('#answer-feedback-template');

    /* ====================================== */
    /* 問題06クリア後:サポートAI + 最終exe → securiti.html */
    /* ====================================== */

    const FINAL_QUESTION_INDEX = 5;          // 問題06(index 5)
    const FINAL_CODE = '111111';             // ← 仮の答え(半角数字111111)。確定したら変更
    const FINAL_NEXT_PAGE = 'securiti.html'; // 正解後の遷移先
    const SUPPORT_AI_DELAY = 800;            // 問題07正解からAI表示までの待ち時間(ms)
    const REDIRECT_DELAY = 700;              // 正解表示から遷移までの待ち時間(ms)

    const finalExeIcon = document.querySelector('#final-exe-icon');
    const finalDialog = document.querySelector('#final-dialog');
    const finalInput = document.querySelector('#final-input');
    const finalSubmit = document.querySelector('#final-submit');
    const finalClose = document.querySelector('#final-close');
    const finalMessage = document.querySelector('#final-message');
    const supportAi = document.querySelector('#support-ai');
    const imagePreview = document.querySelector('#image-preview');
    const imagePreviewContent = imagePreview?.querySelector('.image-preview-content');
    const imagePreviewClose = imagePreview?.querySelector('.image-preview-close');


    /* ====================================== */
    /* 正誤判定ロジック */
    /* ====================================== */

    // 問題index → 正解(文字列。複数の正解を許可したい場合は配列に追加)
    // ※ 現在は仮の値です。実際の答えに書き換えてください
    const ANSWERS = {
        0: ['つりばり','ツリバリ','釣り針','釣りばり','釣りバリ','釣針'],
        1: ['きんきゅう','キンキュウ','緊急'],
        2: ['かぎあな','カギアナ','鍵穴'],
        3: ['きょか','キョカ','許可'],
        4: ['ほぞん','ホゾン','保存'],
        5: ['142'],
    };

    // 入力値の正規化
    // ・全角/半角の違いを吸収(NFKC)  例:ＡＢＣ → ABC
    // ・英字の大文字/小文字を無視
    // ・空白(全角スペース含む)を無視
    function normalizeAnswer(text) {
        return text
            .normalize('NFKC')
            .replace(/\s+/g, '')
            .toLowerCase();
    }

    // 正誤判定:問題index と 入力文字列 を受け取り true/false を返す
    function checkAnswer(questionIndex, entered) {
        const accepted = ANSWERS[questionIndex];

        if (!accepted) {
            return false;
        }

        const value = normalizeAnswer(entered);
        return accepted.some((answer) => normalizeAnswer(answer) === value);
    }


    /* ====================================== */
    /* 最終exe(問題06クリア後に出現) */
    /* ====================================== */

    function isFinalReady() {
        const saved = loadSessionState()[FINAL_QUESTION_INDEX];
        return Boolean(saved && saved.answered && saved.correct);
    }

    // 問題06が正解済みなら、最終exeとサポートAIを表示する
    // animate=true のときだけ、AIを少し遅らせて出す(進展を感じさせる演出)
    function applyFinalState(ready, animate) {
        if (finalExeIcon) {
            finalExeIcon.classList.toggle('is-locked', !ready);
        }

        if (!supportAi || !ready) {
            return;
        }

        const showSupportAi = () => {
            supportAi.classList.add('is-visible');
            supportAi.setAttribute('aria-hidden', 'false');
        };

        if (animate) {
            setTimeout(showSupportAi, SUPPORT_AI_DELAY);
        } else {
            showSupportAi();
        }
    }

    function openFinalDialog() {
        if (!isFinalReady() || !finalDialog) {
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

        finalInput.value = '';
        finalMessage.textContent = '';
        finalMessage.classList.remove('correct', 'wrong');
        finalDialog.hidden = false;
        finalInput.focus();
    }

    function showFinalMessage(text, correct) {
        finalMessage.textContent = text;
        finalMessage.classList.toggle('correct', correct);
        finalMessage.classList.toggle('wrong', !correct);
    }

    function submitFinal() {
        const value = finalInput.value;

        if (value.length !== 6) {
            showFinalMessage('6桁の数字を入力してください', false);
            return;
        }

        if (value !== FINAL_CODE) {
            showFinalMessage('不正解', false);
            return;
        }

        // 正解:二重送信を防いで securiti.html へ遷移
        finalInput.disabled = true;
        finalSubmit.disabled = true;
        showFinalMessage('正解', true);

        setTimeout(() => {
            window.location.href = FINAL_NEXT_PAGE;
        }, REDIRECT_DELAY);
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
        // 最終コード入力ダイアログが開いていれば閉じる
        if (finalDialog) {
            finalDialog.hidden = true;
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

    function setCardState(card, value, correct) {
        const badge = card.querySelector('.result-badge');
        const inputs = Array.from(card.querySelectorAll('.answer-input'));
        const state = loadSessionState();

        // 入力された値を反映して入力不可にする
        inputs.forEach((input) => {
            input.value = value;
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
            value: value
        };

        saveSessionState(state);

        // フォルダのチェックマークなどを更新
        updateFolderStates();

        // 入力欄を同期
        syncInputState();

        // 問題06に正解したら、サポートAIと最終exeを出す
        if (correct && cardIndex === FINAL_QUESTION_INDEX) {
            applyFinalState(true, true);
        }
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

            // 保存された回答を復元(旧形式の values 配列にも対応)
            const savedValue = saved.value
                ?? (Array.isArray(saved.values) ? saved.values.join('') : '');

            inputs.forEach((input) => {
                input.value = savedValue;
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

        applyFinalState(isFinalReady(), false);
        updateFolderStates();
        syncInputState();

        // 最初にまだ回答していない問題を探す
        const firstOpenIndex = cards.findIndex((card) => {
            const saved = state[Number(card.dataset.index)];
            return !saved || !saved.answered;
        });

        // 未回答の問題がある場合、その問題を開く
        if (firstOpenIndex >= 0) {
            openQuestion(Number(cards[firstOpenIndex].dataset.index));
            return;
        }

        // 全問回答済みの場合
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


    /* 問題画像の拡大表示 */

    if (imagePreview && imagePreviewContent) {
        document.querySelectorAll('.problem-image').forEach((image) => {
            image.tabIndex = 0;
            image.setAttribute('role', 'button');
            image.setAttribute('aria-label', `${image.alt}を拡大`);

            const openPreview = () => {
                imagePreviewContent.src = image.src;
                imagePreviewContent.alt = image.alt;
                imagePreview.showModal();
            };

            image.addEventListener('click', openPreview);
            image.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openPreview();
                }
            });
        });

        imagePreviewClose?.addEventListener('click', () => imagePreview.close());
        imagePreview.addEventListener('click', (event) => {
            if (event.target === imagePreview) {
                imagePreview.close();
            }
        });
    }


    /* ====================================== */
    /* 入力欄の処理(文字数制限なし・文字種の制限なし) */
    /* ====================================== */

    cards.forEach((card) => {
        const input = card.querySelector('.answer-input');
        const badge = card.querySelector('.result-badge');

        if (!input) {
            return;
        }

        // 入力し直したら、前回の「未入力」「不正解」表示を消す
        input.addEventListener('input', () => {
            if (!card.classList.contains('is-solved')) {
                badge.textContent = '';
                badge.classList.remove('correct', 'wrong');
            }
        });
    });


    /* ====================================== */
    /* 決定ボタン / Enterキーで回答 */
    /* ====================================== */

    function showBadge(badge, text) {
        badge.textContent = text;
        badge.classList.remove('correct', 'wrong');
        badge.classList.add('wrong');
    }

    function submitAnswer(card) {
        const input = card.querySelector('.answer-input');
        const badge = card.querySelector('.result-badge');

        // すでに回答済みなら何もしない
        if (card.classList.contains('is-solved')) {
            return;
        }

        const value = input.value.trim();

        // 未入力
        if (!value) {
            showBadge(badge, '未入力');
            return;
        }

        // 正解判定(JSのロジックで判定)
        const correct = checkAnswer(Number(card.dataset.index), value);

        if (!correct) {
            showBadge(badge, '不正解');
            return;
        }

        // 結果を保存
        setCardState(card, value, correct);
    }

    cards.forEach((card) => {
        const submitButton = card.querySelector('.submit-btn');
        const input = card.querySelector('.answer-input');

        if (submitButton) {
            submitButton.addEventListener('click', () => submitAnswer(card));
        }

        if (input) {
            input.addEventListener('keydown', (event) => {
                // IME変換の確定Enterでは送信しない
                if (event.key === 'Enter' && !event.isComposing) {
                    submitAnswer(card);
                }
            });
        }
    });


    /* ====================================== */
    /* 最終exe・最終コード入力ダイアログのイベント */
    /* ====================================== */

    if (finalExeIcon) {
        finalExeIcon.addEventListener('click', openFinalDialog);
    }

    if (finalInput) {
        finalInput.addEventListener('input', () => {
            finalInput.value = finalInput.value.replace(/[^0-9]/g, '').slice(0, 6);
            finalMessage.textContent = '';
            finalMessage.classList.remove('correct', 'wrong');
        });

        finalInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                submitFinal();
            }
        });
    }

    if (finalSubmit) {
        finalSubmit.addEventListener('click', submitFinal);
    }

    if (finalClose) {
        finalClose.addEventListener('click', () => {
            finalDialog.hidden = true;
        });
    }


    /* ====================================== */
    /* 初期化 */
    /* ====================================== */

    restoreState();

});