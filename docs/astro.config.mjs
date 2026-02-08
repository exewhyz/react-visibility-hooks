import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";

// Update this after your first Vercel deploy with your actual domain
const site = "https://react-visibility-hooks.vercel.app";

export default defineConfig({
  site,
  integrations: [
    sitemap(),
    starlight({
      title: "react-visibility-hooks",
      description:
        "Tiny, SSR-safe React hooks for page visibility, idle detection, smart polling, network awareness, wake lock, battery status and more.",
      social: {
        github: "https://github.com/exewhyz/react-visibility-hooks",
      },
      head: [
        // Canonical URL
        {
          tag: "link",
          attrs: { rel: "canonical", href: site },
        },
        // OpenGraph
        {
          tag: "meta",
          attrs: { property: "og:type", content: "website" },
        },
        {
          tag: "meta",
          attrs: { property: "og:site_name", content: "react-visibility-hooks" },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: `${site}/og-image.png`,
          },
        },
        {
          tag: "meta",
          attrs: { property: "og:image:width", content: "1200" },
        },
        {
          tag: "meta",
          attrs: { property: "og:image:height", content: "630" },
        },
        // Twitter Card
        {
          tag: "meta",
          attrs: { name: "twitter:card", content: "summary_large_image" },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image",
            content: `${site}/og-image.png`,
          },
        },
        // Extra SEO meta
        {
          tag: "meta",
          attrs: {
            name: "keywords",
            content:
              "react, hooks, visibility, page visibility, idle detection, smart polling, network aware, wake lock, battery, ssr, typescript",
          },
        },
        {
          tag: "meta",
          attrs: { name: "author", content: "exewhyz" },
        },
        // JSON-LD Structured Data
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          content: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            name: "react-visibility-hooks",
            description:
              "Tiny, SSR-safe React hooks for page visibility, idle detection, smart polling, network awareness, wake lock, battery status and more.",
            url: site,
            codeRepository: "https://github.com/exewhyz/react-visibility-hooks",
            programmingLanguage: ["TypeScript", "React"],
            runtimePlatform: "Node.js",
            license: "https://opensource.org/licenses/MIT",
            operatingSystem: "Cross-platform",
            applicationCategory: "DeveloperApplication",
          }),
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [{ label: "Installation", slug: "installation" }],
        },
        {
          label: "Hooks",
          items: [
            { label: "useDocVisible", slug: "hooks/use-doc-visible" },
            {
              label: "useIdleVisibility",
              slug: "hooks/use-idle-visibility",
            },
            {
              label: "useAutoPauseVideo",
              slug: "hooks/use-auto-pause-video",
            },
            { label: "useSmartPolling", slug: "hooks/use-smart-polling" },
            {
              label: "usePageFocusEffect",
              slug: "hooks/use-page-focus-effect",
            },
            {
              label: "useNetworkAwarePolling",
              slug: "hooks/use-network-aware-polling",
            },
            {
              label: "useInactivityTimeout",
              slug: "hooks/use-inactivity-timeout",
            },
            { label: "useWakeLock", slug: "hooks/use-wake-lock" },
            { label: "useBatteryAware", slug: "hooks/use-battery-aware" },
          ],
        },
        {
          label: "Advanced",
          items: [
            {
              label: "Combining Hooks",
              slug: "advanced/combining-hooks",
            },
            { label: "SSR Support", slug: "advanced/ssr" },
            { label: "Benchmarks", slug: "advanced/benchmarks" },
          ],
        },
      ],
    }),
  ],
});
