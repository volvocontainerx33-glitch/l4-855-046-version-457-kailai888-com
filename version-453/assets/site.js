(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var header = document.querySelector("[data-site-header]");
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    var backTop = document.querySelector("[data-back-top]");

    function updateHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 40) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
      if (backTop) {
        backTop.classList.toggle("is-visible", window.scrollY > 480);
      }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    if (backTop) {
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });

      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    var containers = Array.prototype.slice.call(document.querySelectorAll("[data-card-container]"));
    containers.forEach(function (container) {
      var root = container.closest(".section-block") || document;
      var input = root.querySelector("[data-search-input]") || document.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-filter-value]"));
      var result = root.querySelector("[data-result-count]");
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
      var activeFilter = "all";

      function apply() {
        var query = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.textContent
          ].join(" "));
          var genre = normalize(card.getAttribute("data-genre"));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchFilter = activeFilter === "all" || genre.indexOf(normalize(activeFilter)) !== -1;
          var isVisible = matchQuery && matchFilter;
          card.classList.toggle("is-hidden-card", !isVisible);
          if (isVisible) {
            visible += 1;
          }
        });
        if (result) {
          result.textContent = "当前显示 " + visible + " 项";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          activeFilter = button.getAttribute("data-filter-value") || "all";
          apply();
        });
      });

      apply();
    });
  });
})();
