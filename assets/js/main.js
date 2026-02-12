document.addEventListener("DOMContentLoaded", function () {
  // 헤드라인: 글자 단위로 분할 후 올라오며 등장
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

  // MY STORY(about): 스크롤 시 테트리스 블록 등장 + 우측 콘텐츠 제자리 크로스페이드
  (function initMystoryScroll() {
    var layout = document.getElementById("mystoryLayout");
    var stackBoard = document.getElementById("stackBoard");
    var panels = document.querySelectorAll(".mystory-section.content-panel-wrap");
    if (!layout || !stackBoard || !panels.length || typeof gsap === "undefined") return;

    var blocks = stackBoard.querySelectorAll(".stack-block");
    var currentStep = -1;
    var sectionHeight = typeof window !== "undefined" ? window.innerHeight : 800;

    function getBlocksByPiece(pieceIndex) {
      return Array.prototype.filter.call(blocks, function (b) {
        return Number(b.getAttribute("data-piece")) === pieceIndex;
      });
    }

    function revealPiece(pieceIndex) {
      var pieceBlocks = getBlocksByPiece(pieceIndex);
      pieceBlocks.forEach(function (b) {
        b.classList.add("is-visible");
      });
      // 위에서 떨어지며 쌓이는 느낌 (테트리스처럼)
      gsap.from(pieceBlocks, {
        y: -180,
        autoAlpha: 0,
        stagger: 0.04,
        duration: 0.5,
        ease: "power2.out",
      });
    }

    // 섹션 순서 → 블록 떨어지는 순서: 0=O(바닥), 1=L(2번째), 2=Z(3번째), 3=I(마지막)
    var sectionToPiece = [0, 3, 1, 2];

    function setStep(step) {
      if (step === currentStep || step < 0) return;
      currentStep = step;
      stackBoard.setAttribute("data-step", String(step));
      revealPiece(sectionToPiece[step]);
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
      // 구간마다 한 번에 한 패널만 표시 (겹침 없음, 스크롤 한두 번에 내용 전환)
      var sectionIndex = Math.floor(offset / vh);
      if (sectionIndex < 0) sectionIndex = 0;
      if (sectionIndex >= panels.length) sectionIndex = panels.length - 1;

      for (var i = 0; i < panels.length; i++) {
        var visible = i === sectionIndex;
        panels[i].style.opacity = visible ? 1 : 0;
        panels[i].classList.toggle("is-visible", visible);
      }

      // 블록 step: 섹션과 1:1 (0~3)
      if (sectionIndex > currentStep) setStep(sectionIndex);
    }

    setStep(0);
    updateMystory();

    window.addEventListener("scroll", function () {
      requestAnimationFrame(updateMystory);
    }, { passive: true });
    window.addEventListener("resize", function () {
      requestAnimationFrame(updateMystory);
    });
  })();

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

  // 앞/뒤 면 3D 플립 (회전 축 명시)
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
      back.style.fontFamily = backFonts[Math.floor(Math.random() * backFonts.length)];
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
          gsap.set(back, { rotationX: -90, z: -1, transformOrigin: "center top" });
          tile.classList.remove("is-hover");
        },
      });
      // 뒷면 윗줄(선)이 늦게 사라지지 않도록, 애니 끝나기 전에 숨김
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
