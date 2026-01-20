// Estado del quiz
let currentQuestion = 0;
let selectedAnswers = [];
let score = 0;

// Elementos del DOM
const welcomeScreen = document.getElementById('welcome-screen');
const quizContainer = document.getElementById('quiz-container');
const resultsScreen = document.getElementById('results-screen');

const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');
const nextBtn = document.getElementById('next-btn');
const startBtn = document.getElementById('start-btn');

const scoreDisplay = document.getElementById('score-display');
const scoreMessage = document.getElementById('score-message');
const answersList = document.getElementById('answers-list');

// Claves para localStorage
const STORAGE_KEY_SCORE = 'miriam_birthday_quiz_score';
const STORAGE_KEY_ANSWERS = 'miriam_birthday_quiz_answers';

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  createFloatingDecorations();

  const savedScore = getSavedScore();
  if (savedScore !== null) {
    showSavedResults(savedScore);
  } else {
    showWelcomeScreen();
  }
});

// Obtener puntuación guardada
function getSavedScore() {
  const saved = localStorage.getItem(STORAGE_KEY_SCORE);
  return saved !== null ? parseInt(saved, 10) : null;
}

// Obtener respuestas guardadas
function getSavedAnswers() {
  const saved = localStorage.getItem(STORAGE_KEY_ANSWERS);
  return saved !== null ? JSON.parse(saved) : null;
}

// Guardar puntuación y respuestas
function saveResults(score, answers) {
  localStorage.setItem(STORAGE_KEY_SCORE, score.toString());
  localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(answers));
}

// Mostrar pantalla de bienvenida
function showWelcomeScreen() {
  welcomeScreen.classList.remove('hidden');
  quizContainer.classList.remove('active');
  resultsScreen.classList.remove('active');
}

// Mostrar resultados guardados (cuando el usuario vuelve)
function showSavedResults(savedScore) {
  welcomeScreen.classList.add('hidden');
  quizContainer.classList.remove('active');
  resultsScreen.classList.add('active');

  scoreDisplay.textContent = `${savedScore}/${questions.length}`;
  scoreMessage.textContent = getScoreMessage(savedScore);

  // Mostrar resumen de respuestas con las respuestas guardadas
  const savedAnswers = getSavedAnswers();
  displayAnswersSummary(savedAnswers);

  // Lanzar confetti de nuevo
  triggerConfetti();
}

// Mostrar resumen de respuestas correctas
function displayAnswersSummary(userAnswers) {
  answersList.innerHTML = '';

  questions.forEach((q, index) => {
    const item = document.createElement('div');
    item.className = 'answer-item';

    const userAnswer = userAnswers ? userAnswers[index] : null;
    const isCorrect = userAnswer === q.correct;

    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.textContent = `${index + 1}. ${q.question}`;

    item.appendChild(questionDiv);

    // Si el usuario respondió incorrectamente, mostrar su respuesta en rojo
    if (userAnswers && !isCorrect) {
      const wrongDiv = document.createElement('div');
      wrongDiv.className = 'wrong-answer';
      wrongDiv.textContent = `✗ ${q.answers[userAnswer]}`;
      item.appendChild(wrongDiv);
    }

    const answerDiv = document.createElement('div');
    answerDiv.className = 'correct-answer';
    answerDiv.textContent = `✓ ${q.answers[q.correct]}`;

    item.appendChild(answerDiv);
    answersList.appendChild(item);
  });
}

// Iniciar el quiz
function startQuiz() {
  currentQuestion = 0;
  selectedAnswers = [];
  score = 0;

  welcomeScreen.classList.add('hidden');
  quizContainer.classList.add('active');

  displayQuestion(currentQuestion);
}

