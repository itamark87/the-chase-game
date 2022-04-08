'use strict';

// Selecting elements
const questionTxt = document.querySelector('.question-txt');
const questionHeader = document.querySelector('.question-num');
const scoreTxt = document.querySelector('#box--0');
const difficulty = document.querySelector('.difficulty');
const timer = document.querySelector('#box--1');
const modal = document.querySelector('.modal');
const modalHeader = document.querySelector('.modal-header');
const herman = document.querySelector('#img-herman');
const overlay = document.querySelector('.overlay');
const confetti = document.querySelector('.confetti');
const nextBtn = document.querySelector('#btn--next');
const startBtn = document.querySelector('#btn--start');
const fiftyBtn = document.querySelector('#btn--fifty');
const timerBtn = document.querySelector('#btn--timer');
const buttons = [];
for (let i = 0; i < 4; i++) {
  buttons[i] = document.querySelector('#btn--' + i);
}

// Event listeners
startBtn.addEventListener('click', startGame);

overlay.addEventListener('click', function () {
  if (overlay.getAttribute('disabled') == 'false') {
    startGame();
  }
});

for (let i = 0; i < 4; i++) {
  buttons[i].addEventListener('click', answerClick);
}

nextBtn.addEventListener('click', function () {
  if (turn === 19) {
    finishGame();
  } else {
    turn++;
    nextTurn();
  }
});

fiftyBtn.addEventListener('click', cutAnswers);
timerBtn.addEventListener('click', holdTimer);

// Variables
let turn = 0;
let score = 0;
let fifty;
let timerStops;
let questions = [];
let correctAnswer;
let timeOut;
let multiplier;

const colors = {
  win: 'linear-gradient(to top left, #04631c 0%, #022c0b 100%)',
  defeat: 'linear-gradient(to top left, #7e0202 0%, #2c0202 100%)',
  green: '#17d61099',
  red: '#d6101099',
  white: '#ddd',
  grey: '#ffffff99',
};

// Holds timer when timer button is clicked
function holdTimer() {
  clearTimeout(timeOut);
  multiplier = 1;
  timerStops -= 1;
  timerBtn.textContent = `⏰ x ${timerStops}`;
  timerBtn.disabled = true;
}

// Hides two random answers when angel button is clicked
function cutAnswers() {
  const incorrectIdx = [];
  for (let i = 0; i < 4; i++) {
    if (i !== correctAnswer) {
      incorrectIdx.push(i);
    }
  }
  shuffleAnswers(incorrectIdx);
  buttons[incorrectIdx[0]].style.display = 'none';
  buttons[incorrectIdx[1]].style.display = 'none';
  fifty -= 1;
  fiftyBtn.textContent = `👼 x ${fifty}`;
  fiftyBtn.disabled = true;
}

// Executes if game is finished
// Styles modal and layout with win if escaped or with red screen if caught
function finishGame() {
  if (score > 250) {
    confetti.classList.remove('hidden');
    modalHeader.textContent = 'YOU ESCAPED FROM THE CHASER! 🎉';
    modal.style.backgroundImage = colors.win;
    herman.src = 'sad.jpg';
  } else {
    confetti.classList.add('hidden');
    modalHeader.textContent = 'YOU WERE CAUGHT BY THE CHASER ☠';
    modal.style.backgroundImage = colors.defeat;
    herman.src = 'happy.jpg';
  }
  resetGame();
}

// Executes if one of the answer buttons is clicked
// Checks if answer is correct and handles score change
function answerClick(evt) {
  clearTimeout(timeOut);
  finishQuestion();
  const answerNum = evt.currentTarget.id.slice(-1);
  if (answerNum == correctAnswer) {
    buttons[answerNum].style.background = colors.green;
    const add = Math.ceil(Number(timer.textContent) * multiplier);
    score += add;
    scoreTxt.textContent = `+${add}`;
    scoreTxt.style.color = 'rgba(255, 0, 0, 0.4)';
    startTimer(2, 'score');
  } else {
    buttons[correctAnswer].style.background = colors.red;
  }
}

// Disables/Enables relevant buttons after question is answered
function finishQuestion() {
  fiftyBtn.disabled = true;
  timerBtn.disabled = true;
  nextBtn.disabled = false;
  for (let i = 0; i < 4; i++) {
    buttons[i].disabled = true;
  }
}

