/**
 * Site Interactions — client-side behavior for server-rendered pages.
 *
 * Expects window.__BUSINESS to be set before this script runs.
 * Handles: mobile menu, service tabs, testimonial carousel,
 * FAQ accordion, stats animation, back-to-top, photo lightbox,
 * open/closed status refresh.
 */

(function () {
  var BUSINESS = window.__BUSINESS;
  if (!BUSINESS) return;

  // ─── Utility ────────────────────────────────────────────────────
  function esc(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function E(path) { return 'data-edit="' + path + '"'; }

  // ─── Hours helpers (for live open/closed refresh) ───────────────
  function getOpenStatus(schedule) {
    if (!schedule) return null;
    var DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var now = new Date();
    var todayKey = DAY_KEYS[now.getDay()];
    var today = schedule[todayKey];
    var nowMins = now.getHours() * 60 + now.getMinutes();

    function fmt(t) {
      var parts = t.split(":").map(Number);
      var h = parts[0], m = parts[1];
      var suffix = h >= 12 ? "PM" : "AM";
      var hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return m === 0 ? hour + " " + suffix : hour + ":" + String(m).padStart(2, "0") + " " + suffix;
    }

    if (today) {
      var openMins = today.open.split(":").map(Number);
      var closeMins = today.close.split(":").map(Number);
      var oM = openMins[0] * 60 + openMins[1];
      var cM = closeMins[0] * 60 + closeMins[1];
      var spans = cM <= oM;
      var isOpen = spans ? (nowMins >= oM || nowMins < cM) : (nowMins >= oM && nowMins < cM);
      if (isOpen) return { isOpen: true, label: "Open now", detail: "Closes at " + fmt(today.close) };
      if (!spans && nowMins < oM) return { isOpen: false, label: "Closed", detail: "Opens at " + fmt(today.open) };
    }

    for (var offset = 1; offset <= 7; offset++) {
      var nextIdx = (now.getDay() + offset) % 7;
      var nextDay = schedule[DAY_KEYS[nextIdx]];
      if (nextDay) {
        var dayLabel = offset === 1 ? "tomorrow" : DAY_NAMES[nextIdx];
        return { isOpen: false, label: "Closed", detail: "Opens " + fmt(nextDay.open) + " " + dayLabel };
      }
    }
    return { isOpen: false, label: "Closed", detail: "Hours unavailable" };
  }

  // ─── Service detail renderer ────────────────────────────────────
  // Uses teamMembers (platform naming) with fallback to team (client template naming)
  var services = BUSINESS.services || [];

  function renderServiceDetail(idx) {
    var s = services[idx];
    if (!s) return "";
    var ICONS_shield = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>';
    var html = '<div class="service-detail">';
    html += '<p class="service-price-badge" ' + E("services." + idx + ".priceRange") + '>' + esc(s.priceRange) + '</p>';
    html += '<h3 class="service-name" ' + E("services." + idx + ".name") + '>' + esc(s.name) + '</h3>';
    if (s.duration) {
      html += '<p class="service-duration" ' + E("services." + idx + ".duration") + '>' + esc(s.duration) + '</p>';
    } else {
      html += '<p class="service-duration" ' + E("services." + idx + ".duration") + ' style="opacity:0.4">Add duration...</p>';
    }
    html += '<p class="service-desc" ' + E("services." + idx + ".description") + '>' + esc(s.description) + '</p>';
    if (s.features && s.features.length > 0) {
      html += '<ul class="service-features" data-edit-list="services.' + idx + '.features" data-list-template="New feature">';
      s.features.forEach(function (f, fi) {
        html += '<li>' + ICONS_shield + ' <span ' + E("services." + idx + ".features." + fi) + '>' + esc(f) + '</span></li>';
      });
      html += '</ul>';
    } else {
      html += '<ul class="service-features" data-edit-list="services.' + idx + '.features" data-list-template="New feature"></ul>';
    }
    html += '</div>';
    return html;
  }

  // ─── Mobile menu ────────────────────────────────────────────────
  var menuOpen = document.getElementById("mobileMenuOpen");
  var menuClose = document.getElementById("mobileMenuClose");
  var mobileMenu = document.getElementById("mobileMenu");
  if (menuOpen && mobileMenu) {
    menuOpen.addEventListener("click", function () { mobileMenu.style.display = "flex"; });
    menuClose.addEventListener("click", function () { mobileMenu.style.display = "none"; });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { mobileMenu.style.display = "none"; });
    });
  }

  // ─── Service tabs ───────────────────────────────────────────────
  var tabs = document.getElementById("serviceTabs");
  var detail = document.getElementById("serviceDetail");
  if (tabs && detail) {
    tabs.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-service]");
      if (!btn) return;
      var idx = parseInt(btn.dataset.service);
      tabs.querySelectorAll(".service-pill").forEach(function (p) { p.classList.remove("active"); });
      btn.classList.add("active");
      detail.innerHTML = renderServiceDetail(idx);
      if (typeof window.onServiceTabChange === "function") window.onServiceTabChange(idx);
    });
  }

  // ─── Testimonial carousel ──────────────────────────────────────
  var testimonials = BUSINESS.testimonials || [];
  if (testimonials.length > 1) {
    var current = 0;
    var carousel = document.getElementById("testimonialCarousel");
    var starSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    var chevronLeft = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
    var chevronRight = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

    function showTestimonial(idx) {
      current = idx;
      var t = testimonials[idx];
      if (!carousel) return;
      carousel.innerHTML =
        '<div class="testimonial-stars">' + Array(5).fill(starSvg).join("") + '</div>' +
        '<p class="testimonial-quote" ' + E("testimonials." + idx + ".quote") + '>&ldquo;' + esc(t.quote) + '&rdquo;</p>' +
        '<p class="testimonial-author"><span ' + E("testimonials." + idx + ".name") + '>' + esc(t.name) + '</span>' + (t.context ? ' \u2014 <span ' + E("testimonials." + idx + ".context") + '>' + esc(t.context) + '</span>' : '') + '</p>' +
        '<div class="testimonial-nav">' +
        '<button class="testimonial-nav-btn" id="testimonialPrev">' + chevronLeft + '</button>' +
        '<button class="testimonial-nav-btn" id="testimonialNext">' + chevronRight + '</button>' +
        '</div>';
      document.getElementById("testimonialPrev").addEventListener("click", function () { showTestimonial((current - 1 + testimonials.length) % testimonials.length); });
      document.getElementById("testimonialNext").addEventListener("click", function () { showTestimonial((current + 1) % testimonials.length); });
      if (typeof window.onTestimonialChange === "function") window.onTestimonialChange();
    }

    var prevBtn = document.getElementById("testimonialPrev");
    var nextBtn = document.getElementById("testimonialNext");
    if (prevBtn) prevBtn.addEventListener("click", function () { showTestimonial((current - 1 + testimonials.length) % testimonials.length); });
    if (nextBtn) nextBtn.addEventListener("click", function () { showTestimonial((current + 1) % testimonials.length); });

    setInterval(function () {
      var app = document.getElementById("app") || document.getElementById("site-root");
      if (app && app.classList.contains("edit-mode")) return;
      showTestimonial((current + 1) % testimonials.length);
    }, 5000);
  }

  // ─── FAQ accordion ──────────────────────────────────────────────
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-question");
    if (btn) {
      btn.addEventListener("click", function () {
        var wasOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item").forEach(function (i) { i.classList.remove("open"); });
        if (!wasOpen) item.classList.add("open");
      });
    }
  });

  // ─── Open/Closed status refresh ─────────────────────────────────
  function refreshOpenStatus() {
    if (!BUSINESS.hoursSchedule) return;
    var el = document.querySelector(".open-status");
    if (!el) return;
    var status = getOpenStatus(BUSINESS.hoursSchedule);
    if (!status) return;
    el.className = "open-status " + (status.isOpen ? "open-status--open" : "open-status--closed");
    var lbl = el.querySelector(".open-status-label");
    var det = el.querySelector(".open-status-detail");
    if (lbl) lbl.textContent = status.label;
    if (det) det.innerHTML = "&middot; " + esc(status.detail);
  }
  setInterval(refreshOpenStatus, 60000);

  // ─── Photo lightbox ─────────────────────────────────────────────
  var photos = BUSINESS.photos || [];
  if (photos.length > 0) {
    var lightbox = document.getElementById("lightbox");
    var lbImg = document.getElementById("lightboxImg");
    var lbCaption = document.getElementById("lightboxCaption");
    var lbIdx = 0;

    function showLightbox(idx) {
      lbIdx = idx;
      var p = photos[idx];
      if (!p || !p.url) return;
      lbImg.src = p.url;
      lbImg.alt = p.caption || "";
      lbCaption.textContent = p.caption || "";
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-photo-idx]").forEach(function (card) {
      card.style.cursor = "pointer";
      card.addEventListener("click", function () {
        var app = document.getElementById("app") || document.getElementById("site-root");
        if (app && app.classList.contains("edit-mode")) return;
        showLightbox(parseInt(card.dataset.photoIdx));
      });
    });

    var lbClose = document.getElementById("lightboxClose");
    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    if (lightbox) lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
    var lbPrev = document.getElementById("lightboxPrev");
    var lbNext = document.getElementById("lightboxNext");
    if (lbPrev) lbPrev.addEventListener("click", function (e) { e.stopPropagation(); showLightbox((lbIdx - 1 + photos.length) % photos.length); });
    if (lbNext) lbNext.addEventListener("click", function (e) { e.stopPropagation(); showLightbox((lbIdx + 1) % photos.length); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showLightbox((lbIdx - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") showLightbox((lbIdx + 1) % photos.length);
    });
  }

  // ─── Stats counter animation ────────────────────────────────────
  var statsSection = document.getElementById("stats");
  var app = document.getElementById("app") || document.getElementById("site-root");
  var isEditMode = app && app.classList.contains("edit-mode");
  if (statsSection && !isEditMode) {
    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      var duration = 2000;
      var start = performance.now();
      var statEls = statsSection.querySelectorAll(".stat-value");
      var targets = Array.from(statEls).map(function (el) {
        return { el: el, target: parseInt(el.dataset.target), suffix: el.dataset.suffix || "" };
      });

      function animate(time) {
        var progress = Math.min((time - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        targets.forEach(function (t) {
          t.el.textContent = Math.round(t.target * eased) + t.suffix;
        });
        if (progress < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
      observer.disconnect();
    }, { threshold: 0.3 });
    observer.observe(statsSection);
  } else if (statsSection) {
    statsSection.querySelectorAll(".stat-value").forEach(function (el) {
      el.textContent = el.dataset.target + (el.dataset.suffix || "");
    });
  }

  // ─── Back to top button ─────────────────────────────────────────
  var backBtn = document.getElementById("backToTop");
  if (backBtn) {
    backBtn.addEventListener("click", function () { window.scrollTo({ top: 0 }); });
    window.addEventListener("scroll", function () {
      backBtn.classList.toggle("hidden", window.scrollY < 300);
    }, { passive: true });
  }

})();
