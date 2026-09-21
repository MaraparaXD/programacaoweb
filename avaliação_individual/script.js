/* =====================================================================
   As Duas Chamas — homenagem a Dark Souls & Elden Ring
   Interações (JavaScript)
   ===================================================================== */
"use strict";

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------------
   1) FAÍSCAS AMBIENTES — partículas subindo, como brasas de uma fogueira
   --------------------------------------------------------------------- */
(function embers(){
  const canvas = document.getElementById("embers");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles = [];

  function resize(){
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function spawn(){
    return {
      x: Math.random() * w,
      y: h + Math.random() * 40,
      r: Math.random() * 1.8 + 0.4,
      vy: Math.random() * 0.6 + 0.25,
      vx: (Math.random() - 0.5) * 0.3,
      life: Math.random() * 0.5 + 0.5,
      hue: Math.random() > 0.5 ? "212,140,60" : "201,162,75"
    };
  }
  function init(){
    resize();
    const count = Math.min(70, Math.floor(w / 22));
    particles = Array.from({length: count}, () => {
      const p = spawn();
      p.y = Math.random() * h; // espalha no primeiro quadro
      return p;
    });
  }
  function frame(){
    ctx.clearRect(0, 0, w, h);
    for(const p of particles){
      p.y -= p.vy;
      p.x += p.vx + Math.sin(p.y * 0.01) * 0.15;
      if(p.y < -10){ Object.assign(p, spawn()); }
      const flick = 0.6 + Math.random() * 0.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue}, ${p.life * flick * 0.8})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(${p.hue}, .6)`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(frame);
  }
  init();
  window.addEventListener("resize", resize);
  if(!prefersReduced){
    requestAnimationFrame(frame);
  }else{
    // desenha um quadro estático, sem movimento
    for(const p of particles){
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue}, .5)`;
      ctx.fill();
    }
  }
})();

/* ---------------------------------------------------------------------
   2) PORTÕES DE NÉVOA — clicar/teclar atravessa a névoa e revela o chefão
   --------------------------------------------------------------------- */
document.querySelectorAll(".gate").forEach((gate) => {
  const open = () => gate.classList.add("is-open");
  gate.addEventListener("click", open);
  gate.addEventListener("keydown", (e) => {
    if(e.key === "Enter" || e.key === " "){ e.preventDefault(); open(); }
  });
});

/* ---------------------------------------------------------------------
   3) DESCANSE À FOGUEIRA — o momento autoral da página.
   Primeira vez: a luz nasce nas brasas e se espalha, o vídeo da fogueira
   começa a rodar, faíscas sobem e o letreiro "Fogueira acesa" aparece.
   Depois: cada "Descansar" dá só um lampejo. Tudo pausa fora da tela.
   Com movimento reduzido (ou sem GSAP): sem vídeo em loop nem expansão —
   apenas um fade de brilho sobre o quadro estático (poster).
   --------------------------------------------------------------------- */
