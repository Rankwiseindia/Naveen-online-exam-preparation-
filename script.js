let currentCategory = '';
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let timerInterval;
let savedQuestions = JSON.parse(localStorage.getItem('savedExamQuestions')) || [];

const savedCountEl = document.getElementById('saved-count');
const savedNumEl = document.getElementById('saved-num');
const themeToggle = document.getElementById('theme-toggle');

function updateSavedCount() {
  const count = savedQuestions.length;
  savedCountEl.innerText = count;
  savedNumEl.innerText = count;
  localStorage.setItem('savedExamQuestions', JSON.stringify(savedQuestions));
}

function startQuiz(category) {
  currentCategory = category;
  currentQuestions = quizzes[category] || [];
  if (currentQuestions.length === 0) return alert("इस कैटेगरी में अभी सवाल नहीं हैं!");
  
  currentIndex = 0;
  score = 0;
  document.getElementById('home').style.display = 'none';
  document.getElementById('quiz-section').style.display = 'block';
  loadQuestion();
  startTimer(30 * 60); // 30 मिनट
}

function loadQuestion() {
  const q = currentQuestions[currentIndex];
  document.getElementById('question-text').innerText = q.question;
  document.getElementById('q-no').innerText = currentIndex + 1;
  document.getElementById('total-q').innerText = currentQuestions.length;

  const container = document.getElementById('options-container');
  container.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.innerText = opt;
    btn.onclick = () => selectOption(i, btn);
    container.appendChild(btn);
  });

  document.getElementById('bookmark-btn').onclick = () => {
    if (!savedQuestions.some(sq => sq.question === q.question)) {
      savedQuestions.push(q);
      alert("सवाल Saved हो गया!");
      updateSavedCount();
    }
  };
}

function selectOption(selectedIndex, btn) {
  const correctIndex = currentQuestions[currentIndex].correct;
  // Highlight correct/wrong (optional)
  // ... आप चाहो तो बाकी ऑप्शन्स disable कर सकते हो

  if (selectedIndex === correctIndex) score++;
  currentIndex++;
  if (currentIndex < currentQuestions.length) {
    loadQuestion();
  } else {
    endQuiz();
  }
}

function startTimer(seconds) {
  let timeLeft = seconds;
  timerInterval = setInterval(() => {
    timeLeft--;
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    document.getElementById('time-left').innerText = `\( {min}: \){sec < 10 ? '0' : ''}${sec}`;
    if (timeLeft <= 0) endQuiz();
  }, 1000);
}

function endQuiz() {
  clearInterval(timerInterval);
  document.getElementById('quiz-section').style.display = 'none';
  document.getElementById('result-section').style.display = 'block';
  document.getElementById('final-score').innerText = score;
  document.getElementById('final-total').innerText = currentQuestions.length;
  document.getElementById('percent').innerText = ((score / currentQuestions.length) * 100).toFixed(1);
}

function restartQuiz() {
  document.getElementById('result-section').style.display = 'none';
  document.getElementById('home').style.display = 'block';
  clearInterval(timerInterval);
}

function showSaved() {
  if (savedQuestions.length === 0) return alert("कोई saved सवाल नहीं है!");
  currentQuestions = savedQuestions;
  currentIndex = 0;
  score = 0;
  document.getElementById('home').style.display = 'none';
  document.getElementById('quiz-section').style.display = 'block';
  loadQuestion();
  startTimer(30 * 60);
}

function clearSaved() {
  if (confirm("सारे saved सवाल डिलीट करें?")) {
    savedQuestions = [];
    updateSavedCount();
  }
}

// डार्क मोड टॉगल
themeToggle.onclick = () => {
  document.body.classList.toggle('dark');
  themeToggle.innerHTML = document.body.classList.contains('dark') 
    ? '<i class="fas fa-sun"></i> लाइट मोड' 
    : '<i class="fas fa-moon"></i> डार्क मोड';
};

// Init
updateSavedCount();
