document.addEventListener("DOMContentLoaded", function () {
  // ---------------------------------------------------------------------------
  // Headline: 글자 단위 분할 후 올라오며 등장 (index)
  // ---------------------------------------------------------------------------
  (function initHeadlineSplit() {
    var headline = document.querySelector(".headline");
    if (!headline || typeof gsap === "undefined") return;
    var lineSpans = headline.querySelectorAll("span");
    var allChars = [];
    lineSpans.forEach(function (lineSpan) {
      var text = lineSpan.textContent;
      lineSpan.textContent = "";
      for (var i = 0; i < text.length; i++) {
        var charSpan = document.createElement("span");
        charSpan.className = "headline-char";
        charSpan.style.display = "inline-block";
        charSpan.textContent = text[i];
        lineSpan.appendChild(charSpan);
        allChars.push(charSpan);
      }
    });
    if (allChars.length) {
      gsap.from(allChars, {
        y: 100,
        autoAlpha: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  })();

  // 서브페이지 공통: Lenis 스무스 스크롤 (body--sub 있을 때만)
  (function initLenisSubpage() {
    if (!document.body.classList.contains("body--sub") || typeof Lenis === "undefined") return;
    var lenis = new Lenis({
      duration: 1.15,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
    });
    function lenisRaf(time) {
      lenis.raf(time);
      requestAnimationFrame(lenisRaf);
    }
    requestAnimationFrame(lenisRaf);
  })();

  // MY STORY(about): 스크롤 시 테트리스 블록 등장 + 우측 콘텐츠 제자리 크로스페이드
  (function initMystoryScroll() {
    var layout = document.getElementById("mystoryLayout");
    var stackBoard = document.getElementById("stackBoard");
    var panels = document.querySelectorAll(".mystory-section.content-panel-wrap");
    if (!layout || !stackBoard || !panels.length || typeof gsap === "undefined") return;

    var blocks = stackBoard.querySelectorAll(".stack-block");
    var fullscreen = layout.querySelector(".mystory-fullscreen");
    var spacer = layout.querySelector(".mystory-scroll-spacer");
    var currentStep = -1;
    var sectionHeight = typeof window !== "undefined" ? window.innerHeight : 800;

    if (spacer) {
      spacer.style.height = (panels.length + 1) * 100 + "vh";
    }

    function getBlocksByPiece(pieceIndex) {
      return Array.prototype.filter.call(blocks, function (b) {
        return Number(b.getAttribute("data-piece")) === pieceIndex;
      });
    }

    function revealPiece(pieceIndex) {
      var pieceBlocks = getBlocksByPiece(pieceIndex);
      gsap.killTweensOf(pieceBlocks);
      pieceBlocks.forEach(function (b) {
        b.classList.add("is-visible");
      });
      gsap.set(pieceBlocks, { y: 0, autoAlpha: 1 });
      gsap.from(pieceBlocks, {
        y: -180,
        autoAlpha: 0,
        duration: 0.52,
        ease: "power3.out",
      });
    }

    function hidePiece(pieceIndex, delay) {
      var pieceBlocks = getBlocksByPiece(pieceIndex);
      gsap.killTweensOf(pieceBlocks);
      gsap.to(pieceBlocks, {
        y: -180,
        autoAlpha: 0,
        duration: 0.42,
        delay: delay || 0,
        ease: "power3.in",
        onComplete: function () {
          pieceBlocks.forEach(function (b) {
            b.classList.remove("is-visible");
          });
        },
      });
    }

    var sectionToPiece = [0, 3, 1, 2];

    function setStep(step) {
      if (step === currentStep || step < 0) return;
      if (step > currentStep) {
        for (var s = currentStep + 1; s <= step; s++) {
          revealPiece(sectionToPiece[s]);
        }
        currentStep = step;
        stackBoard.setAttribute("data-step", String(step));
      } else {
        var delay = 0;
        for (var s = currentStep; s > step; s--) {
          hidePiece(sectionToPiece[s], delay);
          delay += 0.35;
        }
        currentStep = step;
        stackBoard.setAttribute("data-step", String(step));
      }
    }

    function updateMystory() {
      var layoutTop = layout.getBoundingClientRect
        ? layout.getBoundingClientRect().top + window.pageYOffset
        : layout.offsetTop;
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var vh = window.innerHeight;
      sectionHeight = vh;

      var offset = scrollY - layoutTop;
      if (offset < 0) offset = 0;
      var sectionIndex = Math.floor(offset / vh);
      if (sectionIndex < 0) sectionIndex = 0;
      if (sectionIndex >= panels.length) sectionIndex = panels.length - 1;

      for (var i = 0; i < panels.length; i++) {
        var visible = i === sectionIndex;
        panels[i].style.opacity = visible ? 1 : 0;
        panels[i].classList.toggle("is-visible", visible);
      }

      if (fullscreen) {
        var fullscreenThreshold = panels.length * vh;
        var showFullscreen = offset >= fullscreenThreshold;
        if (showFullscreen) {
          for (var j = 0; j < panels.length; j++) {
            panels[j].style.opacity = 0;
            panels[j].classList.remove("is-visible");
          }
        }
        fullscreen.style.opacity = showFullscreen ? 1 : 0;
        fullscreen.classList.toggle("is-visible", showFullscreen);
      }

      if (sectionIndex !== currentStep) setStep(sectionIndex);
    }

    setStep(0);
    updateMystory();

    window.addEventListener(
      "scroll",
      function () {
        requestAnimationFrame(updateMystory);
      },
      { passive: true }
    );
    window.addEventListener("resize", function () {
      requestAnimationFrame(updateMystory);
    });
  })();

  // ---------------------------------------------------------------------------
  // Index: board tiles (flip, active group)
  // ---------------------------------------------------------------------------
  var board = document.querySelector(".board-grid");
  if (!board) return;

  var menuTiles = Array.prototype.slice.call(
    board.querySelectorAll(".tile--menu")
  );

  var backFonts = [
    "'Playtime With Hot Toddies', sans-serif",
    "'Pixelify Sans', sans-serif",
    "'Bangers', sans-serif",
    "'Pangolin', sans-serif",
    "'Mynerve', sans-serif",
  ];

  function setActiveGroup(group) {
    menuTiles.forEach(function (tile) {
      var tileGroup = tile.dataset.group;
      if (!tileGroup) return;
      if (tileGroup === group) {
        tile.classList.add("is-active");
      } else {
        tile.classList.remove("is-active");
      }
    });
  }

  var durationFlip = 0.55;
  var durationFlipBack = 0.5;
  var easeElastic = "elastic.out(1, 0.5)";
  var easeOut = "power2.out";

  menuTiles.forEach(function (tile) {
    var inner = tile.querySelector(".tile--menu__inner");
    var front = tile.querySelector(".tile__front");
    var back = tile.querySelector(".tile__back");
    if (!inner || !front || !back) return;

    tile.addEventListener("mouseenter", function () {
      if (tile._hideBackCall) {
        tile._hideBackCall.kill();
        tile._hideBackCall = null;
      }
      back.style.fontFamily =
        backFonts[Math.floor(Math.random() * backFonts.length)];
      tile.classList.add("is-hover");
      gsap.killTweensOf([front, back]);
      gsap.to(front, {
        rotationX: -90,
        duration: durationFlip,
        ease: easeElastic,
        force3D: true,
        overwrite: true,
        transformOrigin: "center bottom",
      });
      gsap.to(back, {
        rotationX: 0,
        z: 0,
        duration: durationFlip,
        ease: easeElastic,
        force3D: true,
        overwrite: true,
        transformOrigin: "center top",
      });
    });

    tile.addEventListener("mouseleave", function () {
      gsap.killTweensOf([front, back]);
      gsap.to(front, {
        rotationX: 0,
        duration: durationFlipBack,
        ease: easeOut,
        force3D: true,
        overwrite: true,
        transformOrigin: "center bottom",
      });
      gsap.to(back, {
        rotationX: -90,
        duration: durationFlipBack,
        ease: easeOut,
        force3D: true,
        overwrite: true,
        transformOrigin: "center top",
        onComplete: function () {
          gsap.set(front, { rotationX: 0, transformOrigin: "center bottom" });
          gsap.set(back, {
            rotationX: -90,
            z: -1,
            transformOrigin: "center top",
          });
          tile.classList.remove("is-hover");
        },
      });
      tile._hideBackCall = gsap.delayedCall(durationFlipBack * 0.28, function () {
        tile.classList.remove("is-hover");
        tile._hideBackCall = null;
      });
    });
  });

  board.addEventListener("click", function (event) {
    var target = event.target;
    var tile = target.closest(".tile--menu");
    if (!tile || !board.contains(tile)) return;
    var group = tile.dataset.group;
    if (!group) return;
    setActiveGroup(group);
  });
});
