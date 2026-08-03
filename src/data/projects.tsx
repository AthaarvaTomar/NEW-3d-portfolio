import SlideShow from "@/components/slide-show";
import { Button } from "@/components/ui/button";
import { TypographyP } from "@/components/ui/typography";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

const BASE_PATH = "/assets/projects-screenshots";
const PLACEHOLDER_IMG = "/assets/logo-dark.svg";

const MaskIcon = ({ src, title }: { src: string; title?: string }) => (
  <span
    role="img"
    aria-label={title}
    className="block bg-current"
    style={{
      width: "1em",
      height: "1em",
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

const ProjectsLinks = ({ live }: { live?: string }) => {
  if (!live || live === "#") return null;
  return (
    <div className="flex flex-col md:flex-row items-center justify-start gap-3 my-3 mb-8">
      <Link
        className="font-mono underline flex gap-2"
        rel="noopener"
        target="_new"
        href={live}
      >
        <Button variant={"default"} size={"sm"}>
          Visit Website
          <ArrowUpRight className="ml-3 w-5 h-5" />
        </Button>
      </Link>
    </div>
  );
};

export type Skill = {
  title: string;
  bg: string;
  fg: string;
  icon: ReactNode;
};

const brand = (title: string, file: string): Skill => ({
  title,
  bg: "black",
  fg: "white",
  icon: <MaskIcon src={`/assets/logos/${file}`} title={title} />,
});

const PROJECT_SKILLS = {
  next: brand("Next.js", "nextdotjs-mono.svg"),
  react: brand("React.js", "react-mono.svg"),
  ts: brand("TypeScript", "typescript-mono.svg"),
  tailwind: brand("Tailwind", "tailwind-css-mono.svg"),
  node: brand("Node.js", "nodedotjs-mono.svg"),
  python: brand("Python", "python-mono.svg"),
  postgres: brand("PostgreSQL", "postgresql-mono.svg"),
  mongo: brand("MongoDB", "mongodb-mono.svg"),
  aiSDK: brand("Vercel AI SDK", "vercel-mono.svg"),
  anthropic: brand("Anthropic Claude", "anthropic-mono.svg"),
  mistral: brand("Mistral AI", "mistral-ai-mono.svg"),
  sockerio: brand("Socket.io", "socketdotio-mono.svg"),
  docker: brand("Docker", "docker-mono.svg"),
  aws: brand("AWS", "cloudflare-mono.svg"),
  express: brand("Express", "express-mono.svg"),
  shadcn: brand("Shadcn UI", "shadcn-ui-mono.svg"),
  reactQuery: brand("TanStack Query", "react-query-mono.svg"),
};

export type Project = {
  id: string;
  category: string;
  title: string;
  src: string;
  screenshots: string[];
  skills: { frontend: Skill[]; backend: Skill[] };
  content: React.ReactNode | any;
  github?: string;
  live: string;
};

const projects: Project[] = [
  {
    id: "chatty",
    category: "Messaging",
    title: "Chatty",
    src: `${BASE_PATH}/chatty/chatty.png`,
    screenshots: ["chatty.png"],
    live: "",
    skills: {
      frontend: [
        PROJECT_SKILLS.react,
        PROJECT_SKILLS.tailwind,
        PROJECT_SKILLS.ts,
      ],
      backend: [
        PROJECT_SKILLS.mongo,
        PROJECT_SKILLS.node,
        PROJECT_SKILLS.express,
        PROJECT_SKILLS.sockerio,
      ],
    },
    get content() {
      return (
        <div>
          <TypographyP className="font-mono">
            Real-time messaging platform built using the MERN stack.
          </TypographyP>
          <ul className="list-disc list-inside space-y-1 font-mono text-sm text-muted-foreground my-4">
            <li>Tech stack: MERN + Socket.io + TailwindCSS + Daisy UI</li>
            <li>🎃 Authentication &amp;&amp; Authorization with JWT</li>
            <li>👾 Real-time messaging with Socket.io</li>
            <li>🚀 Online user status</li>
            <li>👌 Global state management with Zustand</li>
            <li>🐞 Error handling both on the server and on the client</li>
          </ul>
          <ProjectsLinks live={this.live} />
          <SlideShow images={[`${BASE_PATH}/chatty/chatty.png`]} />
        </div>
      );
    },
  },
  {
    id: "codeflex",
    category: "AI & Fitness",
    title: "CodeFlex",
    src: `${BASE_PATH}/codeflex/codeflex.png`,
    screenshots: ["codeflex.png"],
    live: "",
    skills: {
      frontend: [
        PROJECT_SKILLS.ts,
        PROJECT_SKILLS.next,
        PROJECT_SKILLS.react,
        PROJECT_SKILLS.tailwind,
        PROJECT_SKILLS.shadcn,
      ],
      backend: [
        PROJECT_SKILLS.node,
        PROJECT_SKILLS.aiSDK,
      ],
    },
    get content() {
      return (
        <div>
          <TypographyP className="font-mono">
            Advanced AI-powered fitness technology platform designed for personalized diet plans and workout routines.
          </TypographyP>
          <ul className="list-disc list-inside space-y-1 font-mono text-sm text-muted-foreground my-4">
            <li>Next.js: React framework for building the frontend and API routes</li>
            <li>Tailwind CSS &amp; Shadcn UI: For styling and UI components</li>
            <li>Clerk: Authentication and user management</li>
            <li>Vapi: Voice agent platform for conversational AI</li>
            <li>Convex: Real-time database</li>
            <li>Gemini AI: Large Language Model for generating personalized fitness programs</li>
          </ul>
          <ProjectsLinks live={this.live} />
          <SlideShow images={[`${BASE_PATH}/codeflex/codeflex.png`]} />
        </div>
      );
    },
  },
  {
    id: "dentacare",
    category: "SaaS & Healthcare",
    title: "DentaCare AI",
    src: `${BASE_PATH}/dentacare/dentacare.png`,
    screenshots: ["dentacare.png"],
    live: "",
    skills: {
      frontend: [
        PROJECT_SKILLS.ts,
        PROJECT_SKILLS.next,
        PROJECT_SKILLS.react,
        PROJECT_SKILLS.tailwind,
        PROJECT_SKILLS.reactQuery,
        PROJECT_SKILLS.shadcn,
      ],
      backend: [
        PROJECT_SKILLS.postgres,
        PROJECT_SKILLS.node,
      ],
    },
    get content() {
      return (
        <div>
          <TypographyP className="font-mono">
            A modern dental clinic management and appointment booking platform.
          </TypographyP>
          <ul className="list-disc list-inside space-y-1 font-mono text-sm text-muted-foreground my-4">
            <li>Modern Landing Page with gradients &amp; images</li>
            <li>🔐 Authentication via Clerk (Google, GitHub, Email &amp; Password)</li>
            <li>🔑 Email Verification (6-digit code)</li>
            <li>📅 Appointment Booking System</li>
            <li>🦷 3-Step Booking Flow (Dentist → Service &amp; Time → Confirm)</li>
            <li>📩 Email Notifications for Bookings (Resend)</li>
            <li>📊 Admin Dashboard for Managing Appointments</li>
            <li>🗣️ AI Voice Agent powered by Vapi (Pro Plans only)</li>
            <li>💳 Subscription Payments with Clerk (Free + 2 Paid Plans)</li>
            <li>🧾 Automatic Invoices via Email</li>
            <li>💸 Smart Subscription Upgrades (pay only the difference)</li>
            <li>📂 PostgreSQL for Data Persistence</li>
            <li>🎨 Styling with Tailwind CSS + Shadcn</li>
            <li>⚡ Data Fetching with TanStack Query</li>
            <li>🤖 CodeRabbit for PR Optimizations</li>
            <li>🧑&zwj;💻 Git &amp; GitHub Workflow (branches, PRs, merges)</li>
            <li>🚀 Deployment on Sevalla (free-tier friendly)</li>
          </ul>
          <ProjectsLinks live={this.live} />
          <SlideShow images={[`${BASE_PATH}/dentacare/dentacare.png`]} />
        </div>
      );
    },
  },
];

export default projects;
