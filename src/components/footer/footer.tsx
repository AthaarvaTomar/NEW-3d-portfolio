"use client";

import React, { useEffect, useState } from "react";
import SocialMediaButtons from "../social/social-media-icons";
import { config } from "@/data/config";
import { IstClock } from "../common/ist-clock";

function CurrentYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (year === null) return null;

  return <span suppressHydrationWarning>{year}</span>;
}

function Footer() {
  return (
    <footer className="flex w-full shrink-0 flex-col items-center gap-3 border-t border-border px-4 py-6 sm:flex-row md:px-6 sm:justify-between">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        © <CurrentYear /> {config.author}. All rights reserved.
      </p>
      <SocialMediaButtons />
      <div className="flex items-center z-10">
        <IstClock />
      </div>
    </footer>
  );
}

export default Footer;
