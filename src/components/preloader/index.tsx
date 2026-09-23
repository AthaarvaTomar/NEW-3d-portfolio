"use client";
import {
  useState,
  useEffect,
  createContext,
  ReactNode,
  useContext,
  useRef,
  useCallback,
} from "react";
import { AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

import Loader from "./loader";
import gsap from "gsap";
import { usePerfProfile } from "@/hooks/use-perf-profile";

type PreloaderContextType = {
  isLoading: boolean;
  loadingPercent: number;
  bypassLoading: () => void;
};
const INITIAL: PreloaderContextType = {
  isLoading: true,
  loadingPercent: 0,
  bypassLoading: () => {},
};
export const preloaderContext = createContext<PreloaderContextType>(INITIAL);

type PreloaderProps = {
  children: ReactNode;
  disabled?: boolean;
};

export const usePreloader = () => {
  const context = useContext(preloaderContext);
  if (!context) {
    throw new Error("usePreloader must be used within a PreloaderProvider");
  }
  return context;
};
const LOADING_TIME = 2.5;
function Preloader({ children, disabled = false }: PreloaderProps) {
  const pathname = usePathname();
  // Skip the loading splash for the résumé route (and anywhere it's disabled).
  const skip = disabled || pathname?.startsWith("/resume");

  const [isLoading, setIsLoading] = useState(!skip);
  const [loadingPercent, setLoadingPercent] = useState(skip ? 100 : 0);
  const loadingTween = useRef<gsap.core.Tween>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout>(null);

  // The splash exists only to mask the Spline 3D scene loading. On low-end /
  // reduced-motion devices that scene is never loaded, so its onLoad (which
  // normally dismisses the splash) never fires — bypass immediately instead of
  // leaving the page stuck behind the loader.
  const { disable3D, ready: perfReady } = usePerfProfile();

  const bypassLoading = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }
    loadingTween.current?.progress(0.99).kill();
    setLoadingPercent(100);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (perfReady && disable3D) bypassLoading();
  }, [perfReady, disable3D, bypassLoading]);

  const loadingPercentRef = useRef<{ value: number }>({ value: 0 });
  useEffect(() => {
    if (skip) return;

    // Fail-safe timeout to guarantee preloader is dismissed within 3.5s
    fallbackTimerRef.current = setTimeout(() => {
      bypassLoading();
    }, 3500);

    loadingTween.current = gsap.to(loadingPercentRef.current, {
      value: 100,
      duration: LOADING_TIME,
      ease: "power2.out",
      onUpdate: () => {
        setLoadingPercent(loadingPercentRef.current.value);
      },
      onComplete: () => {
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
        setIsLoading(false);
      },
    });

    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      loadingTween.current?.kill();
    };
  }, [skip, bypassLoading]);

  return (
    <preloaderContext.Provider
      value={{ isLoading, bypassLoading, loadingPercent }}
    >
      <AnimatePresence>{isLoading && <Loader key="global-preloader" />}</AnimatePresence>
      {children}
    </preloaderContext.Provider>
  );
}

export default Preloader;

