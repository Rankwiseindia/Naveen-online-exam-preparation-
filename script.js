// --------------------------
// मुख्य वेरिएबल्स
// --------------------------
let currentCategory = '';
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let timerInterval;
let savedQuestions = JSON.parse(localStorage.getItem('savedExamQuestions')) || [];

// DOM एलिमेंट्स
const savedCountEl = document.getElementById('saved-count');
const savedNumEl = document.getElementById('saved-num');
const themeToggle = document.getElementById('theme-toggle');

// --------------------------
// Saved Questions काउंट अपडेट
// --------------------------
function updateSavedCount() {
  const count = savedQuestions.length;
  if (savedCountEl) savedCountEl.innerText = count;
  if (savedNumEl) savedNumEl.innerText = count;
  localStorage.setItem('savedExamQuestions', JSON.stringify(savedQuestions));
}

// --------------------------
// कैटेगरी से क्विज शुरू
// --------------------------
function startQuiz(category) {
  currentCategory = category;
  currentQuestions = quizzes[category] || [];
  
  if (currentQuestions.length === 0) {
    alert("इस कैटेगरी में अभी सवाल नहीं हैं! AI से बनवाओ या questions.js में ऐड करो।");
    return;
  }
  
  currentIndex = 0;
  score = 0;
  document.getElementById('home').style.display = 'none';
  document.getElementById('quiz-section').style.display = 'block';
  
  loadQuestion();
  startTimer(30 * 60); // 30 मिनट टाइमर
}

// --------------------------
// सवाल लोड करना
// --------------------------
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

  // Bookmark बटन
  document.getElementById('bookmark-btn').onclick = () => {
    if (!savedQuestions.some(sq => sq.question === q.question)) {
      savedQuestions.push(q);
      alert("सवाल Saved हो गया!");
      updateSavedCount();
    } else {
      alert("ये सवाल पहले से Saved है!");
    }
  };
}

// --------------------------
// ऑप्शन चुनना
// --------------------------
function selectOption(selectedIndex, btn) {
  const correctIndex = currentQuestions[currentIndex].correct;
  
  // हाइलाइट (ऑप्शनल)
  // btn.style.background = (selectedIndex === correctIndex) ? '#d4edda' : '#f8d7da';

  if (selectedIndex === correctIndex) score++;
  
  currentIndex++;
  if (currentIndex < currentQuestions.length) {
    loadQuestion();
  } else {
    endQuiz();
  }
}

// --------------------------
// टाइमर शुरू
// --------------------------
function startTimer(seconds) {
  let timeLeft = seconds;
  timerInterval = setInterval(() => {
    timeLeft--;
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    document.getElementById('time-left').innerText = `\( {min}: \){sec < 10 ? '0' : ''}${sec}`;
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endQuiz();
    }
  }, 1000);
}

// --------------------------
// क्विज खत्म
// --------------------------
function endQuiz() {
  clearInterval(timerInterval);
  document.getElementById('quiz-section').style.display = 'none';
  document.getElementById('result-section').style.display = 'block';
  
  document.getElementById('final-score').innerText = score;
  document.getElementById('final-total').innerText = currentQuestions.length;
  document.getElementById('percent').innerText = ((score / currentQuestions.length) * 100).toFixed(1);
}

// --------------------------
// रीस्टार्ट
// --------------------------
function restartQuiz() {
  document.getElementById('result-section').style.display = 'none';
  document.getElementById('home').style.display = 'block';
  clearInterval(timerInterval);
}

// --------------------------
// Saved सवाल दिखाना / प्रैक्टिस
// --------------------------
function showSaved() {
  if (savedQuestions.length === 0) {
    alert("कोई saved सवाल नहीं है!");
    return;
  }
  currentQuestions = savedQuestions;
  currentIndex = 0;
  score = 0;
  document.getElementById('home').style.display = 'none';
  document.getElementById('quiz-section').style.display = 'block';
  loadQuestion();
  startTimer(30 * 60);
}

// --------------------------
// Saved क्लियर
// --------------------------
function clearSaved() {
  if (confirm("सारे saved सवाल डिलीट करें?")) {
    savedQuestions = [];
    updateSavedCount();
  }
}

// --------------------------
// डार्क मोड टॉगल
// --------------------------
if (themeToggle) {
  themeToggle.onclick = () => {
    document.body.classList.toggle('dark');
    themeToggle.innerHTML = document.body.classList.contains('dark') 
      ? '<i class="fas fa-sun"></i> लाइट मोड' 
      : '<i class="fas fa-moon"></i> डार्क मोड';
  };
}

// --------------------------
// Groq API से सवाल जनरेट (AI बटन के लिए)
// --------------------------
async function generateQuestionsFromGroq() {
  const apiKeyInput = document.getElementById('api-key'); // अगर तुमने input फील्ड ऐड किया है
  const apiKey = apiKeyInput ? apiKeyInput.value.trim() : prompt("Groq API Key डालो (gsk_ से शुरू):");

  if (!apiKey || !apiKey.startsWith('gsk_')) {
    alert("सही Groq API Key डालो!");
    return;
  }

  const topic = prompt("किस टॉपिक पर सवाल बनवाना है? (उदा. SSC CGL GK, Reasoning, Math)") || "SSC CGL General Knowledge";

  alert("AI से सवाल बन रहे हैं... (कुछ सेकंड लगेंगे)");

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content: `तुम एक MCQ जनरेटर हो। सिर्फ VALID JSON दो। कोई एक्स्ट्रा टेक्स्ट मत डालना।
            फॉर्मेट: {"questions": [{"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correct": 0}]} 
            correct: 0 = A, 1 = B, 2 = C, 3 = D
            ठीक 10 सवाल हिंदी में बनाओ।`
          },
          {
            role: "user",
            content: `टॉपिक: ${topic}. 10 MCQ बनाओ।`
          }
        ],
        temperature: 0.5,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API एरर: ${response.status} - ${err}`);
    }

    const data = await response.json();
    let raw = data.choices[0].message.content.trim();

    let newQs;
    try {
      newQs = JSON.parse(raw).questions;
    } catch (e) {
      alert("AI ने JSON नहीं दिया, लेकिन ये रॉ आउटपुट है:\n\n" + raw);
      console.log("Raw AI Response:", raw);
      return;
    }

    if (!newQs || newQs.length === 0) {
      alert("कोई सवाल नहीं मिला।");
      return;
    }

    // नए सवाल quizzes में ऐड करो (या नई कैटेगरी में)
    if (!quizzes.aiGenerated) quizzes.aiGenerated = [];
    quizzes.aiGenerated.push(...newQs);

    alert(`AI ने ${newQs.length} सवाल बना दिए! अब "aiGenerated" कैटेगरी से खेलो।`);

    // अगर तुम्हारी साइट में कैटेगरी बटन है, तो मैन्युअली "aiGenerated" बटन ऐड कर सकते हो index.html में
    console.log("नए सवाल:", newQs);

  } catch (error) {
    alert("Groq API में समस्या: " + error.message + "\nConsole देखो (F12)");
    console.error("Groq Error:", error);
  }
}

// --------------------------
// इनिशियलाइजेशन
// --------------------------
updateSavedCount();
console.log("script.js लोड हो गया। Groq बटन यूज करने के लिए generateQuestionsFromGroq() कॉल करो।");
