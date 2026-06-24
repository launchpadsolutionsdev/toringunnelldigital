/* =============================================================================
   Torin Gunnell Digital — site behaviour
   -----------------------------------------------------------------------------
   Vanilla JS, no dependencies. Progressive enhancement: the page is fully
   usable with this file absent. Responsibilities:
     - mark <html> as js-enabled (unlocks reveal animations)
     - header: hide on scroll-down / show on scroll-up; go solid past the hero
     - dismissible announcement bar (remembered for the session)
     - mobile menu toggle
     - reveal-on-scroll via IntersectionObserver (with stagger)
     - lazy hero/feature videos + hover-to-play film-card clips (R2-hosted)
     - current footer year
   ========================================================================== */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------------
     Header: hide on scroll-down, reveal on scroll-up; solid past the hero.
     Pages with a dark full-bleed hero set <body class="has-hero">. Others
     keep a solid header from the top.
  --------------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var hasHero = document.body.classList.contains("has-hero");
    var lastY = window.pageYOffset;
    var solidAt = hasHero ? window.innerHeight * 0.6 : 0;
    var headerH = header.offsetHeight; // don't hide until scrolled past the bar

    if (!hasHero) header.classList.add("is-solid");

    var onScroll = function () {
      var y = window.pageYOffset;

      // Solid background past the hero — but inner pages (no hero) stay solid
      // always, so the header never goes white-on-paper and vanishes at the top.
      if (!hasHero || y > solidAt) header.classList.add("is-solid");
      else header.classList.remove("is-solid");

      // Hide when scrolling down past the header; show when scrolling up.
      if (y > lastY && y > headerH) header.classList.add("is-hidden");
      else header.classList.remove("is-hidden");

      lastY = y;
    };

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { onScroll(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------------
     Announcement bar — dismiss for the session.
  --------------------------------------------------------------------------- */
  var closeBtn = document.querySelector(".announcement-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      doc.classList.add("announcement-dismissed");
      try { sessionStorage.setItem("tgd-announcement-dismissed", "1"); } catch (e) {}
    });
  }

  /* ---------------------------------------------------------------------------
     Mobile menu.
  --------------------------------------------------------------------------- */
  var toggle = document.querySelector(".hamburger");
  var menu = document.querySelector(".mobile-menu");
  if (toggle && menu) {
    var setMenu = function (open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    // Close on link click or Escape.
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------------------------------------------------------------------------
     Reveal on scroll (with optional stagger via data-stagger on the parent).
  --------------------------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            // Stagger direct children if requested.
            if (el.hasAttribute("data-stagger")) {
              Array.prototype.forEach.call(el.children, function (child, i) {
                child.style.setProperty("--d", (i * 90) + "ms");
              });
            }
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------------------------------------------------------------------------
     Video helpers.
     - Background videos (hero / feature / footer): <video data-bg-video> whose
       <source> carries data-src. Loaded + played when near the viewport.
     - Hover clips (film cards): <video class="hover-clip"> loaded + played on
       pointer enter, paused on leave. Touch devices ignore (poster only).
  --------------------------------------------------------------------------- */
  function loadVideo(video) {
    if (video.dataset.loaded) return;
    var source = video.querySelector("source[data-src]");
    if (source) { source.src = source.dataset.src; video.load(); }
    video.dataset.loaded = "1";
  }

  // Background videos — autoplay when in view.
  var bgVideos = Array.prototype.slice.call(document.querySelectorAll("[data-bg-video]"));
  if (bgVideos.length) {
    if ("IntersectionObserver" in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var v = entry.target;
          if (entry.isIntersecting) {
            loadVideo(v);
            var p = v.play();
            if (p && p.catch) p.catch(function () {});
          } else if (v.pause) {
            v.pause();
          }
        });
      }, { rootMargin: "200px 0px", threshold: 0.01 });
      bgVideos.forEach(function (v) { vio.observe(v); });
    } else {
      bgVideos.forEach(loadVideo);
    }
  }

  // Background Vimeo iframes (.bg-vimeo): autoplaying muted cover loops. Load
  // data-src -> src once when they near the viewport.
  var bgFrames = Array.prototype.slice.call(document.querySelectorAll(".bg-vimeo iframe[data-src]"));
  if (bgFrames.length) {
    if ("IntersectionObserver" in window) {
      var bfio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var f = entry.target;
            if (!f.src) f.src = f.dataset.src;
            bfio.unobserve(f);
          }
        });
      }, { rootMargin: "300px 0px", threshold: 0.01 });
      bgFrames.forEach(function (f) { bfio.observe(f); });
    } else {
      bgFrames.forEach(function (f) { f.src = f.dataset.src; });
    }
  }

  // Wedding-films player cards: cover each Vimeo player with its own thumbnail
  // at rest (hiding Vimeo's resting play button), then fade the cover on hover
  // to reveal the native player + controls. The poster is fetched from Vimeo's
  // oEmbed endpoint. Once a film is started (poster clicked) it stays revealed.
  var coverCards = Array.prototype.slice.call(document.querySelectorAll(".film-card--player"));
  coverCards.forEach(function (card) {
    var iframe = card.querySelector(".video-embed iframe");
    if (!iframe || !iframe.src) return;

    // Pull the numeric video id from the player URL.
    var m = iframe.src.match(/video\/(\d+)/);
    if (!m) return;
    var videoUrl = "https://vimeo.com/" + m[1];

    var poster = document.createElement("div");
    poster.className = "video-poster";
    iframe.parentNode.appendChild(poster);

    // Get a large thumbnail (no API key needed).
    fetch("https://vimeo.com/api/oembed.json?url=" + encodeURIComponent(videoUrl) + "&width=1280")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.thumbnail_url) {
          // Ask Vimeo for a larger, crop-friendly version of the thumb.
          var url = data.thumbnail_url.replace(/-d_\d+x\d+$/, "-d_1280x720");
          poster.style.backgroundImage = "url('" + url + "')";
          card.classList.add("has-cover");
        }
      })
      .catch(function () {});

    // Reveal the player on first hover and keep it revealed (don't re-cover on
    // mouse-leave). Clicking also reveals and starts the film with sound.
    card.addEventListener("mouseenter", function () {
      poster.classList.add("is-hidden");
    });
    poster.addEventListener("click", function () {
      poster.classList.add("is-hidden");
      if (iframe.src.indexOf("autoplay=1") === -1) {
        iframe.src += (iframe.src.indexOf("?") === -1 ? "?" : "&") + "autoplay=1";
      }
    });
  });

  // Featured film cards (Vimeo): show a still frame, then play on hover and
  // pause on mouse-leave — like a thumbnail that comes alive. Uses the Vimeo
  // Player SDK. The iframe loads (data-src -> src) the first time it nears the
  // viewport; once ready we seek to a frame and pause so it reads as a poster.
  var embedCards = Array.prototype.slice.call(document.querySelectorAll(".film-card--embed"));
  if (embedCards.length && window.Vimeo && window.Vimeo.Player) {
    var initCard = function (card) {
      var iframe = card.querySelector("iframe[data-src]");
      if (!iframe || iframe.dataset.loaded) return;
      iframe.src = iframe.dataset.src;
      iframe.dataset.loaded = "1";

      var player = new window.Vimeo.Player(iframe);
      // Leave the player un-started so it displays the thumbnail set in Vimeo
      // (seeking would instead show the actual frame at that timestamp).
      player.ready().then(function () {
        player.setVolume(0);
      });

      card.addEventListener("mouseenter", function () {
        player.play().catch(function () {});
      });
      card.addEventListener("mouseleave", function () {
        player.pause().catch(function () {});
      });
    };

    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            initCard(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { rootMargin: "300px 0px", threshold: 0.01 });
      embedCards.forEach(function (c) { cio.observe(c); });
    } else {
      embedCards.forEach(initCard);
    }
  }

  // Hover-to-play film card clips.
  var hoverCards = Array.prototype.slice.call(document.querySelectorAll(".film-card"));
  hoverCards.forEach(function (card) {
    var clip = card.querySelector(".hover-clip");
    if (!clip) return;
    card.addEventListener("mouseenter", function () {
      loadVideo(clip);
      var p = clip.play();
      if (p && p.catch) p.catch(function () {});
    });
    card.addEventListener("mouseleave", function () {
      if (clip.pause) clip.pause();
    });
  });

  /* ---------------------------------------------------------------------------
     Thumbnail film (.video-embed[data-vol-player]): rests on a Vimeo thumbnail,
     plays muted on hover (reverts to the thumbnail on leave), and the brass
     button starts it with sound and keeps it playing. Uses the Vimeo Player SDK.
  --------------------------------------------------------------------------- */
  var volPlayers = Array.prototype.slice.call(document.querySelectorAll("[data-vol-player]"));
  if (volPlayers.length && window.Vimeo && window.Vimeo.Player) {
    volPlayers.forEach(function (wrap) {
      var iframe = wrap.querySelector("iframe[data-src]");
      var btn = wrap.querySelector(".vol-toggle");
      if (!iframe) return;

      var player = null;
      var muted = true;       // current sound state
      var started = false;    // poster hidden / playing
      var committed = false;  // clicked: hover-leave won't revert to the thumbnail

      // Resting thumbnail over the player (fetched from Vimeo's oEmbed).
      var poster = document.createElement("div");
      poster.className = "video-poster";
      iframe.parentNode.insertBefore(poster, iframe.nextSibling);

      var idMatch = iframe.dataset.src.match(/video\/(\d+)/);
      if (idMatch) {
        fetch("https://vimeo.com/api/oembed.json?url=" +
              encodeURIComponent("https://vimeo.com/" + idMatch[1]) + "&width=1280")
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data && data.thumbnail_url) {
              var url = data.thumbnail_url.replace(/-d_\d+x\d+$/, "-d_1280x960");
              poster.style.backgroundImage = "url('" + url + "')";
            }
          }).catch(function () {});
      }

      // Load the iframe (data-src -> src) and create the SDK player once.
      var ensure = function () {
        if (!iframe.dataset.loaded) {
          iframe.src = iframe.dataset.src;
          iframe.dataset.loaded = "1";
          player = new window.Vimeo.Player(iframe);
          player.ready().then(function () { player.setMuted(true); }).catch(function () {});
        }
        return player;
      };

      var reveal = function () {
        started = true;
        poster.classList.add("is-hidden");
        var pl = ensure();
        pl.ready().then(function () {
          var p = pl.play();
          if (p && p.catch) p.catch(function () {});
        }).catch(function () {});
      };

      var setMuted = function (next) {
        var pl = ensure();
        muted = next;
        pl.ready().then(function () {
          pl.setMuted(next);
          if (!next) { pl.setVolume(1); pl.play().catch(function () {}); }
        }).catch(function () {});
        if (btn) {
          btn.setAttribute("aria-pressed", String(!next));
          btn.setAttribute("aria-label", next ? "Unmute video" : "Mute video");
        }
      };

      // Hover preview (muted); revert to the thumbnail on leave unless committed.
      wrap.addEventListener("mouseenter", function () { reveal(); });
      wrap.addEventListener("mouseleave", function () {
        if (committed || !player) return;
        poster.classList.remove("is-hidden");
        started = false;
        player.pause().catch(function () {});
      });

      // Tap the thumbnail: start muted and keep it (touch-friendly).
      poster.addEventListener("click", function () { committed = true; reveal(); });

      // Volume button: reveal, keep it playing, and toggle sound.
      if (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          committed = true;
          if (!started) reveal();
          setMuted(!muted);
        });
      }

      // Warm up the player as it nears the viewport (no autoplay — poster stays).
      if ("IntersectionObserver" in window) {
        var pio = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { ensure(); pio.unobserve(entry.target); }
          });
        }, { rootMargin: "300px 0px", threshold: 0.01 });
        pio.observe(wrap);
      } else {
        ensure();
      }
    });
  }

  /* ---------------------------------------------------------------------------
     Footer year.
  --------------------------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
