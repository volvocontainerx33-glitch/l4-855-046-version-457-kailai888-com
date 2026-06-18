(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function attachSource(video) {
    if (!video || video.dataset.ready === "true") {
      return;
    }
    var source = video.getAttribute("data-src");
    if (!source) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      if (window.Hls.Events && hls.on) {
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            video.src = source;
          }
        });
      }
    } else {
      video.src = source;
    }
    video.dataset.ready = "true";
  }

  ready(function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-video-box]"));
    boxes.forEach(function (box) {
      var video = box.querySelector("[data-video-player]");
      var button = box.querySelector("[data-play-button]");

      function play() {
        attachSource(video);
        var request = video.play();
        if (request && request.catch) {
          request.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          attachSource(video);
        });
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
        });
        video.addEventListener("pause", function () {
          if (button && video.currentTime === 0) {
            button.classList.remove("is-hidden");
          }
        });
      }
    });
  });
})();
