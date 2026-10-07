document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'security-quiz-session';
    const cards = Array.from(document.querySelectorAll('.question-card'));
    const folderButtons = Array.from(document.querySelectorAll('.folder-item'));
    const stage = document.querySelector('.question-stage');
    const questionTime = document.querySelector('#question-time');

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

    function openQuestion(index) {
        cards.forEach((card) => {
            const isActive = Number(card.dataset.index) === index;
            const isSolved = card.classList.contains('is-solved');
            card.classList.toggle('active', isActive);
            card.setAttribute('aria-hidden', String(!isActive));

            const inputs = Array.from(card.querySelectorAll('.answer-input'));
            inputs.forEach((input) => {
                input.disabled = !(isActive && !isSolved);
            });
        });

        folderButtons.forEach((button) => {
            const isActive = Number(button.dataset.index) === index;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        if (stage) {
            stage.classList.add('has-active');
        }
    }

    function updateFolderStates() {
        const state = loadSessionState();

        folderButtons.forEach((button) => {
            const index = Number(button.dataset.index);
            const solved = Boolean(state[index] && state[index].answered);
            button.classList.toggle('is-solved', solved);
        });
    }

    function setCardState(card, values, correct) {
        const badge = card.querySelector('.result-badge');
        const inputs = Array.from(card.querySelectorAll('.answer-input'));
        const state = loadSessionState();

        inputs.forEach((input, index) => {
            input.value = values[index] || '';
            input.disabled = true;
        });

        badge.textContent = correct ? '正解' : '不正解';
        badge.classList.remove('correct', 'wrong');
        badge.classList.add(correct ? 'correct' : 'wrong');
        card.classList.add('is-solved');

        const cardIndex = Number(card.dataset.index);
        state[cardIndex] = {
            answered: true,
            correct,
            values
        };

        saveSessionState(state);
        updateFolderStates();
    }

    function restoreState() {
        const state = loadSessionState();

        cards.forEach((card) => {
            const cardIndex = Number(card.dataset.index);
            const saved = state[cardIndex];
            const inputs = Array.from(card.querySelectorAll('.answer-input'));
            const badge = card.querySelector('.result-badge');

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

            inputs.forEach((input, index) => {
                input.value = saved.values[index] || '';
                input.disabled = true;
            });

            badge.textContent = saved.correct ? '正解' : '不正解';
            badge.classList.remove('correct', 'wrong');
            badge.classList.add(saved.correct ? 'correct' : 'wrong');
            card.classList.add('is-solved');
        });

        updateFolderStates();

        const firstOpenIndex = cards.findIndex((card) => {
            const cardIndex = Number(card.dataset.index);
            const saved = state[cardIndex];
            return !saved || !saved.answered;
        });

        if (firstOpenIndex >= 0) {
            openQuestion(Number(cards[firstOpenIndex].dataset.index));
            return;
        }

        if (stage) {
            stage.classList.remove('has-active');
        }
    }

    folderButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.index);
            openQuestion(index);
        });
    });

    cards.forEach((card) => {
        const submitButton = card.querySelector('.submit-btn');
        const inputs = Array.from(card.querySelectorAll('.answer-input'));

        inputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                input.value = input.value.replace(/[^\d]/g, '').slice(0, 1);
                if (input.value && index < inputs.length - 1) {
                    const nextInput = inputs[index + 1];
                    if (nextInput) {
                        nextInput.focus();
                    }
                }
            });

            input.addEventListener('keydown', (event) => {
                if (event.key === 'Backspace' && !input.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });

        submitButton.addEventListener('click', () => {
            if (card.classList.contains('is-solved')) {
                return;
            }

            const values = inputs.map((input) => input.value.trim());
            const isComplete = values.every((value) => value.length === 1);

            if (!isComplete) {
                const badge = card.querySelector('.result-badge');
                badge.textContent = '未入力';
                badge.classList.remove('correct', 'wrong');
                badge.classList.add('wrong');
                return;
            }

            const answer = card.dataset.answer;
            const entered = values.join('');
            const correct = entered === answer;
            setCardState(card, values, correct);
        });
    });

    restoreState();
});
