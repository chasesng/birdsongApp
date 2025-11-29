import { onMounted, onUnmounted, ref } from "vue";


export const useScrollToBottom = (callback: () => void, options: { threshold?: number } = {}) => {
  const triggered = ref(false);
  const threshold = options.threshold ?? 50; // px from bottom to trigger
  let ticking = false;

  const check = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    if (!triggered.value && scrollPosition >= pageHeight - threshold) {
      triggered.value = true;
      callback();
    } else if (triggered.value && scrollPosition < pageHeight - threshold - 10) {
      // reset when user scrolls up
      triggered.value = false;
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        check();
        ticking = false;
      });
    }
  };

  onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
  onUnmounted(() => window.removeEventListener("scroll", onScroll));

  return { triggered };
};
