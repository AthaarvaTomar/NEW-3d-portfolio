"use server";

import { cacheLife } from "next/cache";
import { config } from "@/data/config";

// unauthenticated github api = 60 req/hr per ip; 5min cache -> ~12 req/hr
// throws on failure: errors aren't cached, so bad fetch retries next request
export async function getGithubStars(): Promise<number> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300 });

  try {
    const res = await fetch(
      `https://api.github.com/repos/${config.githubUsername}/${config.githubRepo}`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) {
      console.warn(`GitHub API responded with ${res.status} for ${config.githubUsername}/${config.githubRepo}`);
      return 0;
    }

    const data = await res.json();
    if (typeof data.stargazers_count !== "number") {
      throw new Error("Unexpected GitHub API response shape");
    }
    return data.stargazers_count;
  } catch (error) {
    console.error("Error fetching GitHub stars:", error);
    return 0;
  }
}
