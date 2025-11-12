// Міняємо місцями контент блоків 3 і 6
window.addEventListener("DOMContentLoaded", () => {
  const b3 = document.getElementById("block3");
  const b6 = document.getElementById("block6");
  const temp = b3.innerHTML;
  b3.innerHTML = b6.innerHTML;
  b6.innerHTML = temp;

  // Функція обчислення площі паралелограма
  const a = 10;
  const h = 5;
  const area = a * h;
  const block5 = document.getElementById("block5");
  const resultP = document.createElement("p");
  resultP.textContent = "Площа паралелограма: " + area;
  block5.appendChild(resultP);

  // Пошук максимальної цифри
  const form = document.getElementById("maxDigitForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const num = document.getElementById("numberInput").value;
      let max = 0;
      for (let d of num) {
        if (+d > max) max = +d;
      }
      alert("Максимальна цифра: " + max);
      document.cookie = "maxDigit=" + max;
    });
  }

  // При перезавантаженні — показ cookies
  const cookies = document.cookie.split("=");
  if (cookies[0] === "maxDigit" && cookies[1]) {
    alert("Збережене значення: " + cookies[1] + ". Натисніть OK для видалення.");
    document.cookie = "maxDigit=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    alert("Cookies видалено. Сторінка буде перезавантажена.");
    location.reload();
  }

  // Вирівнювання контенту по правому краю
  const alignmentForm = document.getElementById("alignmentForm");
  const radioButtons = alignmentForm.querySelectorAll("input[name='align']");

  const applyAlignment = (align) => {
    ["block2", "block4", "block5"].forEach((id) => {
      const el = document.getElementById(id);
      el.style.textAlign = align;
    });
  };

  const savedAlign = localStorage.getItem("alignment");
  if (savedAlign) applyAlignment(savedAlign);
  else applyAlignment("left");

  radioButtons.forEach((radio) => {
    radio.addEventListener("change", () => {
      localStorage.setItem("alignment", radio.value);
    });
  });

  document.body.addEventListener("mouseout", () => {
    const align = localStorage.getItem("alignment") || "left";
    applyAlignment(align);
  });
});
