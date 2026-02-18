document.addEventListener("DOMContentLoaded", function () {
  // ---------------------------------------------------------------------------
  // Masked text reveal (index headline + mystory panels)
  // ---------------------------------------------------------------------------
  (function initReveal() {
    if (typeof gsap === "undefined") return;

    function wrapReveal(el) {
      if (!el || !el.firstChild) return;
      if (el.querySelector(".reveal")) return;
      if (el.querySelector("img, svg, iframe")) return;
      var wrap = document.createElement("span");
      wrap.className = "reveal";
      var inner = document.createElement("span");
      inner.className = "reveal__inner";
      while (el.firstChild) inner.appendChild(el.firstChild);
      wrap.appendChild(inner);
      el.appendChild(wrap);
    }

    var isSub = document.body.classList.contains("body--sub");

    if (!isSub) {
      var headline = document.querySelector(".headline");
      if (headline) {
        var lineSpans = [].filter.call(headline.childNodes, function (n) {
          return n.nodeType === 1 && n.tagName === "SPAN";
        });
        lineSpans.forEach(wrapReveal);
        var inners = headline.querySelectorAll(".reveal__inner");
        if (inners.length && typeof ScrollTrigger !== "undefined") {
          gsap.registerPlugin(ScrollTrigger);
          gsap.set(inners, { y: "110%", opacity: 0 });
          ScrollTrigger.create({
            trigger: headline,
            start: "top 80%",
            onEnter: function () {
              gsap.to(inners, {
                y: 0,
                opacity: 1,
                duration: 0.85,
                stagger: 0.06,
                ease: "power3.out",
              });
            },
          });
        } else if (inners.length) {
          gsap.set(inners, { y: "110%", opacity: 0 });
          gsap.to(inners, {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.06,
            ease: "power3.out",
          });
        }
      }

      var boardEl = document.querySelector(".board");
      if (boardEl) {
        var startY = typeof window !== "undefined" ? window.innerHeight : 800;
        gsap.set(boardEl, { y: startY });
        gsap.to(boardEl, {
          y: 0,
          duration: 1.1,
          ease: "power3.out",
        });
      }
    } else {
      var panels = document.querySelectorAll(".mystory-section.content-panel-wrap");
      var lastRevealedPanel = null;
      panels.forEach(function (panel) {
        var title = panel.querySelector(".content-panel__title");
        var subtitle = panel.querySelector(".content-panel__subtitle");
        var bodyParas = panel.querySelectorAll(".content-panel__body p");
        if (title) wrapReveal(title);
        if (subtitle) wrapReveal(subtitle);
        bodyParas.forEach(wrapReveal);
      });

      var fullscreen = document.querySelector(".mystory-fullscreen");
      var fullscreenIntro = fullscreen ? fullscreen.querySelector(".mystory-fullscreen__intro") : null;
      var fullscreenSequence = fullscreen ? fullscreen.querySelector(".mystory-fullscreen__sequence") : null;
      var sequenceQuestionPs = fullscreen ? fullscreen.querySelectorAll(".mystory-fullscreen__question[data-step]") : [];
      if (fullscreenIntro) wrapReveal(fullscreenIntro);
      sequenceQuestionPs.forEach(wrapReveal);

      var fullscreenRevealedIntro = false;
      var lastRevealedSequenceP = null;

      function runFullscreenReveal() {
        if (!fullscreen || !gsap) return;
        if (!fullscreen.classList.contains("is-visible")) {
          fullscreenRevealedIntro = false;
          lastRevealedSequenceP = null;
          return;
        }
        if (fullscreenSequence && fullscreenSequence.classList.contains("is-visible")) {
          fullscreenRevealedIntro = false;
        }
        if (fullscreenIntro && fullscreenIntro.style.display !== "none") {
          if (!fullscreenRevealedIntro) {
            fullscreenRevealedIntro = true;
            var introInners = fullscreenIntro.querySelectorAll(".reveal__inner");
            if (introInners.length) {
              gsap.killTweensOf(introInners);
              gsap.set(introInners, { y: "110%", opacity: 0 });
              gsap.to(introInners, {
                y: 0,
                opacity: 1,
                duration: 0.85,
                stagger: 0.06,
                ease: "power3.out",
              });
            }
          }
        } else {
          fullscreenRevealedIntro = false;
        }

        if (fullscreenSequence && fullscreenSequence.classList.contains("is-visible")) {
          var visibleP = fullscreenSequence.querySelector(".mystory-fullscreen__question.is-visible");
          if (visibleP && visibleP !== lastRevealedSequenceP) {
            lastRevealedSequenceP = visibleP;
            var inners = visibleP.querySelectorAll(".reveal__inner");
            if (inners.length) {
              gsap.killTweensOf(inners);
              gsap.set(inners, { y: "110%", opacity: 0 });
              gsap.to(inners, {
                y: 0,
                opacity: 1,
                duration: 0.85,
                stagger: 0.06,
                ease: "power3.out",
              });
            }
          }
        } else {
          lastRevealedSequenceP = null;
        }
      }

      function runMystoryReveal() {
        var visible = document.querySelectorAll(".mystory-section.content-panel-wrap.is-visible");
        var currentPanel = visible.length ? visible[0] : null;
        if (!currentPanel) {
          lastRevealedPanel = null;
        } else if (currentPanel !== lastRevealedPanel) {
          lastRevealedPanel = currentPanel;
          var inners = currentPanel.querySelectorAll(".reveal__inner");
          if (inners.length) {
            gsap.killTweensOf(inners);
            gsap.set(inners, { y: "110%", opacity: 0 });
            gsap.to(inners, {
              y: 0,
              opacity: 1,
              duration: 0.85,
              stagger: 0.06,
              ease: "power3.out",
            });
          }
        }
        runFullscreenReveal();
      }

      runMystoryReveal();
      requestAnimationFrame(function () {
        requestAnimationFrame(runMystoryReveal);
      });
      window.addEventListener(
        "scroll",
        function () {
          requestAnimationFrame(function () {
            requestAnimationFrame(runMystoryReveal);
          });
        },
        { passive: true }
      );
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
    var dropDistance = typeof window !== "undefined" ? window.innerHeight : 800;

    if (spacer) {
      spacer.style.height = (panels.length + 1 + 3) * 100 + "vh";
    }

    var introEl = fullscreen ? fullscreen.querySelector(".mystory-fullscreen__intro") : null;
    var sequenceEl = fullscreen ? fullscreen.querySelector(".mystory-fullscreen__sequence") : null;
    var questionParagraphs = fullscreen ? fullscreen.querySelectorAll(".mystory-fullscreen__question[data-step]") : [];
    var photoImg = fullscreen ? fullscreen.querySelector(".mystory-photo__img") : null;
    var fullscreenStepIndex = -1;

    var fullscreenSteps = [
      { img: "./assets/img/mystory/curious.png" },
      { img: "./assets/img/mystory/positive.png" },
      { img: "./assets/img/mystory/creative.png" },
    ];

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
      gsap.set(pieceBlocks, { y: 0 });
      gsap.from(pieceBlocks, {
        y: -dropDistance,
        duration: 0.52,
        ease: "power3.out",
      });
    }

    function hidePiece(pieceIndex, delay) {
      var pieceBlocks = getBlocksByPiece(pieceIndex);
      gsap.killTweensOf(pieceBlocks);
      gsap.to(pieceBlocks, {
        y: -dropDistance,
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

        if (showFullscreen && introEl && sequenceEl && questionParagraphs.length && photoImg) {
          var fullscreenStep = Math.floor((offset - fullscreenThreshold) / vh);
          if (fullscreenStep === 0) {
            introEl.style.display = "";
            sequenceEl.classList.remove("is-visible");
            fullscreenStepIndex = -1;
          } else {
            introEl.style.display = "none";
            sequenceEl.classList.add("is-visible");
            var stepIdx = Math.min(fullscreenStep - 1, fullscreenSteps.length - 1);
            if (stepIdx >= 0) {
              questionParagraphs.forEach(function (p, i) {
                p.classList.toggle("is-visible", i === stepIdx);
              });
              if (stepIdx !== fullscreenStepIndex) {
                var step = fullscreenSteps[stepIdx];
                fullscreenStepIndex = stepIdx;
                gsap.killTweensOf(photoImg);
                gsap.set(photoImg, { opacity: 0, scale: 1.02 });
                photoImg.src = step.img;
                photoImg.alt = ["Curious", "Positive", "Creative"][stepIdx];
                function animatePhotoIn() {
                  photoImg.onload = null;
                  gsap.to(photoImg, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    ease: "power2.out",
                  });
                }
                if (photoImg.complete) animatePhotoIn();
                else photoImg.onload = animatePhotoIn;
              }
            }
          }
        }
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

    var photoTiltWrap = photoImg && photoImg.parentElement && photoImg.parentElement.classList.contains("mystory-photo__tilt-wrap") ? photoImg.parentElement : null;
    if (photoTiltWrap && typeof gsap !== "undefined") {
      var tiltAmount = 12;
      var rotX = gsap.quickTo(photoTiltWrap, "rotationX", { duration: 0.5, ease: "power2.out" });
      var rotY = gsap.quickTo(photoTiltWrap, "rotationY", { duration: 0.5, ease: "power2.out" });
      document.addEventListener("mousemove", function (e) {
        if (!sequenceEl || !sequenceEl.classList.contains("is-visible")) {
          rotX(0);
          rotY(0);
          return;
        }
        var x = (e.clientX / window.innerWidth - 0.5) * 2;
        var y = (e.clientY / window.innerHeight - 0.5) * 2;
        rotX(-y * tiltAmount);
        rotY(x * tiltAmount);
      });
    }
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
