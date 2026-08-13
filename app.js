(() => {
  'use strict';

  const STAGE_WIDTH = 3840;
  const STAGE_HEIGHT = 804;
  const ZONE = 'Australia/Melbourne';
  const WEATHER_REFRESH_MS = 10 * 60 * 1000;
  const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-37.8183&longitude=144.9479&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh&timezone=Australia%2FMelbourne';

  const stage = document.getElementById('stage');
  const viewport = document.getElementById('viewport');
  const weekdayEl = document.getElementById('weekday');
  const dateEl = document.getElementById('date');
  const timezoneEl = document.getElementById('timezone');
  const weatherTempEl = document.getElementById('weather-temp');
  const weatherConditionEl = document.getElementById('weather-condition');
  const weatherWindEl = document.getElementById('weather-wind');
  const weatherHumidityEl = document.getElementById('weather-humidity');
  const separators = Array.from(document.querySelectorAll('.separator'));

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

  function weatherLabel(code) {
    if (code === 0) return 'CLEAR';
    if (code === 1) return 'MAINLY CLEAR';
    if (code === 2) return 'PARTLY CLOUDY';
    if (code === 3) return 'OVERCAST';
    if (code === 45 || code === 48) return 'FOG';
    if ([51, 53, 55, 56, 57].includes(code)) return 'DRIZZLE';
    if ([61, 63, 65, 66, 67].includes(code)) return 'RAIN';
    if ([71, 73, 75, 77].includes(code)) return 'SNOW';
    if ([80, 81, 82].includes(code)) return 'SHOWERS';
    if ([85, 86].includes(code)) return 'SNOW SHOWERS';
    if ([95, 96, 99].includes(code)) return 'THUNDERSTORM';
    return 'CURRENT CONDITIONS';
  }

  async function refreshWeather() {
    try {
      const response = await fetch(WEATHER_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Weather request failed');
      const data = await response.json();
      const current = data.current || {};

      if (Number.isFinite(current.temperature_2m)) {
        weatherTempEl.textContent = `${Math.round(current.temperature_2m)}°C`;
      }
      if (Number.isFinite(current.weather_code)) {
        weatherConditionEl.textContent = weatherLabel(current.weather_code);
      }
      if (Number.isFinite(current.wind_speed_10m)) {
        weatherWindEl.textContent = `WIND ${Math.round(current.wind_speed_10m)} KM/H`;
      }
      if (Number.isFinite(current.relative_humidity_2m)) {
        weatherHumidityEl.textContent = `HUMIDITY ${Math.round(current.relative_humidity_2m)}%`;
      }
    } catch (_error) {
      if (weatherConditionEl.textContent === 'UPDATING') {
        weatherConditionEl.textContent = 'WEATHER UNAVAILABLE';
      }
    }
  }

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

    const blinkOff = Number(time.second) % 2 === 1;
    separators.forEach((separator) => separator.classList.toggle('blink-off', blinkOff));

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
      refreshWeather();
    }
  });

  window.addEventListener('resize', fitStage, { passive: true });
  window.addEventListener('orientationchange', fitStage, { passive: true });

  fitStage();
  render(new Date());
  refreshWeather();
  setInterval(refreshWeather, WEATHER_REFRESH_MS);
  scheduleTick();
})();
