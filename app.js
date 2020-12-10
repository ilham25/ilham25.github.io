gsap.from(".hero-content", {
  y: -100,
  opacity: 0,
  duration: 1,
  ease: "Power0.easeNone",
});

gsap
  .timeline({
    scrollTrigger: {
      trigger: ".skills",
      start: "top center",
    },
  })
  .from(".card-container", {
    y: -100,
    opacity: 0,
    duration: 0.5,
    ease: "Power0.easeNone",
  });

gsap
  .timeline({
    scrollTrigger: {
      trigger: ".works",
      start: "top center",
    },
  })
  .from(".works-content", {
    y: -100,
    opacity: 0,
    duration: 0.5,
    ease: "Power0.easeNone",
  })
  .from(".works-image", {
    y: -100,
    opacity: 0,
    duration: 0.5,
    ease: "Power0.easeNone",
  });

gsap
  .timeline({
    scrollTrigger: {
      trigger: ".hire",
      start: "top bottom",
    },
  })
  .from(".hire", {
    opacity: 0,
    duration: 1,
    ease: "Power0.easeNone",
  });
