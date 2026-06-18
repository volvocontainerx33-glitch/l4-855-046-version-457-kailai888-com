(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupHeader() {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-menu-toggle]");
        if (!header) {
            return;
        }

        function updateHeader() {
            if (window.scrollY > 40) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        }

        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });

        if (toggle) {
            toggle.addEventListener("click", function () {
                header.classList.toggle("is-open");
            });
        }
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var count = scope.querySelector("[data-filter-count]");
            var filterValue = "all";

            function matchesFilter(card) {
                if (filterValue === "all") {
                    return true;
                }
                var pair = filterValue.split(":");
                var key = pair[0];
                var value = pair.slice(1).join(":");
                var field = card.getAttribute("data-" + key) || "";
                return field.indexOf(value) !== -1;
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var ok = (!query || text.indexOf(query) !== -1) && matchesFilter(card);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "显示 " + visible + " 部影片";
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    filterValue = button.getAttribute("data-filter-button") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    function setupBackTop() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-back-top]"));
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    function initPlayer(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var button = document.getElementById(options.buttonId);
        var source = options.source;
        var hls = null;
        var attached = false;

        if (!video || !source) {
            return;
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function showOverlay() {
            if (overlay && video.paused && !video.ended) {
                overlay.classList.remove("is-hidden");
            }
        }

        function playVideo() {
            hideOverlay();

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.getAttribute("src")) {
                    video.setAttribute("src", source);
                }
                video.play().catch(showOverlay);
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!attached) {
                    hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    attached = true;
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(showOverlay);
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hls) {
                            hls.destroy();
                            hls = null;
                            attached = false;
                            video.setAttribute("src", source);
                            video.play().catch(showOverlay);
                        }
                    });
                } else {
                    video.play().catch(showOverlay);
                }
                return;
            }

            if (!video.getAttribute("src")) {
                video.setAttribute("src", source);
            }
            video.play().catch(showOverlay);
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", hideOverlay);
        video.addEventListener("pause", showOverlay);
    }

    window.MovieSite = {
        initPlayer: initPlayer
    };

    ready(function () {
        setupHeader();
        setupHero();
        setupFilters();
        setupBackTop();
    });
})();
