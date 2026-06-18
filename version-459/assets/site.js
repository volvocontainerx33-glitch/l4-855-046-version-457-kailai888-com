(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initSearch() {
    var inputs = document.querySelectorAll(".site-search");
    inputs.forEach(function (input) {
      var scope = input.closest("main") || document;
      var cards = scope.querySelectorAll("[data-search]");
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          if (!value || text.indexOf(value) !== -1) {
            card.classList.remove("hidden-card");
          } else {
            card.classList.add("hidden-card");
          }
        });
      });
    });
  }

  function initHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function attachStream(video, streamUrl) {
    if (!video || !streamUrl || video.getAttribute("data-ready") === "1") {
      return;
    }
    video.setAttribute("data-ready", "1");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = streamUrl;
  }

  function initPlayers() {
    var shells = document.querySelectorAll(".video-shell");
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-cover");
      var streamUrl = shell.getAttribute("data-stream");
      function startPlayback() {
        attachStream(video, streamUrl);
        shell.classList.add("playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            shell.classList.remove("playing");
          });
        }
      }
      if (button) {
        button.addEventListener("click", startPlayback);
      }
      if (video) {
        video.addEventListener("play", function () {
          shell.classList.add("playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0 || video.ended) {
            shell.classList.remove("playing");
          }
        });
        video.addEventListener("click", function () {
          if (!video.getAttribute("data-ready")) {
            startPlayback();
          }
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initSearch();
    initHero();
    initPlayers();
  });
})();
