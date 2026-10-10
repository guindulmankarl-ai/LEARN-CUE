// LearnCue: child-friendly reading activities for ages 4–7.
// Speech uses the browser/device voice engine; availability varies by device.
const API_BASE = "http://localhost:8080/api";
const storageKey = "learncueProgress";
const initialProgress = { stars: 0, completed: 0, correct: 0, attempts: 0 };
let progress = loadProgress();
let currentQuestion = null;
let answerLocked = false;

function loadProgress() {
  try { return { ...initialProgress, ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; }
  catch { return { ...initialProgress }; }
}
function saveProgress() {
  localStorage.setItem(storageKey, JSON.stringify(progress));
  document.getElementById("starCount").textContent = progress.stars;
  // Optional backend sync. The app still works when Java is not running.
  fetch(`${API_BASE}/progress`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(progress)
  }).catch(() => {});
}
function showPanel(title, eyebrow, html) {
  document.getElementById("panelTitle").textContent = title;
  document.getElementById("panelEyebrow").textContent = eyebrow;
  document.getElementById("panelContent").innerHTML = html;
  document.getElementById("activityPanel").classList.remove("hidden");
  document.getElementById("activityPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}
function closePanel() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  document.getElementById("activityPanel").classList.add("hidden");
}
function earnStar() { progress.stars += 1; progress.completed += 1; saveProgress(); }
function speak(text) {
  if (!("speechSynthesis" in window)) {
    alert("Audio reading is not supported in this browser. Try Chrome or another updated browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.78;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
}
const letters = [
  ["A","apple","🍎","/ă/"],["B","ball","⚽","/b/"],["C","cat","🐱","/k/"],["D","dog","🐶","/d/"],
  ["E","egg","🥚","/ĕ/"],["F","fish","🐟","/f/"],["G","goat","🐐","/g/"],["H","hat","🧢","/h/"],
  ["I","igloo","🏠","/ĭ/"],["J","jam","🍓","/j/"],["K","kite","🪁","/k/"],["L","lion","🦁","/l/"],
  ["M","moon","🌙","/m/"],["N","nest","🪺","/n/"],["O","orange","🍊","/ŏ/"],["P","pig","🐷","/p/"],
  ["Q","queen","👑","/kw/"],["R","rabbit","🐰","/r/"],["S","sun","☀️","/s/"],["T","tree","🌳","/t/"],
  ["U","umbrella","☂️","/ŭ/"],["V","van","🚐","/v/"],["W","whale","🐳","/w/"],["X","x-ray","🩻","/ks/"],
  ["Y","yo-yo","🪀","/y/"],["Z","zebra","🦓","/z/"]
];
const words = [
  { word:"cat", emoji:"🐱", hint:"A cat says meow." },
  { word:"dog", emoji:"🐶", hint:"A dog can bark." },
  { word:"sun", emoji:"☀️", hint:"The sun shines in the sky." },
  { word:"hat", emoji:"🧢", hint:"We can wear a hat." },
  { word:"pig", emoji:"🐷", hint:"A pig is an animal." },
  { word:"bus", emoji:"🚌", hint:"A bus can take people to school." },
  { word:"cup", emoji:"🥤", hint:"We can drink water from a cup." },
  { word:"hen", emoji:"🐔", hint:"A hen is a bird." }
];
const stories = [
  { title:"Mia and the Cat", text:"Mia has a cat. The cat is small. The cat likes to nap on a soft mat.", question:"Where does the cat like to nap?", options:["On a soft mat","In a tree","In a bus"], answer:"On a soft mat" },
  { title:"Ben’s Red Ball", text:"Ben has a red ball. He plays with his ball in the park. Then Ben puts the ball in his bag.", question:"What color is Ben’s ball?", options:["Blue","Red","Green"], answer:"Red" },
  { title:"The Big Sun", text:"The sun is bright. Ana wears a hat. She drinks water after playing outside.", question:"What does Ana wear?", options:["A hat","A crown","A coat"], answer:"A hat" }
];

function renderLetters() {
  showPanel("Meet the letters", "LETTER LAND",
    `<p>Tap a letter to see a word and hear it read aloud.</p><div class="letter-list">${letters.map((l,i)=>
      `<button class="letter-tile" data-letter="${i}">${l[0]}<small>${l[1]}</small></button>`).join("")}</div><div id="letterDetail" class="feedback"></div>`);
  document.querySelectorAll("[data-letter]").forEach(btn => btn.addEventListener("click", () => {
    const l = letters[Number(btn.dataset.letter)];
    const detail = document.getElementById("letterDetail");
    detail.innerHTML = `<div class="big-emoji">${l[2]}</div><div class="question">${l[0]} is for ${l[1]}!</div><p class="feedback">Try the first sound: ${l[3]}</p><button class="read-button" id="sayLetter">🔊 Hear ${l[0]} and ${l[1]}</button>`;
    document.getElementById("sayLetter").addEventListener("click", () => speak(`${l[0]}. ${l[1]}. ${l[1]}.`));
    if (!btn.dataset.seen) { btn.dataset.seen = "yes"; earnStar(); }
  }));
}
function renderWords() {
  const item = words[Math.floor(Math.random()*words.length)];
  currentQuestion = { answer:item.word }; answerLocked = false;
  const choices = shuffle([item.word, ...shuffle(words.filter(w=>w.word!==item.word)).slice(0,2).map(w=>w.word)]);
  showPanel("Little Words", "SAY IT, READ IT",
    `<div class="practice-card"><div class="big-emoji">${item.emoji}</div><p class="question">Which word matches this picture?</p><button class="read-button" id="hearWord">🔊 Hear the word</button><div class="answer-options">${choices.map(o=>`<button class="answer-button" data-answer="${o}">${o}</button>`).join("")}</div><p class="feedback" id="feedback"></p><p class="small-note" style="text-align:center">${item.hint}</p><div class="answer-options"><button class="primary-button" id="nextWord">Another word →</button></div></div>`);
  document.getElementById("hearWord").addEventListener("click",()=>speak(item.word));
  bindAnswers(); document.getElementById("nextWord").addEventListener("click",renderWords);
}
function renderMatch() {
  const item = words[Math.floor(Math.random()*words.length)];
  currentQuestion = { answer:item.word }; answerLocked = false;
  const choices = shuffle([item.word, ...shuffle(words.filter(w=>w.word!==item.word)).slice(0,2).map(w=>w.word)]);
  showPanel("Picture Match", "FIND THE MATCH",
    `<div class="practice-card"><div class="big-emoji">${item.emoji}</div><p class="question">Tap the word that matches the picture.</p><div class="answer-options">${choices.map(o=>`<button class="answer-button" data-answer="${o}">${o}</button>`).join("")}</div><p class="feedback" id="feedback"></p><div class="answer-options"><button class="primary-button" id="nextMatch">Next picture →</button></div></div>`);
  bindAnswers(); document.getElementById("nextMatch").addEventListener("click",renderMatch);
}
function renderListen() {
  const item = words[Math.floor(Math.random()*words.length)];
  currentQuestion = { answer:item.word }; answerLocked = false;
  const choices = shuffle([item.word, ...shuffle(words.filter(w=>w.word!==item.word)).slice(0,2).map(w=>w.word)]);
  showPanel("Listen & Say", "LISTEN CAREFULLY",
    `<div class="practice-card"><div class="big-emoji">👂</div><p class="question">Listen to the word. Which word did you hear?</p><button class="primary-button" id="playWord">🔊 Play word</button><div class="answer-options" style="margin-top:16px">${choices.map(o=>`<button class="answer-button" data-answer="${o}">${o}</button>`).join("")}</div><p class="feedback" id="feedback"></p><p class="small-note" style="text-align:center">You can listen again before choosing.</p><div class="answer-options"><button class="answer-button" id="nextListen">Try another →</button></div></div>`);
  document.getElementById("playWord").addEventListener("click",()=>speak(item.word));
  bindAnswers(); document.getElementById("nextListen").addEventListener("click",renderListen);
}
function renderComprehension() {
  const story = stories[Math.floor(Math.random()*stories.length)];
  currentQuestion = { answer:story.answer }; answerLocked = false;
  showPanel("Story Time", "READ AND THINK",
    `<div class="practice-card"><h3 style="text-align:center">${story.title}</h3><p class="story-text">${story.text}</p><button class="read-button" id="readStory">🔊 Listen to the story</button><p class="question">${story.question}</p><div class="answer-options">${shuffle([...story.options]).map(o=>`<button class="answer-button" data-answer="${o}">${o}</button>`).join("")}</div><p class="feedback" id="feedback"></p><div class="answer-options"><button class="primary-button" id="nextStory">Another story →</button></div></div>`);
  document.getElementById("readStory").addEventListener("click",()=>speak(`${story.title}. ${story.text} ${story.question}`));
  bindAnswers(); document.getElementById("nextStory").addEventListener("click",renderComprehension);
}
function bindAnswers() {
  document.querySelectorAll("[data-answer]").forEach(btn => btn.addEventListener("click", () => {
    if (answerLocked) return;
    answerLocked = true;
    document.querySelectorAll("[data-answer]").forEach(b => b.disabled = true);
    progress.attempts += 1;
    const feedback = document.getElementById("feedback");
    if (btn.dataset.answer === currentQuestion.answer) {
      feedback.textContent = "Great job! ⭐ You got it right!";
      feedback.className = "feedback good"; progress.correct += 1; earnStar();
    } else {
      feedback.textContent = `Good try! The answer is “${currentQuestion.answer}”. Try another one!`;
      feedback.className = "feedback try-again"; saveProgress();
    }
  }));
}
function renderProgress() {
  showPanel("My Progress", "LOOK HOW FAR YOU'VE COME",
    `<div class="progress-stats"><div class="stat"><strong>${progress.stars} ⭐</strong><span>Stars earned</span></div><div class="stat"><strong>${progress.completed}</strong><span>Activities completed</span></div><div class="stat"><strong>${progress.correct}/${progress.attempts}</strong><span>Correct answers</span></div></div><p class="feedback">Keep practicing. Every little step counts! 🌱</p><div class="answer-options"><button class="answer-button" id="resetProgress">Reset progress</button></div>`);
  document.getElementById("resetProgress").addEventListener("click", () => {
    if (confirm("Reset all progress on this device?")) { progress = { ...initialProgress }; saveProgress(); renderProgress(); }
  });
}
function shuffle(array) {
  for (let i=array.length-1; i>0; i--) { const j=Math.floor(Math.random()*(i+1)); [array[i],array[j]]=[array[j],array[i]]; }
  return array;
}
function openView(view) {
  if (view==="letters") renderLetters();
  if (view==="words") renderWords();
  if (view==="match") renderMatch();
  if (view==="listen") renderListen();
  if (view==="comprehension") renderComprehension();
  if (view==="progress") renderProgress();
}
document.querySelectorAll("[data-view]").forEach(button=>button.addEventListener("click",()=>openView(button.dataset.view)));
document.getElementById("startButton").addEventListener("click",()=>openView("letters"));
document.getElementById("closePanel").addEventListener("click",closePanel);
document.getElementById("starCount").textContent = progress.stars;
