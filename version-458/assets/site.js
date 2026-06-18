(function () {
  var nav = document.querySelector('[data-nav]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-menu-panel]');

  function refreshNav() {
    if (!nav) {
      return;
    }
    if (window.scrollY > 48) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }

  refreshNav();
  window.addEventListener('scroll', refreshNav, { passive: true });

  if (toggle && nav && panel) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  document.querySelectorAll('img[data-cover]').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-hidden');
      var cover = image.closest('.card-cover');
      if (cover) {
        cover.classList.add('cover-empty');
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
  var activeSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle('is-active', thumbIndex === activeSlide);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }
    slideTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  thumbs.forEach(function (thumb, index) {
    thumb.addEventListener('click', function () {
      if (slideTimer) {
        window.clearInterval(slideTimer);
      }
      showSlide(index);
      startSlides();
    });
  });

  showSlide(0);
  startSlides();

  document.querySelectorAll('[data-filter-list]').forEach(function (list) {
    var scope = list.closest('[data-filter-scope]') || document;
    var input = scope.querySelector('[data-filter-input]');
    var select = scope.querySelector('[data-filter-select]');
    var empty = scope.querySelector('[data-empty-state]');

    function applyFilter() {
      var words = input ? input.value.trim().toLowerCase() : '';
      var selected = select ? select.value : 'all';
      var visible = 0;
      list.querySelectorAll('[data-card]').forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var meta = (card.getAttribute('data-meta') || '').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var matchWords = !words || title.indexOf(words) !== -1 || meta.indexOf(words) !== -1;
        var matchType = selected === 'all' || type.indexOf(selected) !== -1;
        var ok = matchWords && matchType;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applyFilter);
    }
    applyFilter();
  });

  var searchDataTag = document.getElementById('search-data');
  var searchResults = document.querySelector('[data-search-results]');
  var pageSearchInput = document.querySelector('[data-page-search]');
  var pageSearchForm = document.querySelector('[data-page-search-form]');

  function renderSearch(query) {
    if (!searchDataTag || !searchResults) {
      return;
    }
    var items = [];
    try {
      items = JSON.parse(searchDataTag.textContent || '[]');
    } catch (error) {
      items = [];
    }
    var q = (query || '').trim().toLowerCase();
    var resultItems = items.filter(function (item) {
      if (!q) {
        return true;
      }
      return [item.title, item.region, item.genre, item.tags, item.desc].join(' ').toLowerCase().indexOf(q) !== -1;
    }).slice(0, 80);
    searchResults.innerHTML = resultItems.map(function (item) {
      return '<article class="movie-card" data-card>' +
        '<a class="card-cover" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" data-cover>' +
        '<span class="play-chip">播放</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>' +
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.desc) + '</p>' +
        '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join('');
    searchResults.querySelectorAll('img[data-cover]').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
        var cover = image.closest('.card-cover');
        if (cover) {
          cover.classList.add('cover-empty');
        }
      });
    });
    var empty = document.querySelector('[data-search-empty]');
    if (empty) {
      empty.classList.toggle('is-visible', resultItems.length === 0);
    }
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  if (pageSearchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    pageSearchInput.value = initial;
    renderSearch(initial);
    pageSearchInput.addEventListener('input', function () {
      renderSearch(pageSearchInput.value);
    });
    if (pageSearchForm) {
      pageSearchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        renderSearch(pageSearchInput.value);
      });
    }
  }

  document.querySelectorAll('[data-video-url]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-mask');
    var state = shell.querySelector('.player-state');
    var stream = shell.getAttribute('data-video-url');
    var loaded = false;
    var player = null;

    function setState(text) {
      if (state) {
        state.textContent = text || '';
      }
    }

    function startVideo() {
      if (!video || !stream) {
        setState('播放暂不可用');
        return;
      }
      shell.classList.add('is-playing');
      if (!loaded) {
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          player = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          player.loadSource(stream);
          player.attachMedia(video);
          player.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setState('点击视频继续播放');
            });
          });
          player.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setState('网络连接异常，正在重试');
              player.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setState('媒体加载异常，正在恢复');
              player.recoverMediaError();
            } else {
              setState('播放暂不可用');
              player.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {
              setState('点击视频继续播放');
            });
          }, { once: true });
        } else {
          setState('播放暂不可用，请更换浏览器');
        }
      } else {
        video.play().catch(function () {
          setState('点击视频继续播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', startVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          startVideo();
        }
      });
      video.addEventListener('playing', function () {
        shell.classList.add('is-playing');
        setState('');
      });
    }
    window.addEventListener('beforeunload', function () {
      if (player) {
        player.destroy();
      }
    });
  });
})();
