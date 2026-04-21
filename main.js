// ── Year ──────────────────────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Mobile nav ────────────────────────────────────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');

navToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

// Close menu when a link is clicked
siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!siteNav.contains(e.target) && !navToggle.contains(e.target)) {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// ── Scroll-reveal (Intersection Observer) ────────────────────────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

// ── Contact form ──────────────────────────────────────────────────────────
const form = document.getElementById('contact-form');
const successEl = document.getElementById('form-success');

function showError(input, msg) {
  input.classList.add('error');
  let err = input.parentElement.querySelector('.field-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'field-error';
    input.parentElement.appendChild(err);
  }
  err.textContent = msg;
}

function clearError(input) {
  input.classList.remove('error');
  const err = input.parentElement.querySelector('.field-error');
  if (err) err.remove();
}

function validate(form) {
  let ok = true;

  const name = form.querySelector('#name');
  if (!name.value.trim()) {
    showError(name, 'Por favor ingresa tu nombre.');
    ok = false;
  } else {
    clearError(name);
  }

  const email = form.querySelector('#email');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email.value.trim())) {
    showError(email, 'Ingresa un email válido.');
    ok = false;
  } else {
    clearError(email);
  }

  const msg = form.querySelector('#message');
  if (!msg.value.trim()) {
    showError(msg, 'Por favor escribe tu consulta.');
    ok = false;
  } else {
    clearError(msg);
  }

  return ok;
}

if (form) {
  // Clear errors on input
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('input', () => clearError(el));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando…';

    try {
      const payload = {
        name: form.querySelector('#name').value.trim(),
        email: form.querySelector('#email').value.trim(),
        topic: form.querySelector('#topic').value,
        message: form.querySelector('#message').value.trim(),
      };

      const res = await fetch('https://qptech.app.n8n.cloud/webhook/contact-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      form.style.display = 'none';
      successEl.style.display = 'block';
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Enviar mensaje';
      const errEl = form.querySelector('.send-error') || document.createElement('p');
      errEl.className = 'send-error';
      errEl.style.cssText = 'color:#e0294a;font-size:14px;margin:8px 0 0';
      errEl.textContent = 'Hubo un error al enviar. Por favor inténtalo de nuevo.';
      if (!form.querySelector('.send-error')) form.appendChild(errEl);
    }
  });
}
