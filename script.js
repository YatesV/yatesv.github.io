const typeText = document.querySelector('.type-text');
const disclaimer = document.querySelector('.disclaimer');
const buttonContainer = document.querySelector('.button-container');
const enterButton = document.querySelector('.pixel-button');

if (typeText && disclaimer && enterButton) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let typingTicker = null;
  let interactionUnlocked = false;
  const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.04, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  function unlockAudio() {
    if (interactionUnlocked) return;
    interactionUnlocked = true;
    audioCtx.resume().catch(() => { interactionUnlocked = false; });
  }

  function playTypeTick() {
    const now = audioCtx.currentTime;
    const master = audioCtx.createGain();
    master.gain.value = 0.16 + Math.random() * 0.04;

    const pan = audioCtx.createStereoPanner();
    pan.pan.value = (Math.random() - 0.5) * 0.35;
    master.connect(pan);
    pan.connect(audioCtx.destination);

    // High click — tight high-pass noise burst
    const hiNoise = audioCtx.createBufferSource();
    hiNoise.buffer = noiseBuffer;
    const hiFilter = audioCtx.createBiquadFilter();
    hiFilter.type = 'highpass';
    hiFilter.frequency.value = 2600 + Math.random() * 600;
    hiFilter.Q.value = 8;
    const hiGain = audioCtx.createGain();
    hiGain.gain.setValueAtTime(0.0001, now);
    hiGain.gain.linearRampToValueAtTime(0.12, now + 0.003);
    hiGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    hiNoise.connect(hiFilter);
    hiFilter.connect(hiGain);
    hiGain.connect(master);

    // Low thock — low-pass noise for a softer mechanical body
    const lowNoise = audioCtx.createBufferSource();
    lowNoise.buffer = noiseBuffer;
    const lowFilter = audioCtx.createBiquadFilter();
    lowFilter.type = 'lowpass';
    lowFilter.frequency.value = 200 + Math.random() * 120;
    lowFilter.Q.value = 0.9;
    const lowGain = audioCtx.createGain();
    lowGain.gain.setValueAtTime(0.0001, now);
    lowGain.gain.linearRampToValueAtTime(0.07, now + 0.005);
    lowGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    lowNoise.connect(lowFilter);
    lowFilter.connect(lowGain);
    lowGain.connect(master);

    hiNoise.start(now);
    hiNoise.stop(now + 0.09);
    lowNoise.start(now);
    lowNoise.stop(now + 0.12);
  }

  function startTypingSound() {
    if (typingTicker) return;
    typingTicker = setInterval(playTypeTick, 120);
  }

  function stopTypingSound() {
    if (!typingTicker) return;
    clearInterval(typingTicker);
    typingTicker = null;
  }

  typeText.addEventListener('animationstart', (event) => {
    if (event.animationName !== 'neonTyping') return;
    unlockAudio();
    startTypingSound();
  });

  typeText.addEventListener('animationend', (event) => {
    if (event.animationName === 'neonTyping') {
      stopTypingSound();
    }
  });

  typeText.addEventListener('animationcancel', (event) => {
    if (event.animationName === 'neonTyping') {
      stopTypingSound();
    }
  });

  function addUnlockTrigger(element, eventName) {
    element.addEventListener(eventName, unlockAudio, { once: true });
  }

  if (buttonContainer) {
    addUnlockTrigger(buttonContainer, 'pointerenter');
    addUnlockTrigger(buttonContainer, 'pointerover');
  }

  addUnlockTrigger(document, 'pointermove');
  addUnlockTrigger(document, 'pointerdown');
  addUnlockTrigger(document, 'wheel');
  addUnlockTrigger(document, 'keydown');
  addUnlockTrigger(document, 'touchstart');

  let hasOpenedDisclaimer = false;
  const MAIN_URL = 'main.html'; // relative link to main site

  enterButton.addEventListener('click', (event) => {
    if (!hasOpenedDisclaimer) {
      event.preventDefault();
      hasOpenedDisclaimer = true;
      disclaimer.classList.add('open');
      unlockAudio();
      // retrigger typing animation by forcing reflow if already typed
      typeText.style.animation = 'none';
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      typeText.offsetHeight;
      typeText.style.animation = '';
      // start sound immediately; neonTyping will also start it
      startTypingSound();
    } else {
      window.location.href = MAIN_URL;
    }
  });
}
