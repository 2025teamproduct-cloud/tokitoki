const QUIZ_STORAGE_KEY = 'virus-problem-state';
const problemModal = document.querySelector('#problem-modal');
const problemBody = document.querySelector('#problem-body');
const closeBtn = document.querySelector('#window-close');
const desktopItems = document.querySelectorAll('.desktop-item');

const questionBank = [
    {
        id: 0,
        title: 'VIRUS = 22 - 9 - 18 - 21 - 19',
        answer: '613533',
        secondary: '6 - 1 - 3 - 3 - 5 - 3'
    },
    {
        id: 1,
        title: 'SCAN = 17 - 8 - 12 - 20 - 4',
        answer: '914281',
        secondary: '9 - 1 - 4 - 2 - 8 - 1'
    },
    {
        id: 2,
        title: 'ALERT = 5 - 14 - 18 - 27 - 2',
        answer: '731268',
        secondary: '7 - 3 - 1 - 2 - 6 - 8'
    },
    {
        id: 3,
        title: 'TOKEN = 3 - 18 - 22 - 20 - 15',
        answer: '819934',
        secondary: '8 - 1 - 9 - 9 - 3 - 4'
    },
    {
        id: 4,
        title: 'SYSTEM = 18 - 19 - 19 - 20 - 5 - 13',
        answer: '452813',
        secondary: '4 - 5 - 2 - 8 - 1 - 3'
    }
];

function loadState() {
    try {
        return JSON.parse(sessionStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
    } catch (error) {
        return {};
    }
}

function saveState(state) {
    sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(state));
}

function openModal() {
    if (!problemModal) return;
    problemModal.classList.add('is-visible');
    problemModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    if (!problemModal) return;
    problemModal.classList.remove('is-visible');
    problemModal.setAttribute('aria-hidden', 'true');
}

function renderQuestion(id) {
    const question = questionBank[id];
    if (!question) return;

    const savedState = loadState();
    const state = savedState[id] || { answered: false, answer: '', correct: false };
    const outer = document.createElement('article');
    outer.className = 'problem-card';
    if (state.answered) {
        outer.classList.add(state.correct ? 'is-correct' : 'is-wrong');
    }

    outer.innerHTML = `
        <p class="problem-text">${question.title}</p>
        <p class="problem-text">${question.secondary}</p>
        <div class="problem-input-row">
            <input type="text" maxlength="1" inputmode="numeric" aria-label="問題${id + 1}の1文字目">
            <input type="text" maxlength="1" inputmode="numeric" aria-label="問題${id + 1}の2文字目">
            <input type="text" maxlength="1" inputmode="numeric" aria-label="問題${id + 1}の3文字目">
            <input type="text" maxlength="1" inputmode="numeric" aria-label="問題${id + 1}の4文字目">
            <input type="text" maxlength="1" inputmode="numeric" aria-label="問題${id + 1}の5文字目">
            <input type="text" maxlength="1" inputmode="numeric" aria-label="問題${id + 1}の6文字目">
        </div>
        <div class="problem-actions">
            <button type="button" class="problem-submit">決定</button>
            <p class="problem-result" aria-live="polite">${state.answered ? (state.correct ? '正解' : '不正解') : ''}</p>
        </div>
    `;

    const inputs = outer.querySelectorAll('input');
    if (state.answered) {
        inputs.forEach((input, index) => {
            input.disabled = true;
            input.value = state.answer[index] || '';
        });
    }

    const resultLabel = outer.querySelector('.problem-result');
    const submitButton = outer.querySelector('.problem-submit');

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

    submitButton.addEventListener('click', () => {
        if (state.answered) return;

        const answerValue = [...inputs].map((input) => input.value || '').join('');
        const isCorrect = answerValue === question.answer;
        const nextState = loadState();
        nextState[id] = {
            answered: true,
            answer: answerValue,
            correct: isCorrect
        };
        saveState(nextState);

        inputs.forEach((input) => input.disabled = true);
        submitButton.disabled = true;
        resultLabel.textContent = isCorrect ? '正解' : '不正解';
        resultLabel.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
        outer.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
    });

    if (state.answered) {
        resultLabel.classList.add(state.correct ? 'is-correct' : 'is-wrong');
        resultLabel.textContent = state.correct ? '正解' : '不正解';
    }

    problemBody.innerHTML = '';
    problemBody.appendChild(outer);
}

desktopItems.forEach((item) => {
    item.addEventListener('dblclick', () => {
        const problemId = Number(item.dataset.problem);
        renderQuestion(problemId);
        openModal();
    });
});

if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
}

if (problemModal) {
    problemModal.addEventListener('click', (event) => {
        if (event.target === problemModal) {
            closeModal();
        }
    });
}