// Mostrar pregunta actual
function displayQuestion(index) {
  const question = questions[index];

  // Actualizar progreso
  const progress = ((index) / questions.length) * 100;
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Pregunta ${index + 1} de ${questions.length}`;

  // Mostrar pregunta con animación
  questionText.style.animation = 'none';
  questionText.offsetHeight; // Trigger reflow
  questionText.style.animation = 'slideIn 0.4s ease-out';
  questionText.textContent = question.question;

  // Limpiar y mostrar respuestas
  answersContainer.innerHTML = '';
  question.answers.forEach((answer, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = answer;
    btn.onclick = () => selectAnswer(i);
    btn.style.animation = 'none';
    btn.offsetHeight;
    btn.style.animation = `slideIn 0.4s ease-out ${0.1 * (i + 1)}s both`;
    answersContainer.appendChild(btn);
  });

  // Deshabilitar botón siguiente
  nextBtn.disabled = true;

  // Cambiar texto del botón en la última pregunta
  if (index === questions.length - 1) {
    nextBtn.textContent = '¡Ver resultados!';
  } else {
    nextBtn.textContent = 'Siguiente';
  }
}

// Seleccionar respuesta
function selectAnswer(answerIndex) {
  selectedAnswers[currentQuestion] = answerIndex;

  // Actualizar estilos de botones
  const buttons = answersContainer.querySelectorAll('.answer-btn');
  buttons.forEach((btn, i) => {
    btn.classList.remove('selected');
    if (i === answerIndex) {
      btn.classList.add('selected');
    }
  });

  // Habilitar botón siguiente
  nextBtn.disabled = false;
}

// Siguiente pregunta
function nextQuestion() {
  if (selectedAnswers[currentQuestion] === undefined) return;

  currentQuestion++;

  if (currentQuestion < questions.length) {
    displayQuestion(currentQuestion);
  } else {
    showResults();
  }
}

// Calcular puntuación
function calculateScore() {
  let correct = 0;
  questions.forEach((question, index) => {
    if (selectedAnswers[index] === question.correct) {
      correct++;
    }
  });
  return correct;
}

// Obtener mensaje según puntuación
function getScoreMessage(score) {
  const total = questions.length;
  const percentage = (score / total) * 100;

  if (percentage === 100) {
    return "¡PERFECTO! ¡Eres el/la mejor amig@! 🏆";
  } else if (percentage >= 80) {
    return "¡Increíble! Eres casi expert@ en Miriam 🎉";
  } else if (percentage >= 55) {
    return "¡Muy bien! Conoces bastante a Miriam 😊";
  } else if (percentage >= 30) {
    return "¡No está mal! Pero puedes mejorar 🤔";
  } else {
    return "¡Necesitas conocer mejor a Miriam! 😅";
  }
}

// Mostrar resultados
function showResults() {
  score = calculateScore();

  quizContainer.classList.remove('active');
  resultsScreen.classList.add('active');

  // Completar barra de progreso
  progressFill.style.width = '100%';

  scoreDisplay.textContent = `${score}/${questions.length}`;
  scoreMessage.textContent = getScoreMessage(score);

  // Mostrar resumen de respuestas
  displayAnswersSummary(selectedAnswers);

  // Lanzar confetti
  triggerConfetti();

  // Guardar puntuación y respuestas
  saveResults(score, selectedAnswers);
}

// Efecto de confetti
function triggerConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const colors = ['#4a7c23', '#6b9b37', '#2d5016', '#8b7355', '#3d5c1b', '#a08060'];
  const shapes = ['circle', 'square', 'triangle'];

  for (let i = 0; i < 150; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';

      // Formas variadas
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      if (shape === 'circle') {
        confetti.style.borderRadius = '50%';
      } else if (shape === 'triangle') {
        confetti.style.width = '0';
        confetti.style.height = '0';
        confetti.style.backgroundColor = 'transparent';
        confetti.style.borderLeft = '5px solid transparent';
        confetti.style.borderRight = '5px solid transparent';
        confetti.style.borderBottom = `10px solid ${colors[Math.floor(Math.random() * colors.length)]}`;
      }

      // Tamaño variable
      const size = Math.random() * 10 + 5;
      if (shape !== 'triangle') {
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
      }

      container.appendChild(confetti);
    }, i * 20);
  }

  // Limpiar después de la animación
  setTimeout(() => {
    container.remove();
  }, 6000);
}

// Crear decoraciones flotantes
function createFloatingDecorations() {
  const container = document.createElement('div');
  container.className = 'floating-decorations';
  document.body.appendChild(container);

  const emojis = ['🧅', '🫏', '🐉', '👸', '🏰', '🧙', '🌲', '💚'];

  for (let i = 0; i < 15; i++) {
    const decoration = document.createElement('div');
    decoration.className = 'decoration';
    decoration.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    decoration.style.left = Math.random() * 100 + '%';
    decoration.style.top = Math.random() * 100 + '%';
    decoration.style.animationDelay = Math.random() * 5 + 's';
    decoration.style.animationDuration = (Math.random() * 3 + 4) + 's';
    container.appendChild(decoration);
  }
}

// Event listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