// Displays score in score box
function showScore() {
  scoreTxt.style.color = colors.white;
  scoreTxt.textContent = score;
}

// General timer function, in use for both timer box and score box
function startTimer(x, box) {
  if (box === 'timer') {
    timer.textContent = x;
  }
  if (x === 0) {
    if (box === 'timer') {
      finishQuestion();
      buttons[correctAnswer].style.background = colors.red;
    } else {
      showScore();
    }
    return;
  }
  timeOut = setTimeout(startTimer, 1000, --x, box);
  return;
}

// Displays answer on buttons and enables clicking
function setAnswers(answers) {
  if (timerStops > 0) {
    timerBtn.disabled = false;
  }
  if (answers.length === 2) {
    buttons[0].textContent = '1. True';
    buttons[1].textContent = '2. False';
    buttons[2].style.display = 'none';
    buttons[3].style.display = 'none';
    fiftyBtn.disabled = true;
  } else {
    if (fifty > 0) {
      fiftyBtn.disabled = false;
    }
    for (let i = 0; i < 4; i++) {
      buttons[i].textContent = `${String(i + 1)}. ${htmlDecode(answers[i])}`;
    }
  }
}

// Decodes html special characters
function htmlDecode(s) {
  var el = document.createElement('div');
  el.innerHTML = el.textContent = s;
  s = el.innerText;
  return s;
}

// Shuffles array if it has over 2 items
function shuffleAnswers(array) {
  if (array.length === 2) {
    array[0] = 'True';
    array[1] = 'False';
  } else {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
}

// All settings for new question begin from here
function setNewQuestion(question) {
  for (let i = 0; i < 4; i++) {
    buttons[i].style.background = colors.grey;
    buttons[i].disabled = false;
    buttons[i].style.display = 'block';
  }
  const answers = [...question.incorrect_answers];
  answers.push(question.correct_answer);
  shuffleAnswers(answers);
  correctAnswer = answers.indexOf(question.correct_answer);
  questionHeader.textContent = 'Question #' + (turn + 1);
  questionTxt.textContent = htmlDecode(question.question);
  setAnswers(answers);
  if (question.difficulty === 'easy') {
    multiplier = 1;
  } else if (question.difficulty === 'medium') {
    multiplier = 1.15;
  } else {
    multiplier = 1.25;
  }
  difficulty.textContent = `Difficulty: ${question.difficulty} (x${multiplier})`;
}

// Sets next turn and starts timer
function nextTurn() {
  nextBtn.disabled = true;
  if (turn === 19) {
    nextBtn.textContent = 'finish game';
  }
  setNewQuestion(questions[turn]);
  showScore();
  clearTimeout(timeOut);
  startTimer(30, 'timer');
}

// Removes modal and overlay and begins first turn
function startGame() {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
  nextTurn();
}

// Enables elements that start the game
function enableBtns() {
  startBtn.textContent = 'play';
  startBtn.disabled = false;
  overlay.setAttribute('disabled', 'false');
}

// Loads data from opentdb
function loadQuestions() {
  const myRequest = new Request('https://opentdb.com/api.php?amount=20');
  fetch(myRequest)
    .then(response => response.json())
    .then(data => {
      questions = [...data.results];
      enableBtns();
    });
}

// Resets all configurations and display settings
function resetGame() {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
  overlay.setAttribute('disabled', 'true');
  startBtn.textContent = 'loading data...';
  startBtn.disabled = true;
  nextBtn.textContent = 'next question';
  nextBtn.disabled = true;
  fifty = 3;
  fiftyBtn.disabled = true;
  fiftyBtn.textContent = `👼 x ${fifty}`;
  timerStops = 3;
  timerBtn.disabled = true;
  timerBtn.textContent = `⏰ x ${timerStops}`;
  turn = 0;
  score = 0;
  scoreTxt.textContent = '0';
  questionHeader.textContent = 'question #1';
  questionTxt.textContent = 'Loading Question...';
  difficulty.textContent = 'Difficulty: ';
  for (let i = 0; i < 4; i++) {
    buttons[i].textContent = 'Loading...';
  }
  loadQuestions();
}

resetGame();
