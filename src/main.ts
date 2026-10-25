import './style.css';
import type { GamePhase, Level, LevelsData } from './types';

const BASE = import.meta.env.BASE_URL;

const LIVES_START = 3;
const SCORE_PER_LEVEL = 100;
const STREAK_BONUS = 25;
const MISS_PENALTY_SEC = 3;

interface GameState {
  phase: GamePhase;
  levels: Level[];
  levelIndex: number;
  lives: number;
  score: number;
  streak: number;
  timeLeft: number;
  timerId: ReturnType<typeof setInterval> | null;
  lastGain?: number;
  failReason?: 'time' | 'miss';
}

const state: GameState = {
  phase: 'start',
  levels: [],
  levelIndex: 0,
  lives: LIVES_START,
  score: 0,
  streak: 0,
  timeLeft: 0,
  timerId: null,
};

const app = document.querySelector<HTMLDivElement>('#app')!;

function clearTimer(): void {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function hearts(n: number): string {
  return '♥'.repeat(n) + '♡'.repeat(Math.max(0, LIVES_START - n));
}

function renderHeader(): string {
  if (state.phase === 'start') {
    return `<header class="game-header"><div class="logo"><span>🐱</span> Find the Cat</div></header>`;
  }
  const urgent = state.timeLeft <= 5 ? ' urgent' : '';
  return `
    <header class="game-header">
      <div class="logo"><span>🐱</span> Find the Cat</div>
      <div class="hud">
        <div class="pill">Lvl ${state.levelIndex + 1}/${state.levels.length}</div>
        <div class="pill timer${urgent}">⏱ ${state.timeLeft}s</div>
        <div class="pill lives"><span class="heart">${hearts(state.lives)}</span></div>
        <div class="pill">⭐ ${state.score}</div>
      </div>
    </header>`;
}

function renderStart(): string {
  return `
    <main>
      <div class="panel">
        <h1>Find the Cat</h1>
        <p class="subtitle">Dense hidden-object scenes — spot the tiny cat before time runs out.</p>
        <div class="rules">
          <strong>How to play</strong>
          <ul>
            <li>Each level asks: <strong>Can you find the Cat within 10 seconds?</strong> (later levels get a bit more time).</li>
            <li>Tap the hidden cat in the busy scene before the timer hits zero.</li>
            <li>You start with <strong>${LIVES_START} lives</strong>. A wrong tap or timeout costs one life and replays the level.</li>
            <li>Find the cat to earn <strong>${SCORE_PER_LEVEL} points</strong>, plus <strong>+${STREAK_BONUS}</strong> per streak level.</li>
            <li>Wrong clicks also shave <strong>${MISS_PENALTY_SEC}s</strong> off the clock — hurry!</li>
          </ul>
        </div>
        <button type="button" class="btn" data-action="start">Play</button>
      </div>
    </main>`;
}

function renderPlaying(): string {
  const level = state.levels[state.levelIndex];
  const imgSrc = `${BASE}${level.image.replace(/^\//, '')}`;
  return `
    <main>
      <p class="challenge-prompt">Can you find the Cat within <strong>${level.countdown}</strong> seconds?</p>
      <p class="level-title">Level ${level.id}: <strong>${level.name}</strong></p>
      <div class="scene-wrap" data-scene role="button" tabindex="0" aria-label="Scene: tap to find the cat">
        <img src="${imgSrc}" alt="${level.name} — find the hidden cat" draggable="false" />
      </div>
    </main>`;
}

function renderOverlay(title: string, message: string, kind: 'success' | 'fail', action: string, label: string): string {
  return `
    <div class="overlay" data-overlay>
      <div class="overlay-card ${kind}">
        <h2>${title}</h2>
        <p>${message}</p>
        <button type="button" class="btn" data-action="${action}">${label}</button>
      </div>
    </div>`;
}

function renderGameOver(): string {
  return `
    <main>
      <div class="panel">
        <h1>Game Over</h1>
        <p class="subtitle">Final score: <strong>${state.score}</strong></p>
        <button type="button" class="btn" data-action="restart">Try Again</button>
      </div>
    </main>`;
}

function renderVictory(): string {
  return `
    <main>
      <div class="panel">
        <h1>You found them all! 🎉</h1>
        <p class="subtitle">Score: <strong>${state.score}</strong> — true cat detective.</p>
        <button type="button" class="btn" data-action="restart">Play Again</button>
      </div>
    </main>`;
}

function spawnConfetti(): void {
  const colors = ['#ff9f43', '#feca57', '#2ecc71', '#e74c3c', '#a29bfe'];
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = '-10px';
    el.style.background = colors[i % colors.length];
    el.style.animationDelay = `${Math.random() * 0.3}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }
}

function render(): void {
  clearTimer();

  let body = '';
  let overlay = '';

  switch (state.phase) {
    case 'start':
      body = renderStart();
      break;
    case 'playing':
      body = renderPlaying();
      startTimer();
      break;
    case 'success':
      body = renderPlaying();
      overlay = renderOverlay('Found!', `+${state.lastGain ?? SCORE_PER_LEVEL} points`, 'success', 'next', 'Next level');
      break;
    case 'fail':
      body = renderPlaying();
      overlay = renderOverlay(
        state.failReason === 'time' ? "Time's up!" : 'Miss!',
        state.lives > 0 ? `${state.lives} ${state.lives === 1 ? 'life' : 'lives'} left` : 'No lives left',
        'fail',
        state.lives > 0 ? 'retry' : 'gameover',
        state.lives > 0 ? 'Try again' : 'See score'
      );
      break;
    case 'gameover':
      body = renderGameOver();
      break;
    case 'victory':
      body = renderVictory();
      break;
  }

  app.innerHTML = `${renderHeader()}${body}<footer>Tap scenes · Mobile friendly · ${state.levels.length} levels</footer>${overlay}`;
  bindEvents();
}

function startTimer(): void {
  const level = state.levels[state.levelIndex];
  if (state.timeLeft <= 0) state.timeLeft = level.countdown;
  clearTimer();
  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      handleFail('time');
      return;
    }
    updateHudTimer();
  }, 1000);
}

function updateHudTimer(): void {
  const pill = document.querySelector('.pill.timer');
  if (!pill) return;
  const urgent = state.timeLeft <= 5;
  pill.textContent = `⏱ ${state.timeLeft}s`;
  pill.classList.toggle('urgent', urgent);
}

function hitTest(level: Level, nx: number, ny: number): boolean {
  const { x, y, w, h } = level.hitBox;
  return nx >= x && nx <= x + w && ny >= y && ny <= y + h;
}

function pointerToNormalized(scene: HTMLElement, clientX: number, clientY: number): { nx: number; ny: number } {
  const rect = scene.getBoundingClientRect();
  const nx = (clientX - rect.left) / rect.width;
  const ny = (clientY - rect.top) / rect.height;
  return { nx, ny };
}

function handleSceneClick(clientX: number, clientY: number): void {
  if (state.phase !== 'playing') return;
  const scene = document.querySelector<HTMLElement>('[data-scene]');
  if (!scene) return;
  const level = state.levels[state.levelIndex];
  const { nx, ny } = pointerToNormalized(scene, clientX, clientY);
  if (hitTest(level, nx, ny)) {
    handleSuccess();
  } else {
    handleMiss();
  }
}

function handleSuccess(): void {
  clearTimer();
  const gain = SCORE_PER_LEVEL + state.streak * STREAK_BONUS;
  state.score += gain;
  state.streak += 1;
  state.lastGain = gain;
  state.phase = 'success';
  spawnConfetti();
  render();
}

function handleMiss(): void {
  state.timeLeft = Math.max(0, state.timeLeft - MISS_PENALTY_SEC);
  const scene = document.querySelector('.scene-wrap');
  scene?.classList.add('miss-flash');
  setTimeout(() => scene?.classList.remove('miss-flash'), 350);
  if (state.timeLeft <= 0) {
    handleFail('miss');
  } else {
    updateHudTimer();
  }
}

function handleFail(reason: 'time' | 'miss'): void {
  clearTimer();
  state.streak = 0;
  state.lives -= 1;
  state.failReason = reason;
  if (state.lives <= 0) {
    state.phase = 'fail';
    render();
    return;
  }
  state.phase = 'fail';
  render();
}

function beginLevel(index: number, resetTimer = true): void {
  state.levelIndex = index;
  state.phase = 'playing';
  if (resetTimer) {
    state.timeLeft = state.levels[index].countdown;
  }
  render();
}

function resetGame(): void {
  clearTimer();
  state.levelIndex = 0;
  state.lives = LIVES_START;
  state.score = 0;
  state.streak = 0;
  state.timeLeft = 0;
  state.phase = 'start';
  render();
}

function bindEvents(): void {
  app.querySelector('[data-action="start"]')?.addEventListener('click', () => beginLevel(0));

  app.querySelector('[data-action="restart"]')?.addEventListener('click', () => resetGame());

  app.querySelector('[data-action="next"]')?.addEventListener('click', () => {
    const next = state.levelIndex + 1;
    if (next >= state.levels.length) {
      clearTimer();
      state.phase = 'victory';
      spawnConfetti();
      render();
    } else {
      beginLevel(next);
    }
  });

  app.querySelector('[data-action="retry"]')?.addEventListener('click', () => {
    beginLevel(state.levelIndex);
  });

  app.querySelector('[data-action="gameover"]')?.addEventListener('click', () => {
    clearTimer();
    state.phase = 'gameover';
    render();
  });

  const scene = app.querySelector<HTMLElement>('[data-scene]');
  if (scene) {
    const onPointer = (e: PointerEvent) => {
      e.preventDefault();
      handleSceneClick(e.clientX, e.clientY);
    };
    scene.addEventListener('pointerdown', onPointer);
    scene.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const rect = scene.getBoundingClientRect();
        handleSceneClick(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    });
  }
}

async function init(): Promise<void> {
  try {
    const res = await fetch(`${BASE}levels.json`);
    if (!res.ok) throw new Error('Failed to load levels');
    const data = (await res.json()) as LevelsData;
    state.levels = data.levels;
  } catch {
    app.innerHTML = `<main><div class="panel"><h1>Oops</h1><p class="subtitle">Could not load levels. Run <code>npm run generate:levels</code> and refresh.</p></div></main>`;
    return;
  }
  render();
}

init();