(function bonfire(){
  const root = document.getElementById("bonfire");
  const restBtn = document.getElementById("restBtn");
  if(!root || !restBtn) return;

  const video      = root.querySelector(".bonfire__video");
  const glow       = root.querySelector(".bonfire__glow");
  const banner     = root.querySelector(".bonfire__banner");
  const bannerText = banner.querySelector("span");
  const sparkBox   = root.querySelector(".bonfire__sparks");
  const status     = document.getElementById("restStatus");
  const navCount   = document.getElementById("bonfireCount");
  const footCount  = document.getElementById("bonfireCountFoot");

  // estado apagado (precisa bater com os initial-value de --r, --b, --s no CSS)
  const R0 = 15, B0 = 0.32, S0 = 0.55;

  const canPlay    = !prefersReduced;
  const canAnimate = canPlay && typeof gsap !== "undefined";
  if(!canAnimate) root.classList.add("bonfire--css");

  let litTimes = 0, lit = false, igniting = false, visible = false;
  let ignite, flare, sparkTls = [];

  /* faíscas: um punhado contínuo enquanto acesa + um jato a cada ignição/lampejo */
  const rand = (a, b) => gsap.utils.random(a, b);
  let burstSparks = [];
  if(canAnimate){
    const make = (cls) => {
      const s = document.createElement("span");
      s.className = cls;
      sparkBox.appendChild(s);
      return s;
    };
    burstSparks = Array.from({ length: 20 }, () => make("spark spark--burst"));

    sparkTls = Array.from({ length: 16 }, (_, i) => {
      const s = make("spark");
      return gsap.timeline({ repeat: -1, repeatRefresh: true, paused: true, delay: i * 0.17 })
        .set(s, { x: 0, y: 0, opacity: 0, scale: 1 })
        .to(s, { x: () => rand(-70, 70), y: () => rand(-330, -170), duration: () => rand(2.2, 3.4), ease: "power1.out" }, 0)
        .to(s, { opacity: 1, duration: 0.2, ease: "none" }, 0)
        .to(s, { opacity: 0, scale: 0.2, duration: 0.9, ease: "power1.in" }, 1.3);
    });
  }
  const makeBurst = () => gsap.fromTo(burstSparks,
    { x: 0, y: 0, opacity: 1, scale: 1 },
    { x: () => rand(-150, 150), y: () => rand(-330, -110), opacity: 0, scale: 0.15,
      duration: () => rand(1.2, 2.2), ease: "power2.out",
      stagger: { each: 0.035, from: "random" }, immediateRender: false });

  /* vídeo e faíscas só rodam acesos, visíveis e com a aba ativa */
  function sync(){
    const run = lit && visible && !document.hidden;
    if(run){
      if(canPlay) video.play().catch(() => {});
      sparkTls.forEach((t) => t.play());
    }else{
      video.pause();
      sparkTls.forEach((t) => t.pause());
    }
    root.classList.toggle("is-paused", !run);
  }

  if("IntersectionObserver" in window){
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if(visible && canPlay) video.preload = "auto";   // baixa o vídeo ao se aproximar
      sync();
    }, { rootMargin: "300px 0px" }).observe(root);
  }else{
    visible = true;
  }
  document.addEventListener("visibilitychange", sync);

  if(canAnimate){
    /* ignição: a luz nasce nas brasas e se espalha */
    ignite = gsap.timeline({
      paused: true,
      defaults: { ease: "power2.out" },
      onComplete(){ igniting = false; }
    });
    ignite
      .addLabel("catch", 0)
      .fromTo(video, { "--b": B0, "--s": S0 },
                     { "--b": 1, "--s": 1, duration: 2.4, ease: "power2.inOut" }, "catch")
      .fromTo(video, { "--r": R0 },
                     { "--r": 150, duration: 2.8, ease: "expo.out" }, "catch+=0.15")
      .fromTo(glow,  { opacity: 0, scale: 0.35 },
                     { opacity: 1, scale: 1, duration: 2.6, ease: "power3.out" }, "catch+=0.1")
      .add(makeBurst(), "catch+=0.5")
      .add(() => { lit = true; sync(); }, "catch+=1")
      .addLabel("banner", "catch+=0.9")
      .fromTo(banner,     { autoAlpha: 0, scaleY: 0.15 },
                          { autoAlpha: 1, scaleY: 1, duration: 0.6, ease: "expo.out" }, "banner")
      .fromTo(bannerText, { autoAlpha: 0, scale: 1.14, filter: "blur(10px)" },
                          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "expo.out" }, "banner+=0.1")
      .to(banner, { autoAlpha: 0, duration: 0.8, ease: "power1.in" }, "banner+=2.7");

    /* lampejo: descansar de novo reaviva a chama por um instante */
    flare = gsap.timeline({ paused: true })
      .to(video, { "--b": 1.35, "--s": 1.1, duration: 0.28, ease: "power2.out", yoyo: true, repeat: 1 }, 0)
      .to(glow,  { scale: 1.14, duration: 0.28, ease: "power2.out", yoyo: true, repeat: 1 }, 0)
      .add(makeBurst(), 0.05);
  }

  restBtn.addEventListener("click", () => {
    litTimes++;
    if(navCount)  navCount.textContent  = litTimes;
    if(footCount) footCount.textContent = litTimes;

    status.textContent = "Fogueira acesa";
    status.classList.add("lit");
    restBtn.textContent = "Descansar novamente";

    if(!lit && !igniting){
      root.classList.add("is-lit");
      if(canAnimate){
        igniting = true;
        video.currentTime = 0;
        if(canPlay) video.play().catch(() => {});
        ignite.restart();
      }else{
        lit = true;
        root.classList.add("is-announcing");          // letreiro só com fade de opacidade
        setTimeout(() => root.classList.remove("is-announcing"), 2600);
        sync();
      }
    }else if(canAnimate && !igniting){
      flare.restart();
    }
  });
})();

