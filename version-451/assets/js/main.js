(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;
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
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart(nextIndex) {
            window.clearInterval(timer);
            show(nextIndex);
            start();
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                restart(dotIndex);
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                restart(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                restart(index + 1);
            });
        }
        start();
    }

    function setupFilters() {
        var pages = document.querySelectorAll(".movie-browser");
        pages.forEach(function (page) {
            var input = page.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(page.querySelectorAll("[data-filter-button]"));
            var grid = page.querySelector("[data-card-grid]");
            var empty = page.querySelector("[data-empty-state]");
            var viewButtons = Array.prototype.slice.call(page.querySelectorAll("[data-view]"));
            var activeFilter = "all";
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
            function textOf(card) {
                return [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category")
                ].join(" ").toLowerCase();
            }
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var matchesQuery = !query || textOf(card).indexOf(query) !== -1;
                    var matchesFilter = activeFilter === "all" || card.getAttribute("data-year") === activeFilter;
                    var show = matchesQuery && matchesFilter;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
            if (buttons[0]) {
                buttons[0].classList.add("active");
            }
            viewButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var view = button.getAttribute("data-view");
                    grid.classList.toggle("list-mode", view === "list");
                    viewButtons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                });
            });
            apply();
        });
    }

    function setupPlayers() {
        var stages = document.querySelectorAll(".player-stage");
        stages.forEach(function (stage) {
            var video = stage.querySelector("video");
            var trigger = stage.querySelector(".play-trigger");
            var streamUrl = stage.getAttribute("data-stream-url");
            var hlsInstance = null;
            if (!video || !trigger || !streamUrl) {
                return;
            }
            function attach() {
                if (video.dataset.ready === "true") {
                    return Promise.resolve();
                }
                video.dataset.ready = "true";
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    return new Promise(function (resolve) {
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                    });
                }
                video.src = streamUrl;
                return Promise.resolve();
            }
            function play() {
                attach().then(function () {
                    trigger.classList.add("hide");
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {
                            trigger.classList.remove("hide");
                        });
                    }
                });
            }
            trigger.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
