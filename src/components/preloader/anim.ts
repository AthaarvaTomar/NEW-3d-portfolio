export const opacity = {
  initial: {
    opacity: 0
  },
  enter: {
    opacity: 0.75,
    transition: { duration: 1, delay: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.4 }
  }
};

export const slideUp = {
  initial: {
    y: 0
  },
  exit: {
    y: "-100%",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const, delay: 0.2 }
  }
};

