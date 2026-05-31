// ЗМІНИ ЦЕ ПОСИЛАННЯ НА СВОЄ ПІСЛЯ НАЛАШТУВАННЯ GOOGLE APPS SCRIPT
const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

let questions = [];
let userAnswers = {};
let studentName = '';
let startTime;
let timerInterval;

// Load questions from data.json
async function loadQuestions() {
    try {
        const response = await fetch('data.json');
        questions = await response.json();
    } catch (error) {
        console.error('Помилка завантаження питань:', error);
        alert("Помилка завантаження JSON. Якщо ви відкрили файл локально (через file://), браузер блокує завантаження файлів з метою безпеки. Використовуйте локальний сервер або завантажте на GitHub Pages.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    
    document.getElementById('start-btn').addEventListener('click', startTest);
    document.getElementById('finish-btn').addEventListener('click', finishTest);
});

function startTest() {
    const nameInput = document.getElementById('student-name').value.trim();
    if (nameInput === '') {
        alert('Будь ласка, введи свій нікнейм!');
        return;
    }
    if (questions.length === 0) {
        alert('Завдання ще завантажуються або виникла помилка. Спробуйте оновити сторінку.');
        return;
    }
    
    studentName = nameInput;
    document.getElementById('start-screen').classList.replace('active', 'hidden');
    document.getElementById('test-screen').classList.replace('hidden', 'active');
    
    renderQuestions();
    startTimer();
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');
        document.getElementById('timer').textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    
    questions.forEach((q, index) => {
        const block = document.createElement('div');
        block.className = 'question-block';
        
        let html = `<div class="question-text">${index + 1}. ${q.question}</div>`;
        html += `<div class="options-grid">`;
        
        for (const [key, value] of Object.entries(q.options)) {
            html += `
                <label class="option-label" id="label-${q.id}-${key}" onclick="selectOption(${q.id}, '${key}')">
                    <input type="radio" name="q${q.id}" value="${key}">
                    <span class="option-key">${key})</span>
                    <span class="option-value">${value}</span>
                </label>
            `;
        }
        
        html += `</div>`;
        block.innerHTML = html;
        container.appendChild(block);
    });
}

window.selectOption = function(qId, key) {
    userAnswers[qId] = key;
    // Update UI
    const labels = document.querySelectorAll(`[id^="label-${qId}-"]`);
    labels.forEach(l => l.classList.remove('selected'));
    document.getElementById(`label-${qId}-${key}`).classList.add('selected');
}

async function finishTest() {
    // Check if all answered
    if (Object.keys(userAnswers).length < questions.length) {
        if (!confirm('Ти дав відповідь не на всі питання! Впевнений, що хочеш завершити?')) {
            return;
        }
    }
    
    clearInterval(timerInterval);
    const timeSpent = document.getElementById('timer').textContent;
    
    document.getElementById('test-screen').classList.replace('active', 'hidden');
    document.getElementById('loading-screen').classList.replace('hidden', 'active');
    
    // Calculate score
    let score = 0;
    questions.forEach(q => {
        if (userAnswers[q.id] === q.answer) {
            score++;
        }
    });
    
    // Prepare data to send
    const payload = {
        name: studentName,
        score: score,
        total: questions.length,
        time: timeSpent,
        answers: JSON.stringify(userAnswers)
    };
    
    // Send to Google Sheets if URL is set
    if (SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Помилка відправки:', error);
        }
    } else {
        console.warn("SCRIPT_URL не налаштовано. Дані не відправлені в таблицю.");
    }
    
    showResult(score);
}

function showResult(score) {
    document.getElementById('loading-screen').classList.replace('active', 'hidden');
    document.getElementById('result-screen').classList.replace('hidden', 'active');
    
    document.getElementById('score-display').textContent = `${score}/${questions.length}`;
    
    const reviewContainer = document.getElementById('review-container');
    reviewContainer.innerHTML = '';
    
    questions.forEach((q, i) => {
        const userAnswer = userAnswers[q.id];
        const isCorrect = userAnswer === q.answer;
        
        const block = document.createElement('div');
        block.className = 'review-block';
        
        let html = `<div class="review-question">${i + 1}. ${q.question}</div>`;
        
        if (userAnswer) {
            html += `<div class="review-answer ${isCorrect ? 'correct-ans' : 'wrong-ans'}">
                Твоя відповідь: <strong>${userAnswer}) ${q.options[userAnswer]}</strong>
            </div>`;
        } else {
             html += `<div class="review-answer wrong-ans">Немає відповіді</div>`;
        }
        
        if (!isCorrect) {
            html += `<div class="review-answer correct-ans">
                Правильна відповідь: <strong>${q.answer}) ${q.options[q.answer]}</strong>
            </div>`;
        }
        
        if (q.explanation) {
            html += `
                <button class="toggle-exp-btn" onclick="toggleExp(${q.id})">Показати пояснення</button>
                <div class="explanation-text hidden" id="exp-${q.id}">
                    ${q.explanation}
                </div>
            `;
        }
        
        block.innerHTML = html;
        reviewContainer.appendChild(block);
    });
}

window.toggleExp = function(qId) {
    const expDiv = document.getElementById(`exp-${qId}`);
    if (expDiv.classList.contains('hidden')) {
        expDiv.classList.remove('hidden');
    } else {
        expDiv.classList.add('hidden');
    }
}