/* ---------------------------------------------------------------------
   4) YOU DIED — sobreposição dramática
   --------------------------------------------------------------------- */
(function youDied(){
  const overlay = document.getElementById("died");
  const trigger = document.getElementById("dieBtn");
  if(!overlay || !trigger) return;

  let timer;
  function show(){
    overlay.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(hide, 3200);
  }
  function hide(){ overlay.classList.remove("show"); }

  trigger.addEventListener("click", show);
  overlay.addEventListener("click", hide);
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") hide();
  });
})();

/* ---------------------------------------------------------------------
   5) NAVEGAÇÃO — o CTA e os links rolam suavemente até a seção
   (fallback caso scroll-behavior não esteja disponível)
   --------------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"], [data-scroll]').forEach((el) => {
  el.addEventListener("click", (e) => {
    const id = el.getAttribute("href") || `#${el.dataset.scroll}`;
    if(!id || id === "#") return;
    const target = document.querySelector(id);
    if(!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  });
});

/* ---------------------------------------------------------------------
   6) ANIMAÇÕES DE SCROLL (GSAP + ScrollTrigger)
   Melhoram a experiência, mas o conteúdo já é visível sem elas.
   --------------------------------------------------------------------- */
(function scrollFx(){
  if(prefersReduced || typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  // entrada do herói, orquestrada no carregamento
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".flame", { autoAlpha: 0, scale: 0.4, duration: 1.2 })
    .from(".hero__kicker", { autoAlpha: 0, y: 14, duration: 0.8 }, "-=0.6")
    .from(".hero h1", { autoAlpha: 0, y: 26, duration: 1 }, "-=0.5")
    .from(".hero__sub", { autoAlpha: 0, y: 18, duration: 0.8 }, "-=0.6")
    .from(".hero__cta", { autoAlpha: 0, y: 14, duration: 0.7 }, "-=0.4");

  // cabeçalhos de seção surgem da névoa
  gsap.utils.toArray(".section__head").forEach((head) => {
    gsap.from(head, {
      autoAlpha: 0, y: 30, duration: 0.9, ease: "power2.out",
      scrollTrigger: { trigger: head, start: "top 82%" }
    });
  });

  // colunas de lore
  gsap.utils.toArray(".flame-col").forEach((col, i) => {
    gsap.from(col, {
      autoAlpha: 0, y: 40, duration: 1, ease: "power2.out",
      scrollTrigger: { trigger: col, start: "top 80%" },
      delay: i * 0.08
    });
  });

  // portões surgem em lote, como se a névoa se dissipasse fileira a fileira
  ScrollTrigger.batch(".gate", {
    start: "top 88%",
    onEnter: (batch) => gsap.fromTo(batch,
      { autoAlpha: 0, y: 46, scale: 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.8, ease: "power2.out", overwrite: true }
    )
  });

  // subtítulos de grupo (Dark Souls / Elden Ring)
  gsap.utils.toArray(".group-title").forEach((title) => {
    gsap.from(title, {
      autoAlpha: 0, x: -24, duration: 0.8, ease: "power2.out",
      scrollTrigger: { trigger: title, start: "top 88%" }
    });
  });

  // retratos de NPCs, também em lote
  ScrollTrigger.batch(".npc", {
    start: "top 90%",
    onEnter: (batch) => gsap.fromTo(batch,
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power2.out", overwrite: true }
    )
  });

  // cards dos protagonistas
  gsap.utils.toArray(".hero-card").forEach((card, i) => {
    gsap.from(card, {
      autoAlpha: 0, y: 50, duration: 1, ease: "power2.out", delay: i * 0.12,
      scrollTrigger: { trigger: card, start: "top 85%" }
    });
  });

  // a fogueira surge da escuridão
  gsap.from(".bonfire", {
    autoAlpha: 0, y: 40, duration: 1, ease: "power2.out",
    scrollTrigger: { trigger: ".bonfire", start: "top 82%" }
  });

  // fontes e imagens mudam a altura da página depois do carregamento:
  // recalcula as posições dos gatilhos para não disparar cedo/tarde demais
  window.addEventListener("load", () => ScrollTrigger.refresh());
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
