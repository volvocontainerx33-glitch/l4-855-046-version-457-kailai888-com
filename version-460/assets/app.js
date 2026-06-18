(function () {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initImages() {
        $$('img').forEach((img) => {
            const markMissing = () => {
                if (img.naturalWidth === 0) {
                    img.classList.add('image-missing');
                    const wrap = img.closest('.poster, .hero-background, .hero-poster, .category-tile, .category-visual, .ranking-poster, .rank-thumb, .small-poster, .detail-bg, .detail-cover, .search-item');
                    if (wrap) {
                        wrap.classList.add('image-fallback');
                    }
                }
            };
            img.addEventListener('error', markMissing, { once: true });
            if (img.complete) {
                markMissing();
            }
        });
    }

    function initMenu() {
        const button = $('[data-menu-toggle]');
        const menu = $('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', () => {
            const open = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        const root = $('[data-hero-slider]');
        if (!root) {
            return;
        }
        const slides = $$('[data-hero-slide]', root);
        const dots = $$('[data-hero-dot]', root);
        const prev = $('[data-hero-prev]', root);
        const next = $('[data-hero-next]', root);
        if (!slides.length) {
            return;
        }
        let index = 0;
        let timer = null;
        const show = (nextIndex) => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
        };
        const play = () => {
            stop();
            timer = window.setInterval(() => show(index + 1), 5200);
        };
        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };
        prev && prev.addEventListener('click', () => {
            show(index - 1);
            play();
        });
        next && next.addEventListener('click', () => {
            show(index + 1);
            play();
        });
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                show(i);
                play();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', play);
        play();
    }

    function renderSearchResults(form, query) {
        const box = $('[data-search-results]', form);
        if (!box) {
            return;
        }
        const data = window.MOVIE_SEARCH_DATA || [];
        const q = normalize(query);
        if (!q) {
            box.hidden = true;
            box.innerHTML = '';
            return;
        }
        const matches = data.filter((item) => normalize(item.search).includes(q)).slice(0, 9);
        if (!matches.length) {
            box.innerHTML = '<div class="search-empty">没有匹配结果</div>';
            box.hidden = false;
            return;
        }
        box.innerHTML = matches.map((item) => `
            <a class="search-item" href="${item.url}">
                <span><img src="./${item.cover}" alt="${item.title}" loading="lazy"></span>
                <span>
                    <strong>${item.title}</strong>
                    <em>${item.year} · ${item.region} · ${item.genre}</em>
                </span>
            </a>
        `).join('');
        box.hidden = false;
        initImages();
    }

    function initSearch() {
        $$('[data-search-form]').forEach((form) => {
            const input = $('[data-search-input]', form);
            if (!input) {
                return;
            }
            input.addEventListener('input', () => renderSearchResults(form, input.value));
            input.addEventListener('focus', () => renderSearchResults(form, input.value));
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const q = normalize(input.value);
                const data = window.MOVIE_SEARCH_DATA || [];
                const first = data.find((item) => normalize(item.search).includes(q));
                if (first) {
                    window.location.href = first.url;
                } else {
                    renderSearchResults(form, input.value);
                }
            });
        });
        document.addEventListener('click', (event) => {
            $$('[data-search-form]').forEach((form) => {
                if (!form.contains(event.target)) {
                    const box = $('[data-search-results]', form);
                    if (box) {
                        box.hidden = true;
                    }
                }
            });
        });
    }

    function initPageFilter() {
        $$('[data-page-filter]').forEach((input) => {
            const cards = $$('[data-card]');
            const empty = $('[data-filter-empty]');
            const apply = () => {
                const q = normalize(input.value);
                let visible = 0;
                cards.forEach((card) => {
                    const ok = !q || normalize(card.dataset.search).includes(q);
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            };
            input.addEventListener('input', apply);
        });
    }

    function initPlayers() {
        $$('[data-player]').forEach((player) => {
            const video = $('video[data-src]', player);
            const button = $('[data-play]', player);
            if (!video) {
                return;
            }
            const source = video.dataset.src;
            let hlsInstance = null;
            const attach = () => {
                if (video.dataset.ready === 'true') {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.dataset.ready = 'true';
            };
            const start = () => {
                attach();
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {
                        player.classList.remove('is-playing');
                    });
                }
            };
            if (button) {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    start();
                });
            }
            video.addEventListener('play', () => player.classList.add('is-playing'));
            video.addEventListener('pause', () => player.classList.remove('is-playing'));
            video.addEventListener('ended', () => player.classList.remove('is-playing'));
            window.addEventListener('beforeunload', () => {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(() => {
        initImages();
        initMenu();
        initHero();
        initSearch();
        initPageFilter();
        initPlayers();
    });
})();
