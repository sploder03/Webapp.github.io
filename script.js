let level = 0;
let currentQuestion = 0;
let score = 0;
let questions = [];
let timer;
let quizActive = false;

// Audio elements
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const tickingSound = document.getElementById('ticking-sound');
const confettiSound = document.getElementById('confetti-sound');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion(level) {
  let num1, num2, question, answer;
  const operations = ['+', '-', '*', '/'];

  if (level === 0) {
    num1 = getRandomInt(1, 12);
    num2 = getRandomInt(1, 12);
    answer = num1 + num2;
    question = `${num1} + ${num2}`;
  } else if (level === 1) {
    num1 = getRandomInt(1, 12);
    num2 = getRandomInt(1, 12);
    const operation = ['+', '-'][getRandomInt(0, 1)];
    if (operation === '+') {
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
    } else {
      if (num1 < num2) [num1, num2] = [num2, num1];
      answer = num1 - num2;
      question = `${num1} - ${num2}`;
    }
  } else if (level === 2) {
    num1 = getRandomInt(1, 12);
    num2 = getRandomInt(1, 12);
    const operation = operations[getRandomInt(0, operations.length - 1)];
    if (operation === '+') {
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
    } else if (operation === '-') {
      if (num1 < num2) [num1, num2] = [num2, num1];
      answer = num1 - num2;
      question = `${num1} - ${num2}`;
    } else if (operation === '*') {
      answer = num1 * num2;
      question = `${num1} * ${num2}`;
    } else if (operation === '/') {
      while (num2 === 0 || num1 % num2 !== 0) {
        num1 = getRandomInt(1, 12);
        num2 = getRandomInt(1, 12);
      }
      answer = num1 / num2;
      question = `${num1} / ${num2}`;
    }
  }

  return { question, answer };
}

function startQuiz(selectedLevel) {
  level = selectedLevel;
  currentQuestion = 0;
  score = 0;
  questions = [];
  quizActive = false;

  // Reset all sounds
  correctSound.pause();
  wrongSound.pause();
  tickingSound.pause();
  confettiSound.pause();
  [correctSound, wrongSound, tickingSound, confettiSound].forEach(sound => {
    sound.currentTime = 0;
  });

  document.getElementById('level-selection').classList.add('hidden');
  document.getElementById('quiz-section').classList.remove('hidden');
  document.getElementById('result-section').classList.add('hidden');
  document.getElementById('score-value').innerText = score;
  document.getElementById('current-level').innerText = level;

  loadQuestion();
}

function startTimer() {
  const timerDisplay = document.getElementById('timer');

  if (level === 0) {
    timerDisplay.classList.add('hidden');
    timerDisplay.classList.remove('warning');
    return;
  }

  let timeLeft = level === 1 ? 20 : 10;
  timerDisplay.classList.remove('hidden');
  timerDisplay.innerText = `Time left: ${timeLeft}s`;
  timerDisplay.classList.remove('warning');
  tickingSound.pause();
  tickingSound.currentTime = 0;

  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = `Time left: ${timeLeft}s`;

    if (timeLeft <= 5) {
      timerDisplay.classList.add('warning');
      if (timeLeft === 5) {
        tickingSound.currentTime = 0;
        tickingSound.play().catch(e => console.log("Ticking sound error:", e));
      }
    } else {
      timerDisplay.classList.remove('warning');
      tickingSound.pause();
      tickingSound.currentTime = 0;
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      quizActive = false;
      timerDisplay.classList.remove('warning');
      tickingSound.pause();
      tickingSound.currentTime = 0;
      const feedback = document.getElementById('feedback');
      feedback.style.color = 'red';
      feedback.innerText = `Time's up! The correct answer was ${questions[currentQuestion].answer}`;
      document.getElementById('next-question').classList.remove('hidden');
    }
  }, 1000);
}

function loadQuestion() {
  if (currentQuestion >= 10) {
    endQuiz();
    return;
  }

  const q = generateQuestion(level);
  questions[currentQuestion] = q;

  document.getElementById('question-number').innerText = `Question ${currentQuestion + 1}`;
  document.getElementById('question').innerText = q.question;
  document.getElementById('answer').value = '';
  document.getElementById('feedback').innerText = '';
  document.getElementById('next-question').classList.add('hidden');
  quizActive = true;

  document.getElementById('answer').focus();
  startTimer();
}

function checkAnswer() {
  if (!quizActive) return;

  const userInput = document.getElementById('answer').value.trim();
  const feedback = document.getElementById('feedback');

  if (userInput === '' || isNaN(userInput)) {
    feedback.style.color = 'red';
    feedback.innerText = 'Please enter a valid number.';
    return;
  }

  clearInterval(timer);
  quizActive = false;
  tickingSound.pause();
  tickingSound.currentTime = 0;

  const userAnswer = parseInt(userInput);
  const correctAnswer = questions[currentQuestion].answer;

  if (userAnswer === correctAnswer) {
    score++;
    feedback.style.color = 'green';
    feedback.innerText = 'Correct!';
    correctSound.currentTime = 0;
    correctSound.play().catch(e => console.log("Correct sound error:", e));
  } else {
    feedback.style.color = 'red';
    feedback.innerText = `Wrong! The correct answer was ${correctAnswer}`;
    wrongSound.currentTime = 0;
    wrongSound.play().catch(e => console.log("Wrong sound error:", e));
  }

  document.getElementById('score-value').innerText = score;
  document.getElementById('next-question').classList.remove('hidden');
  document.getElementById('timer').classList.remove('warning');
}

function nextQuestion() {
  currentQuestion++;
  loadQuestion();
}

function endQuiz() {
  clearInterval(timer);
  document.getElementById('quiz-section').classList.add('hidden');
  document.getElementById('result-section').classList.remove('hidden');
  document.getElementById('final-score').innerText = score;

  const message = document.getElementById('score-message');
  message.classList.remove('well-done', 'try-again');

  if (score === 10) {
    message.innerText = "Perfect! You're a math whiz! 👑";
    
    // Delay confetti and sound by 1 second (1000ms)
    setTimeout(() => {
      confettiSound.currentTime = 0;
      confettiSound.play().catch(e => console.log("Confetti sound error:", e));
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 1000);
    
  } else if (score >= 7) {
    message.innerText = "Well done! Keep practicing to improve even more. 👍";
  } else {
    message.innerText = "Don't worry, practice makes perfect! ✏️";
  }
}
function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  questions = [];
  quizActive = false;
  clearInterval(timer);

  // Stop all sounds
  correctSound.pause();
  wrongSound.pause();
  tickingSound.pause();
  confettiSound.pause();
  [correctSound, wrongSound, tickingSound, confettiSound].forEach(sound => {
    sound.currentTime = 0;
  });

  document.getElementById('result-section').classList.add('hidden');
  document.getElementById('quiz-section').classList.add('hidden');
  document.getElementById('level-selection').classList.remove('hidden');
  document.getElementById('score-value').innerText = '0';
  document.getElementById('feedback').innerText = '';
  const timerDisplay = document.getElementById('timer');
  timerDisplay.classList.add('hidden');
  timerDisplay.classList.remove('warning');
}

document.getElementById('answer').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    if (quizActive) {
      checkAnswer();
    } else {
      if (!document.getElementById('next-question').classList.contains('hidden')) {
        nextQuestion();
      }
    }
  }
});