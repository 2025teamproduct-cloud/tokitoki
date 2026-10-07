document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'security-quiz-session';

    const cards = Array.from(
        document.querySelectorAll('.question-card')
    );

    const folderButtons = Array.from(
        document.querySelectorAll('.folder-item')
    );

    const stage = document.querySelector('.question-stage');
    const questionTime = document.querySelector('#question-time');


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
    /* セッション状態の読み込み */
    /* ====================================== */

    function loadSessionState() {
        try {
            return JSON.parse(
                sessionStorage.getItem(STORAGE_KEY) || '{}'
            );
        } catch (error) {
            return {};
        }
    }


    /* ====================================== */
    /* セッション状態の保存 */
    /* ====================================== */

    function saveSessionState(state) {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );
    }


    /* ====================================== */
    /* 入力欄の状態を同期 */
    /* ====================================== */

    function syncInputState() {

        cards.forEach((card) => {

            const inputs = Array.from(
                card.querySelectorAll('.answer-input')
            );

            const isSolved =
                card.classList.contains('is-solved');


            inputs.forEach((input) => {

                /*
                 * 未回答なら入力可能。
                 * 回答済みの場合のみdisabledにする。
                 */
                input.disabled = isSolved;

            });

        });

    }


    /* ====================================== */
    /* 問題を開く */
    /* ====================================== */

    function openQuestion(index) {

        cards.forEach((card) => {

            const isActive =
                Number(card.dataset.index) === index;

            card.classList.toggle(
                'active',
                isActive
            );

            card.setAttribute(
                'aria-hidden',
                String(!isActive)
            );

        });


        folderButtons.forEach((button) => {

            const isActive =
                Number(button.dataset.index) === index;

            button.classList.toggle(
                'is-active',
                isActive
            );

            button.setAttribute(
                'aria-pressed',
                String(isActive)
            );

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

            const index =
                Number(button.dataset.index);

            const solved =
                Boolean(
                    state[index] &&
                    state[index].answered
                );


            button.classList.toggle(
                'is-solved',
                solved
            );

        });

    }


    /* ====================================== */
    /* 回答結果をカードに反映 */
    /* ====================================== */

    function setCardState(
        card,
        values,
        correct
    ) {

        const badge =
            card.querySelector('.result-badge');

        const inputs =
            Array.from(
                card.querySelectorAll('.answer-input')
            );

        const state =
            loadSessionState();


        /*
         * 入力された値を保存
         */
        inputs.forEach((input, index) => {

            input.value =
                values[index] || '';

            input.disabled = true;

        });


        /*
         * 結果表示
         */
        badge.textContent =
            correct ? '正解' : '不正解';


        badge.classList.remove(
            'correct',
            'wrong'
        );


        badge.classList.add(
            correct ? 'correct' : 'wrong'
        );


        /*
         * 回答済みにする
         */
        card.classList.add('is-solved');


        /*
         * セッションに保存
         */
        const cardIndex =
            Number(card.dataset.index);


        state[cardIndex] = {
            answered: true,
            correct: correct,
            values: values
        };


        saveSessionState(state);


        /*
         * フォルダのチェックマークなどを更新
         */
        updateFolderStates();


        /*
         * 入力欄を同期
         */
        syncInputState();

    }


    /* ====================================== */
    /* 保存された状態を復元 */
    /* ====================================== */

    function restoreState() {

        const state =
            loadSessionState();


        cards.forEach((card) => {

            const cardIndex =
                Number(card.dataset.index);

            const saved =
                state[cardIndex];

            const inputs =
                Array.from(
                    card.querySelectorAll('.answer-input')
                );

            const badge =
                card.querySelector('.result-badge');


            /*
             * 保存データがない場合
             */
            if (!saved) {

                inputs.forEach((input) => {
                    input.value = '';
                    input.disabled = false;
                });


                badge.textContent = '';

                badge.classList.remove(
                    'correct',
                    'wrong'
                );


                card.classList.remove(
                    'is-solved'
                );


                return;
            }


            /*
             * 保存された回答を復元
             */
            inputs.forEach((input, index) => {

                input.value =
                    saved.values &&
                    saved.values[index]
                        ? saved.values[index]
                        : '';

            });


            /*
             * 回答済みなら結果を復元
             */
            if (saved.answered) {

                badge.textContent =
                    saved.correct
                        ? '正解'
                        : '不正解';


                badge.classList.remove(
                    'correct',
                    'wrong'
                );


                badge.classList.add(
                    saved.correct
                        ? 'correct'
                        : 'wrong'
                );


                card.classList.add(
                    'is-solved'
                );

            }

        });


        updateFolderStates();

        syncInputState();


        /*
         * 最初にまだ回答していない問題を探す
         */
        const firstOpenIndex =
            cards.findIndex((card) => {

                const cardIndex =
                    Number(card.dataset.index);

                const saved =
                    state[cardIndex];


                return !saved ||
                    !saved.answered;

            });


        /*
         * 未回答の問題がある場合、
         * その問題を開く
         */
        if (firstOpenIndex >= 0) {

            openQuestion(
                Number(
                    cards[firstOpenIndex]
                        .dataset.index
                )
            );

            return;

        }


        /*
         * 全問回答済みの場合
         */
        if (stage) {
            stage.classList.remove(
                'has-active'
            );
        }

    }


    /* ====================================== */
    /* フォルダクリック */
    /* ====================================== */

    folderButtons.forEach((button) => {

        button.addEventListener(
            'click',
            () => {

                const index =
                    Number(button.dataset.index);

                openQuestion(index);

            }
        );

    });


    /* ====================================== */
    /* 入力欄の処理 */
    /* ====================================== */

    cards.forEach((card) => {

        const inputs =
            Array.from(
                card.querySelectorAll('.answer-input')
            );


        inputs.forEach((input, index) => {


            /* -------------------------------- */
            /* 入力時 */
            /* -------------------------------- */

            input.addEventListener(
                'input',
                () => {

                    /*
                     * 数字以外を削除
                     */
                    input.value =
                        input.value
                            .replace(/[^\d]/g, '')
                            .slice(0, 1);


                    /*
                     * 1文字入力されたら
                     * 次の入力欄へ移動
                     */
                    if (
                        input.value &&
                        index < inputs.length - 1
                    ) {

                        const nextInput =
                            inputs[index + 1];


                        if (
                            nextInput &&
                            !nextInput.disabled
                        ) {

                            nextInput.focus();

                        }

                    }

                }
            );


            /* -------------------------------- */
            /* Backspace */
            /* -------------------------------- */

            input.addEventListener(
                'keydown',
                (event) => {

                    if (
                        event.key === 'Backspace' &&
                        !input.value &&
                        index > 0
                    ) {

                        const previousInput =
                            inputs[index - 1];


                        if (
                            previousInput &&
                            !previousInput.disabled
                        ) {

                            previousInput.focus();

                        }

                    }

                }
            );

        });

    });


    /* ====================================== */
    /* 決定ボタン */
    /* ====================================== */

    cards.forEach((card) => {

        const submitButton =
            card.querySelector('.submit-btn');

        const inputs =
            Array.from(
                card.querySelectorAll('.answer-input')
            );


        if (!submitButton) {
            return;
        }


        submitButton.addEventListener(
            'click',
            () => {

                /*
                 * すでに回答済みなら何もしない
                 */
                if (
                    card.classList.contains(
                        'is-solved'
                    )
                ) {

                    return;

                }


                /*
                 * 入力値を取得
                 */
                const values =
                    inputs.map(
                        (input) =>
                            input.value.trim()
                    );


                /*
                 * 6文字すべて入力されているか確認
                 */
                const isComplete =
                    values.every(
                        (value) =>
                            value.length === 1
                    );


                /*
                 * 未入力がある場合
                 */
                if (!isComplete) {

                    const badge =
                        card.querySelector(
                            '.result-badge'
                        );


                    badge.textContent =
                        '未入力';


                    badge.classList.remove(
                        'correct',
                        'wrong'
                    );


                    badge.classList.add(
                        'wrong'
                    );


                    return;

                }


                /*
                 * 正解判定
                 */
                const answer =
                    card.dataset.answer;

                const entered =
                    values.join('');


                const correct =
                    entered === answer;


                /*
                 * 結果を保存
                 */
                setCardState(
                    card,
                    values,
                    correct
                );

            }
        );

    });


    /* ====================================== */
    /* 初期化 */
    /* ====================================== */

    restoreState();

});

