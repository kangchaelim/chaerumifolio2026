(function () {
  /* 새로고침 시 스크롤 복원으로 work-tabs가 화면 밖으로 가는 것 방지 */
  if (typeof history !== "undefined" && history.scrollRestoration) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  function initWorkScroll() {
    var hero = document.getElementById("workHero");
    if (!hero) return;

    if (typeof gsap === "undefined") return;

    var lenis = window.__lenis;
    if (!lenis && typeof Lenis !== "undefined") {
      lenis = new Lenis({
        duration: 1.15,
        easing: function (t) {
          return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        },
        smoothWheel: true,
      });
      window.__lenis = lenis;
    }
    if (!lenis) return;

    /* WORK 페이지 로드 시 스크롤을 맨 위로 고정 → 탭이 항상 보이도록 (랜덤 복원 대비 여러 번 적용) */
    function scrollToTop() {
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
    }
    scrollToTop();
    requestAnimationFrame(scrollToTop);
    requestAnimationFrame(function () { requestAnimationFrame(scrollToTop); });
    window.addEventListener("load", function onLoad() {
      window.removeEventListener("load", onLoad);
      scrollToTop();
      setTimeout(scrollToTop, 50);
      setTimeout(scrollToTop, 200);
      setTimeout(scrollToTop, 500);
    });

    gsap.registerPlugin(ScrollTrigger);

  var blocksWrap = document.getElementById("workBlocks");
  var blockRed = document.getElementById("blockRed");
  var blockYellow = document.getElementById("blockYellow");
  var blockBlue = document.getElementById("blockBlue");
  var tabBtns = document.querySelectorAll(".work-tab");
  var tabLabels = document.querySelectorAll(".work-tab__label");

  var blockSize = 0;
  var gap = 6;

  function getBlockSize() {
    if (blockRed) {
      var w = blockRed.getBoundingClientRect().width;
      if (w > 0) return w;
    }
    return 24;
  }

  blockSize = getBlockSize();
  var clusterOffset = blockSize + gap;
  var centerOffset = clusterOffset / 3;

  function setPanelAndTab(progress) {
    var segment = progress < 0.55 ? "web" : progress < 0.75 ? "campaign" : "experiments";
    tabBtns.forEach(function (btn) {
      var active = btn.getAttribute("data-tab") === segment;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    blockRed.classList.toggle("is-label-visible", progress >= 0.2);
    blockYellow.classList.toggle("is-label-visible", progress >= 0.24);
    blockBlue.classList.toggle("is-label-visible", progress >= 0.28);
    blockRed.classList.toggle("is-active", segment === "web");
    blockYellow.classList.toggle("is-active", segment === "campaign");
    blockBlue.classList.toggle("is-active", segment === "experiments");
  }

    lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop: function (value) {
      if (arguments.length) lenis.scrollTo(value);
      return lenis.scroll;
    },
  });

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=160vh",
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
      onUpdate: function (self) {
        setPanelAndTab(self.progress);
      },
    },
  });

  var phase1Duration = 0.35;

  var slotWeb = document.querySelector('.work-tab[data-tab="web"] .work-tab__slot');
  var slotCampaign = document.querySelector('.work-tab[data-tab="campaign"] .work-tab__slot');
  var slotExperiments = document.querySelector('.work-tab[data-tab="experiments"] .work-tab__slot');

  function getSlotCenter(slotEl) {
    if (!slotEl) return null;
    var r = slotEl.getBoundingClientRect();
    var w = r.width;
    var h = r.height;
    if (w < 1) return null;
    var y;
    if (h >= 1) y = r.top + h / 2;
    else {
      var tab = slotEl.closest && slotEl.closest(".work-tab");
      if (tab) { var tr = tab.getBoundingClientRect(); y = tr.top + tr.height / 2; }
      else y = r.top;
    }
    return { x: r.left + w / 2, y: y };
  }

  /* 블록 Y: 실제 슬롯 중심을 사용해 버튼(슬롯) 위치와 시각(블록+레이블) 위치가 일치하도록 함 */
  function getTabsCenterY() {
    var slot = slotWeb || slotCampaign || slotExperiments;
    var center = slot ? getSlotCenter(slot) : null;
    return center ? center.y : window.innerHeight * 0.1 + 20;
  }

  function buildBlockTweens() {
    gsap.set(blockRed, {
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      x: -centerOffset,
      y: -centerOffset,
    });
    gsap.set(blockYellow, {
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      x: clusterOffset - centerOffset,
      y: -centerOffset,
    });
    gsap.set(blockBlue, {
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      x: -centerOffset,
      y: clusterOffset - centerOffset,
    });

    if (!getSlotCenter(slotWeb) || !getSlotCenter(slotCampaign) || !getSlotCenter(slotExperiments)) return;

    function slotX(slot) {
      var p = getSlotCenter(slot);
      return p ? p.x : 0;
    }

    /* CAMPAIGN 레이블 너비의 절반만큼 왼쪽으로 보정 → 블록+레이블이 함께 가운데 보이게 */
    var measureEl = document.createElement("span");
    measureEl.style.cssText = "position:absolute;left:-9999px;top:0;font-size:4rem;font-weight:600;letter-spacing:0.02em;white-space:nowrap;visibility:hidden";
    measureEl.textContent = "CAMPAIGN";
    document.body.appendChild(measureEl);
    var campaignLabelHalf = (measureEl.getBoundingClientRect().width * 0.28) / 2;
    document.body.removeChild(measureEl);

    function campaignBlockX() {
      return slotX(slotCampaign) - campaignLabelHalf;
    }

    tl.fromTo(
      blockRed,
      { left: "50%", top: "50%", xPercent: -50, yPercent: -50, x: -centerOffset, y: -centerOffset, scale: 1 },
      {
        left: function () { return slotX(slotWeb); },
        top: function () { return getTabsCenterY(); },
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 0.28,
        duration: phase1Duration,
        ease: "power2.inOut",
      },
      0
    );
    tl.fromTo(
      blockYellow,
      {
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        x: clusterOffset - centerOffset,
        y: -centerOffset,
        scale: 1,
      },
      {
        left: function () { return campaignBlockX(); },
        top: function () { return getTabsCenterY(); },
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 0.28,
        duration: phase1Duration,
        ease: "power2.inOut",
      },
      0
    );
    tl.fromTo(
      blockBlue,
      {
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        x: -centerOffset,
        y: clusterOffset - centerOffset,
        scale: 1,
      },
      {
        left: function () { return slotX(slotExperiments); },
        top: function () { return getTabsCenterY(); },
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 0.28,
        duration: phase1Duration,
        ease: "power2.inOut",
      },
      0
    );

  /* 레이블은 .work-block::after로 블록과 함께 이동, setPanelAndTab(progress)에서 is-label-visible 토글 */
  }

  requestAnimationFrame(function () {
    ScrollTrigger.refresh();
    requestAnimationFrame(function () {
      buildBlockTweens();
      ScrollTrigger.refresh();
    });
  });

  function scrollToProgress(progress) {
    var trigger = tl.scrollTrigger;
    if (!trigger) return;
    var start = trigger.start;
    var end = trigger.end;
    var targetScroll = start + Math.max(0, Math.min(1, progress)) * (end - start);
    lenis.scrollTo(targetScroll, { lerp: 0.1, duration: 1.2 });
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tab = btn.getAttribute("data-tab");
      var seg = tab === "web" ? 0.35 : tab === "campaign" ? 0.55 : 0.75;
      scrollToProgress(seg);
    });
  });

  /* 작업물 섹션: 뷰포트에 들어오면 .is-inview 추가 → 페이드·슬라이드 업 */
  var workSections = document.querySelectorAll(".work-section");
  if (workSections.length && "IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
          }
        });
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0 }
    );
    workSections.forEach(function (el) {
      sectionObserver.observe(el);
    });
  } else {
    workSections.forEach(function (el) {
      el.classList.add("is-inview");
    });
  }

  setPanelAndTab(0);
  }

  if (!document.getElementById("workHero")) return;

  function runOnce() {
    window.removeEventListener("load", runOnce);
    initWorkScroll();
  }
  if (document.readyState === "complete") {
    initWorkScroll();
  } else {
    window.addEventListener("load", runOnce);
  }
})();
