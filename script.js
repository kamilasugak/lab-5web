// script.js — повна реалізація функцій: swap, area calc, max digit+cookies, mouseout alignment + localStorage, dynamic lists

/* ---------- Cookie helper ---------- */
function setCookie(name, value, days = 7) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + d.toUTCString() + ";path=/";
}
function getCookie(name) {
  const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return m ? decodeURIComponent(m.pop()) : null;
}
function deleteCookie(name) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

/* ---------- 1) Поміняти місцями контент блоків 3 і 6 ---------- */
function swapBlocksContent() {
  const b3 = document.getElementById('block3');
  const b6 = document.getElementById('block6');
  if (b3 && b6) {
    // міняємо innerHTML, щоб зберегти ID елементів
    const tmp = b3.innerHTML;
    b3.innerHTML = b6.innerHTML;
    b6.innerHTML = tmp;
  }
}

/* ---------- 2) Площа паралелограма ---------- */
function setupAreaCalc() {
  const btn = document.getElementById('areaBtn');
  if (!btn) return;
  const base = document.getElementById('parBase');
  const height = document.getElementById('parHeight');
  const res = document.getElementById('areaResult');
  btn.addEventListener('click', () => {
    const b = parseFloat(base.value);
    const h = parseFloat(height.value);
    if (isNaN(b) || isNaN(h) || b < 0 || h < 0) {
      res.textContent = 'Будь ласка, введіть додатні числа для основи й висоти.';
      return;
    }
    const area = b * h;
    res.textContent = 'Площа паралелограма: ' + area;
    // додаємо результат в кінець контенту блоку 5 (повторно)
    const block5 = document.getElementById('block5');
    if (block5) {
      const div = document.createElement('div');
      div.className = 'area-output';
      div.textContent = 'Площа паралелограма (вставлено в кінці блоку 5): ' + area;
      block5.appendChild(div);
    }
  });
}

/* ---------- 3) Максимальна цифра у натуральному числі, діалоги і cookies ---------- */
function setupMaxDigit() {
  const form = document.getElementById('maxdigit-form');
  const input = document.getElementById('maxDigitInput');
  const btn = document.getElementById('maxDigitBtn');
  if (!form || !input || !btn) return;

  // При завантаженні — перевіряємо cookie
  const stored = getCookie('maxDigitResult');
  if (stored) {
    // сповіщення з інформуванням, що після ОК дані видаляться, і форма не показується
    const proceed = confirm('Збережено результат: "' + stored + '". Після натискання "ОК" ці дані будуть видалені. Форма при цьому не буде показуватись.');
    if (proceed) {
      deleteCookie('maxDigitResult');
      alert('Cookies видалено.');
      // перезавантаження сторінки з початковим станом (форма з'явиться знову)
      location.reload();
      return;
    } else {
      // якщо користувач відмовився, залишаємо cookie і ховаємо форму
      form.style.display = 'none';
    }
  }

  btn.addEventListener('click', () => {
    const val = input.value.trim();
    if (!/^[0-9]+$/.test(val)) {
      alert('Введіть натуральне число (тільки цифри).');
      return;
    }
    let max = -1;
    for (const ch of val) {
      const d = parseInt(ch, 10);
      if (d > max) max = d;
    }
    alert('Максимальна цифра: ' + max);
    setCookie('maxDigitResult', max, 7);
    // ховаємо форму після збереження (як у вимозі)
    form.style.display = 'none';
  });
}

