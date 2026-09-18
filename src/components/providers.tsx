import { Suspense } from "react";
import SocketContextProvider from "@/contexts/socketio";
import Preloader from "./preloader";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/toaster";

import { TooltipProvider } from "./ui/tooltip";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    disableTransitionOnChange
  >
    <Suspense fallback={null}>
      <Preloader>
        <SocketContextProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster />
        </SocketContextProvider>
      </Preloader>
    </Suspense>
  </ThemeProvider>;
};
