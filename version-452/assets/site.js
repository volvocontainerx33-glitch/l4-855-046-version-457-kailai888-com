(function () {
    var header = document.querySelector('[data-header]');
    var nav = document.querySelector('[data-nav]');
    var navToggle = document.querySelector('[data-nav-toggle]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 42) {
            header.classList.add('is-solid');
        } else {
            header.classList.remove('is-solid');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var list = document.querySelector('[data-filter-list]');
    if (list) {
        var input = document.querySelector('[data-filter-input]');
        var region = document.querySelector('[data-filter-region]');
        var type = document.querySelector('[data-filter-type]');
        var year = document.querySelector('[data-filter-year]');
        var empty = document.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .rank-row'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function filterCards() {
            var keyword = normalize(input && input.value);
            var selectedRegion = region ? region.value : '全部';
            var selectedType = type ? type.value : '全部';
            var selectedYear = year ? year.value : '全部';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type
                ].join(' '));
                var okKeyword = !keyword || text.indexOf(keyword) >= 0;
                var okRegion = selectedRegion === '全部' || card.dataset.region === selectedRegion;
                var okType = selectedType === '全部' || card.dataset.type === selectedType;
                var okYear = selectedYear === '全部' || card.dataset.year === selectedYear;
                var show = okKeyword && okRegion && okType && okYear;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, region, type, year].forEach(function (node) {
            if (node) {
                node.addEventListener('input', filterCards);
                node.addEventListener('change', filterCards);
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-card')).forEach(function (card) {
        var video = card.querySelector('video');
        var button = card.querySelector('.play-cover');
        var hlsUrl = card.getAttribute('data-hls');
        var hlsInstance = null;

        function prepare() {
            if (!video || !hlsUrl || card.dataset.ready === '1') {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(hlsUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = hlsUrl;
            }
            card.dataset.ready = '1';
        }

        function play() {
            prepare();
            card.classList.add('is-playing');
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    card.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        card.addEventListener('click', function (event) {
            if (event.target && event.target.tagName === 'VIDEO' && card.classList.contains('is-playing')) {
                return;
            }
            play();
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