/* ---------- 4) mouseout вирівнювання + localStorage ---------- */
/*
  Логіка:
  - Для блоків block2, block4, block5 на сторінці є радіокнопки (left/right).
  - Подія mouseout над формою вирівнювання (або над документом — залежно)
    переводить блоки у вирівнювання, яке обрано в радіокнопках.
  - Збереження окремо для кожного блоку в localStorage як align_block2, align_block4, align_block5.
  - При завантаженні сторінки — відновлюємо вирівнювання з localStorage (якщо є).
*/
function setupAlignmentMouseout() {
  const blocksInfo = [
    { id: 'block2', radioName: 'align_block2' },
    { id: 'block4', radioName: 'align_block4' },
    { id: 'block5', radioName: 'align_block5' }
  ];

  // Відновлення при завантаженні
  blocksInfo.forEach(info => {
    const saved = localStorage.getItem('align_' + info.id);
    const radios = document.getElementsByName(info.radioName);
    if (saved) {
      const el = document.getElementById(info.id);
      if (el) el.style.textAlign = saved;
      // позначаємо відповідну радіокнопку
      if (radios) {
        for (const r of radios) {
          if (r.value === saved) { r.checked = true; break; }
        }
      }
    } else {
      // за замовчуванням ліворуч
      const el = document.getElementById(info.id);
      if (el) el.style.textAlign = 'left';
      if (radios) {
        for (const r of radios) {
          if (r.value === 'left') r.checked = true;
        }
      }
    }
  });

  // Подія mouseout: для сумісності — повісимо її на документ, але перевіряємо лише коли її викликав користувач (тобто коли focus був у формі)
  // Щоб відповідало завданню: "при настанні події mouseout задає вирівнювання ... при встановленні користувачем відповідних радіокнопок у формі"
  // Ми ловимо mouseout над блоком .middle-row — коли користувач виводить курсор із області форми/контролів.
  const middle = document.querySelector('.middle-row') || document;
  middle.addEventListener('mouseout', (e) => {
    // для кожного блоку читаємо його групу радіокнопок і, якщо вибране — застосовуємо і зберігаємо
    blocksInfo.forEach(info => {
      const radios = document.getElementsByName(info.radioName);
      if (!radios) return;
      let selected = null;
      for (const r of radios) {
        if (r.checked) { selected = r.value; break; }
      }
      if (selected) {
        const el = document.getElementById(info.id);
        if (el) el.style.textAlign = selected;
        localStorage.setItem('align_' + info.id, selected);
      }
    });
  });
}

/* ---------- 5) Динамічні нумеровані списки + збереження в localStorage; очищення при перезавантаженні ---------- */
/*
  - select-trigger показує форму для додавання пунктів у відповідний блок (1..7).
  - кількість пунктів необмежена.
  - кнопка "Зберегти" зберігає структуру в localStorage під ключем dynlist_<blockId> і додає список в кінець блоку.
  - перезавантаження сторінки призводить до видалення цих збережених списків (реалізовано: ми очищаємо ключі dynlist_* при load).
*/
function setupDynamicLists() {
  // чистимо попередні dynlist_* щоб відповідало пункту (г)
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith('dynlist_')) localStorage.removeItem(k);
  });

  document.querySelectorAll('.select-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const blockId = trigger.dataset.block;
      if (!blockId) return;
      // якщо вже є форма для цього блоку — не створюємо
      if (document.getElementById('list-form-' + blockId)) return;
      const form = document.createElement('div');
      form.id = 'list-form-' + blockId;
      form.className = 'list-form';
      form.innerHTML = `
        <h4>Додати нумерований список у ${blockId}</h4>
        <div id="items-${blockId}"></div>
        <div style="margin-top:8px;">
          <button type="button" id="additem-${blockId}">Додати пункт</button>
          <button type="button" id="savelist-${blockId}">Зберегти список</button>
          <button type="button" id="closelist-${blockId}">Закрити</button>
        </div>
      `;
      trigger.parentNode.insertBefore(form, trigger.nextSibling);

      const itemsDiv = form.querySelector('#items-' + blockId);
      const addBtn = form.querySelector('#additem-' + blockId);
      const saveBtn = form.querySelector('#savelist-' + blockId);
      const closeBtn = form.querySelector('#closelist-' + blockId);

      addBtn.addEventListener('click', () => {
        const idx = itemsDiv.children.length + 1;
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = `<label>Пункт ${idx}: <input type="text" class="list-input"></label>
                         <button class="remove-item" type="button">Видалити</button>`;
        itemsDiv.appendChild(row);
        row.querySelector('.remove-item').addEventListener('click', () => row.remove());
      });

      saveBtn.addEventListener('click', () => {
        const inputs = Array.from(form.querySelectorAll('.list-input')).map(i => i.value.trim()).filter(Boolean);
        if (inputs.length === 0) {
          alert('Додайте хоча б один пункт.');
          return;
        }
        const ol = document.createElement('ol');
        inputs.forEach(v => {
          const li = document.createElement('li');
          li.textContent = v;
          ol.appendChild(li);
        });
        // зберігаємо в localStorage структуровано
        const key = 'dynlist_' + blockId;
        localStorage.setItem(key, JSON.stringify(inputs));
        // додаємо список в кінець блоку
        const block = document.getElementById(blockId);
        if (block) block.appendChild(ol);
        form.remove();
      });

      closeBtn.addEventListener('click', () => form.remove());
    });
  });
}

/* ---------- Ініціалізація всього при DOMContentLoaded ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // 1
  swapBlocksContent();

  // 2
  setupAreaCalc();

  // 3
  setupMaxDigit();

  // 4
  setupAlignmentMouseout();

  // 5
  setupDynamicLists();
});

