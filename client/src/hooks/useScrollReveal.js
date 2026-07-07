import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to the returned ref AND
 * to every `.reveal` descendant inside it, so staggered grid
 * cards are also animated in when they enter the viewport.
 */
export const useScrollReveal = (threshold = 0.12) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    // Observe the container itself
    observer.observe(el);

    // Also observe every .reveal child inside the container
    const children = el.querySelectorAll(".reveal");
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
};

/**
 * A global scroll reveal that can be used to observe ALL .reveal elements
 * on the page without needing a ref. Call this once at the page level.
 */
export const useGlobalScrollReveal = (threshold = 0.12) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    const observe = () => {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
        observer.observe(el);
      });
    };

    // Initial observation
    observe();

    // Re-observe on DOM mutations (handles dynamically added elements)
    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [threshold]);
};
