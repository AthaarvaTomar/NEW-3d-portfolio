"use client";
import styles from "./style.module.scss";
import { useEffect, useState, useMemo, forwardRef } from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { opacity, slideUp } from "./anim";
import { usePreloader } from ".";

const Index = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function Index(props, ref) {
    const { isLoading, loadingPercent } = usePreloader();
    const [dimension, setDimension] = useState({ width: 0, height: 0 });

    useEffect(() => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    const initialPath = useMemo(
      () =>
        `M0 0 L${dimension.width} 0 L${dimension.width} ${
          dimension.height
        } Q${dimension.width / 2} ${dimension.height + 300} 0 ${
          dimension.height
        }  L0 0`,
      [dimension.width, dimension.height]
    );

    const targetPath = useMemo(
      () =>
        `M0 0 L${dimension.width} 0 L${dimension.width} ${
          dimension.height
        } Q${dimension.width / 2} ${dimension.height} 0 ${
          dimension.height
        }  L0 0`,
      [dimension.width, dimension.height]
    );

    const curve = useMemo(
      () => ({
        initial: {
          d: initialPath,
          transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const },
        },
        exit: {
          d: targetPath,
          transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const, delay: 0.3 },
        },
      }),
      [initialPath, targetPath]
    );

    return (
      <motion.div
        ref={ref}
        {...props}
        variants={slideUp}
        initial="initial"
        exit="exit"
        className={`${styles.introduction} ${!isLoading ? "pointer-events-none" : ""}`}
      >
        {dimension.width > 0 && (
          <>
            <motion.p variants={opacity} initial="initial" animate="enter" exit="exit">
              {(loadingPercent - (loadingPercent % 5)).toFixed(0)} %
            </motion.p>
            <svg>
              <motion.path
                variants={curve}
                initial="initial"
                exit="exit"
              ></motion.path>
            </svg>
          </>
        )}
      </motion.div>
    );
  }
);

Index.displayName = "Loader";

export default Index;

