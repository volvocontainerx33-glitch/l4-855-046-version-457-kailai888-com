(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initHeader();
    initMobileNav();
    initHeroSlider();
    initFilters();
  });

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) {
      return;
    }

    function update() {
      if (window.scrollY > 40) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initMobileNav() {
    var button = document.querySelector(".mobile-toggle");
    if (!button) {
      return;
    }

    button.addEventListener("click", function () {
      var opened = document.body.classList.toggle("nav-open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-prev]");
    var next = slider.querySelector("[data-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-go")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var section = form.closest(".library-section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      var search = form.querySelector(".library-search");
      var selects = Array.prototype.slice.call(form.querySelectorAll(".filter-select"));
      var reset = form.querySelector(".filter-reset");
      var empty = section.querySelector(".empty-state");

      selects.forEach(function (select) {
        fillOptions(select, cards, select.getAttribute("data-filter"));
      });

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute("data-filter")] = select.value;
        });

        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();

          var matched = !query || text.indexOf(query) !== -1;
          Object.keys(filters).forEach(function (key) {
            if (filters[key] && card.getAttribute("data-" + key) !== filters[key]) {
              matched = false;
            }
          });

          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      if (search) {
        search.addEventListener("input", apply);
      }

      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }
          selects.forEach(function (select) {
            select.value = "";
          });
          apply();
        });
      }
    });
  }

  function fillOptions(select, cards, key) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute("data-" + key);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });

    values.sort(function (a, b) {
      if (key === "year") {
        return Number(b) - Number(a);
      }
      return a.localeCompare(b, "zh-Hans-CN");
    });

    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }
})();
