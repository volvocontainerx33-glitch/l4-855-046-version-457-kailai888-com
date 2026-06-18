(function () {
  window.initMoviePlayer = function (elementId, streamUrl) {
    var box = document.getElementById(elementId);
    if (!box) {
      return;
    }

    var video = box.querySelector("video");
    var button = box.querySelector(".player-overlay");
    var hlsInstance = null;
    var started = false;

    function playVideo() {
      if (!video || started) {
        return;
      }

      started = true;
      box.classList.add("is-playing");
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hlsInstance.loadSource(streamUrl);
        });
      } else {
        video.src = streamUrl;
        video.load();
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (!started) {
        playVideo();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
