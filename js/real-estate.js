/* =============================================================================
   Torin Gunnell Digital — Real Estate page behaviour
   -----------------------------------------------------------------------------
   Only loaded on /real-estate/. Drives the work-gallery tiles:
     - videos stay as posters (preload="none") until someone presses play
     - first play swaps source data-src -> src, unmutes, and starts the loop
     - pressing again pauses; starting one tile pauses all the others
   The shared scripts.js still handles the header, reveal animations, and the
   hero background reel.
   ========================================================================== */
(function () {
  "use strict";

  var tiles = Array.prototype.slice.call(document.querySelectorAll(".re-video"));
  if (!tiles.length) return;

  function pauseTile(tile) {
    var video = tile.querySelector("video");
    if (video && !video.paused) video.pause();
    tile.classList.remove("is-playing");
  }

  tiles.forEach(function (tile) {
    var video = tile.querySelector("video");
    var button = tile.querySelector(".re-play");
    if (!video || !button) return;

    button.addEventListener("click", function () {
      if (tile.classList.contains("is-playing")) {
        pauseTile(tile);
        return;
      }

      // One at a time — quiet the rest of the gallery.
      tiles.forEach(function (other) { if (other !== tile) pauseTile(other); });

      // Lazy-load the file on first play (CLAUDE.md §6 hover-video pattern).
      var source = video.querySelector("source[data-src]");
      if (source && !source.src) {
        source.src = source.dataset.src;
        video.load();
      }

      // Listing films are scored — play with sound once the viewer asks for it.
      video.muted = false;
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
      tile.classList.add("is-playing");

      button.setAttribute("aria-label", "Pause video");
    });

    video.addEventListener("pause", function () {
      tile.classList.remove("is-playing");
      button.setAttribute("aria-label", "Play video");
    });
    video.addEventListener("play", function () {
      tile.classList.add("is-playing");
    });
  });
})();
