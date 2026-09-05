const config = {
  title: "Atharv Tomar | Software Devleoper ",
  description: {
    long: "Explore the portfolio of Atharv Tomar — Co-Founder of CallHQ.ai, Broki, and Otoma8. Former Senior Lead Software Engineer at Adobe with 12+ years building AI voice agents, commerce platforms, and scalable products.",
    short:
      "Portfolio of Atharv Tomar — Co-Founder, engineer, and ex-Adobe tech lead building AI and commerce products.",
  },
  keywords: [
    "Atharv Tomar",
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
  author: "Atharv Tomar",
  email: "atharvtomar100@gmail.com",
  site: "http://localhost:3000",

  // for github stars button
  githubUsername: "AtharvTomar",
  githubRepo: "3d-portfolio-next",

  get ogImg() {
    return this.site + "/assets/seo/og-image.png";
  },
  social: {
    twitter: "https://www.linkedin.com/in/atharvtomar",
    linkedin: "https://www.linkedin.com/in/atharva-tomar-203619351/",
    instagram: "https://www.linkedin.com/in/atharvtomar",
    facebook: "https://www.linkedin.com/in/atharva-tomar-203619351/",
    github: "https://github.com/AthaarvaTomar",
  },
};
export { config };
