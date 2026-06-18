(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var topButton = document.querySelector('[data-back-to-top]');

    if (topButton) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 500) {
                topButton.classList.add('is-visible');
            } else {
                topButton.classList.remove('is-visible');
            }
        });

        topButton.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        if (slides.length > 1) {
            startHero();
        }
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-site-search-form]'));

    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = 'search.html';
            }
        });
    });

    var filterInput = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var list = document.querySelector('[data-filter-list]');
    var empty = document.querySelector('[data-empty-state]');

    function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function yearMatches(card, value) {
        if (!value) {
            return true;
        }
        var year = card.getAttribute('data-year') || '';
        if (value === 'classic') {
            var parsed = parseInt(year, 10);
            return !parsed || parsed < 2015;
        }
        return year === value;
    }

    function filterCards() {
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search-card]'));
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var yearValue = yearSelect ? yearSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-category') || ''
            ].join(' ').toLowerCase();
            var matched = (!keyword || haystack.indexOf(keyword) !== -1) && yearMatches(card, yearValue);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterInput) {
        var query = getQueryValue();
        if (query) {
            filterInput.value = query;
        }
        filterInput.addEventListener('input', filterCards);
        filterCards();
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', filterCards);
    }
})();
