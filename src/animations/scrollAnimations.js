import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const setupScrollAnimations = (overlay, camera, head, brain) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  // INITIAL STATE
  tl.set(overlay, { opacity: 0 });
  tl.set(brain, { visible: false });
  tl.set(head, { visible: true });
  tl.set('.s1', { opacity: 1 });

  // 1. ZOOM INTO EYE
  tl.to(camera.position, {
    z: 1.6,
    y: 0.6,
    x: -0.7,
    duration: 4,
    ease: "power2.inOut"
  }, 0);

  // 2. THE TRANSITION GULP (Full Cyan Glow)
  tl.to(overlay, { 
    opacity: 1, 
    duration: 1,
    backgroundColor: '#00f2ff',
    ease: "power1.in"
  }, 3.5);

  // Toggle Visibility mid-glow (at exactly 4.0)
  tl.set(head, { visible: false }, 4);
  tl.set(brain, { visible: true, position: [0, 0, 0] }, 4);
  tl.to(camera.position, { x: 0, y: 0, z: 5, duration: 0 }, 4);

  // Fade out overlay to reveal Brain
  tl.to(overlay, { 
    opacity: 0, 
    duration: 1,
    ease: "power1.out"
  }, 4.5);

  // 4. BRAIN SCENE VISUALS (Inside the Mind)
  tl.to('.s3', { opacity: 1, y: -20, duration: 1 }, 5);
  tl.to('.s3', { opacity: 0, duration: 1 }, 6);
  
  tl.to('.s4', { opacity: 1, y: -20, duration: 1 }, 7);
  tl.to('.s4', { opacity: 0, duration: 1 }, 8);

  tl.to('.s5', { opacity: 1, duration: 1 }, 9);

  return tl;
};
