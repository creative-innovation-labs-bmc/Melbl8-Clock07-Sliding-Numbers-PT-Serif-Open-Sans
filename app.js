(() => {
  'use strict';

  const STAGE_WIDTH = 3840;
  const STAGE_HEIGHT = 804;
  const ZONE = 'Australia/Melbourne';
  const stage = document.getElementById('stage');
  const viewport = document.getElementById('viewport');
  const weekdayEl = document.getElementById('weekday');
  const dateEl = document.getElementById('date');
  const timezoneEl = document.getElementById('timezone');

  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const offsetFormatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: ZONE,
    timeZoneName: 'longOffset',
    hour: '2-digit'
  });

  const digits = {};

  document.querySelectorAll('.digit-window').forEach((windowEl) => {
    const key = windowEl.dataset.digit;
    const track = windowEl.querySelector('.digit-track');
    digits[key] = {
      track,
      current: track.querySelector('.current'),
      next: track.querySelector('.next'),
      value: null,
      rolling: false,
      pending: null
    };
  });

  function fitStage() {
    const vw = viewport.clientWidth || window.innerWidth;
    const vh = viewport.clientHeight || window.innerHeight;
    const scale = Math.min(vw / STAGE_WIDTH, vh / STAGE_HEIGHT);
    const x = Math.round((vw - STAGE_WIDTH * scale) / 2);
    const y = Math.round((vh - STAGE_HEIGHT * scale) / 2);
    stage.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }

  function getParts(now) {
    const values = Object.fromEntries(
      formatter.formatToParts(now)
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, part.value])
    );

    return {
      hour: values.hour.padStart(2, '0'),
      minute: values.minute.padStart(2, '0'),
      second: values.second.padStart(2, '0'),
      weekday: values.weekday.toUpperCase(),
      date: `${values.day} ${values.month.toUpperCase()} ${values.year}`
    };
  }

  function setDigit(key, value, animate) {
    const item = digits[key];
    if (!item || item.value === value) return;

    if (item.rolling) {
      item.pending = value;
      return;
    }

    if (item.value === null || !animate) {
      item.current.textContent = value;
      item.next.textContent = value;
      item.value = value;
      item.track.classList.remove('rolling');
      return;
    }

    item.rolling = true;
    item.next.textContent = value;
    item.track.classList.remove('rolling');
    void item.track.offsetHeight;
    item.track.classList.add('rolling');
  }

  function completeRoll(key) {
    const item = digits[key];
    if (!item || !item.rolling) return;

    const value = item.next.textContent;
    item.track.classList.remove('rolling');
    item.current.textContent = value;
    item.next.textContent = value;
    item.value = value;
    item.rolling = false;

    if (item.pending !== null && item.pending !== item.value) {
      const pending = item.pending;
      item.pending = null;
      setDigit(key, pending, true);
    } else {
      item.pending = null;
    }
  }

  Object.keys(digits).forEach((key) => {
    digits[key].track.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'transform') completeRoll(key);
    });
  });

  let firstRender = true;
  let lastDate = '';

  function updateOffset(now) {
    const zoneName = offsetFormatter.formatToParts(now)
      .find((part) => part.type === 'timeZoneName')?.value || '';
    timezoneEl.textContent = `AUSTRALIA/MELBOURNE · ${zoneName.replace('GMT', 'UTC')}`;
  }

  function render(now) {
    const time = getParts(now);
    const values = {
      h1: time.hour[0], h2: time.hour[1],
      m1: time.minute[0], m2: time.minute[1],
      s1: time.second[0], s2: time.second[1]
    };

    Object.entries(values).forEach(([key, value]) => {
      setDigit(key, value, !firstRender);
    });

    if (time.date !== lastDate) {
      weekdayEl.textContent = time.weekday;
      dateEl.textContent = time.date;
      updateOffset(now);
      lastDate = time.date;
    }

    firstRender = false;
  }

  let timer;

  function scheduleTick() {
    clearTimeout(timer);
    const delay = 1000 - (Date.now() % 1000) + 12;
    timer = setTimeout(() => {
      render(new Date());
      scheduleTick();
    }, delay);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      render(new Date());
      scheduleTick();
    }
  });

  window.addEventListener('resize', fitStage, { passive: true });
  window.addEventListener('orientationchange', fitStage, { passive: true });

  fitStage();
  render(new Date());
  scheduleTick();
})();
