const config = {
  title: "Akash Malhotra | Co-Founder & Engineer",
  description: {
    long: "Explore the portfolio of Akash Malhotra — Co-Founder of CallHQ.ai, Broki, and Otoma8. Former Senior Lead Software Engineer at Adobe with 12+ years building AI voice agents, commerce platforms, and scalable products.",
    short:
      "Portfolio of Akash Malhotra — Co-Founder, engineer, and ex-Adobe tech lead building AI and commerce products.",
  },
  keywords: [
    "Akash Malhotra",
    "portfolio",
    "CallHQ",
    "Broki",
    "Otoma8",
    "voice AI",
    "full-stack developer",
    "co-founder",
    "Adobe",
    "React",
    "Next.js",
    "TypeScript",
  ],
  author: "Akash Malhotra",
  email: "contact@broki.in",
  site: "https://broki.in",

  // for github stars button
  githubUsername: "akashrmalhotra",
  githubRepo: "3d-portfolio-next",

  get ogImg() {
    return this.site + "/assets/seo/og-image.png";
  },
  social: {
    twitter: "https://www.linkedin.com/in/akashrmalhotra",
    linkedin: "https://www.linkedin.com/in/akashrmalhotra",
    instagram: "https://www.linkedin.com/in/akashrmalhotra",
    facebook: "https://www.linkedin.com/in/akashrmalhotra",
    github: "https://github.com/akashrmalhotra",
  },
};
export { config };
