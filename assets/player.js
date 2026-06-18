(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(setupPlayer);
  });

  function setupPlayer(box) {
    var video = box.querySelector("video");
    var cover = box.querySelector(".play-cover");
    if (!video || !cover) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var prepared = false;
    var hls = null;

    function attach() {
      if (prepared || !stream) {
        return;
      }

      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      attach();
      cover.classList.add("is-hidden");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0) {
        cover.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }
})();
