/* =============================================================================
   Torin Gunnell Digital — Real Estate page behaviour
   -----------------------------------------------------------------------------
   Only loaded on /real-estate/:
     - counts the stat numbers up when they scroll into view
     - adds a mute/unmute button to each Vimeo reel (via the Vimeo Player SDK);
       unmuting one reel mutes the rest so audio never overlaps
   The shared scripts.js still handles the header and reveal animations.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------------
     Stats band: count numbers up from zero the first time they scroll in.
     Markup: <span class="re-stat-num" data-count="100" data-suffix="+">100+</span>
     (The final value is already in the HTML, so no JS = correct numbers.)
  --------------------------------------------------------------------------- */
  var statNums = Array.prototype.slice.call(document.querySelectorAll(".re-stat-num[data-count]"));
  if (statNums.length && !reduceMotion && "IntersectionObserver" in window) {
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var animate = function (el) {
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || "";
      var duration = 1200;
      var start = null;
      var tick = function (now) {
        if (start === null) start = now;
        var t = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(ease(t) * target).toLocaleString() + suffix;
        if (t < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    };
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          sio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statNums.forEach(function (el) { sio.observe(el); });
  }

  /* ---------------------------------------------------------------------------
     Reel volume toggle.
     The reels autoplay muted (Vimeo background mode). Each gets a mute/unmute
     button driven by the Vimeo Player SDK; unmuting one reel mutes the others
     so audio never overlaps.
  --------------------------------------------------------------------------- */
  if (window.Vimeo && window.Vimeo.Player) {
    var ICON_OFF = '<svg class="ic-off" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.83-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18z"/></svg>';
    var ICON_ON = '<svg class="ic-on" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';

    var boxes = Array.prototype.slice.call(document.querySelectorAll(".re-video"));
    var reels = [];

    boxes.forEach(function (box) {
      var iframe = box.querySelector("iframe");
      if (!iframe) return;

      var player = new window.Vimeo.Player(iframe);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "re-mute";
      btn.innerHTML = ICON_OFF + ICON_ON;
      box.appendChild(btn);

      var entry = { box: box, player: player, mute: null };

      entry.mute = function (m) {
        player.setMuted(m).catch(function () {});
        box.classList.toggle("is-muted", m);
        btn.setAttribute("aria-pressed", String(!m));
        btn.setAttribute("aria-label", m ? "Unmute video" : "Mute video");
      };
      entry.mute(true);
      reels.push(entry);

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var isMuted = box.classList.contains("is-muted");
        if (isMuted) {
          reels.forEach(function (o) { if (o !== entry) o.mute(true); });
          entry.mute(false);
          player.setVolume(1).catch(function () {});
          var p = player.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          entry.mute(true);
        }
      });
    });
  }
})();
