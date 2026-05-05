import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getCaseStudyBySlug,
  getCaseStudySlugs,
  getPublishedCaseStudies,
} from "@/lib/content/case-studies";
import { mdxOptions } from "@/lib/mdx/options";
import { mdxComponents } from "@/components/mdx/components";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

// ---------------------------------------------------------------------------
// Static generation
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

// ---------------------------------------------------------------------------
// Per-slug metadata (canonical, OG, Twitter, robots)
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) return {};

  const { frontmatter } = cs;
  const title = `${frontmatter.title} | Avinro`;
  const description = frontmatter.outcome;
  const url = `https://avinro.com/work/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/work/${slug}`,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Avinro",
      locale: "en_US",
      type: "article",
      images: [
        {
          url: `/work/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/work/${slug}/opengraph-image`],
    },
    // Draft pages are not indexed — they are still built for preview purposes.
    ...(frontmatter.draft ? { robots: { index: false, follow: false } } : {}),
  };
}

// ---------------------------------------------------------------------------
// Reading time chip
// ---------------------------------------------------------------------------

function ReadingTimeChip({ text }: { text: string }) {
  return <span className="text-muted-foreground font-mono text-xs tabular-nums">{text}</span>;
}

// ---------------------------------------------------------------------------
// Metadata strip (cover, client, role, year, read time)
// ---------------------------------------------------------------------------

interface CoverMetaProps {
  title: string;
  client: string;
  role: string;
  year: number;
  coverage: string[];
  coverImage: string;
  readingTimeText: string;
}

function CoverMeta({
  title,
  client,
  role,
  year,
  coverage,
  coverImage,
  readingTimeText,
}: CoverMetaProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Cover image with reserved aspect ratio to prevent CLS */}
      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-xl">
        <Image
          src={coverImage}
          alt={`Cover image for ${title}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
          className="object-cover"
        />
      </div>

      {/* Metadata strip */}
      <div className="border-border/40 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            Client
          </span>
          <span className="text-sm font-medium">{client}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            Role
          </span>
          <span className="text-sm font-medium">{role}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            Year
          </span>
          <span className="text-sm font-medium tabular-nums">{year}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            Read time
          </span>
          <ReadingTimeChip text={readingTimeText} />
        </div>
      </div>

      {/* Coverage tags */}
      <div className="flex flex-wrap gap-2">
        {coverage.map((tag) => (
          <span
            key={tag}
            className="bg-muted text-muted-foreground rounded-full px-3 py-1 font-mono text-xs tracking-wide uppercase"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Next case study CTA
// ---------------------------------------------------------------------------

interface NextCaseCTAProps {
  nextTitle: string;
  nextSlug: string;
}

function NextCaseCTA({ nextTitle, nextSlug }: NextCaseCTAProps) {
  return (
    <div className="border-border/40 mt-16 border-t pt-12">
      <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
        Next case study
      </p>
      <Link
        href={`/work/${nextSlug}`}
        aria-label={`Next case study: ${nextTitle}`}
        className="group focus-visible:ring-ring mt-4 flex min-h-[44px] items-center gap-3 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span className="font-display text-2xl font-semibold tracking-tight transition-transform group-hover:translate-x-1 sm:text-3xl">
          {nextTitle}
        </span>
        <span
          aria-hidden="true"
          className="text-muted-foreground shrink-0 transition-transform group-hover:translate-x-2"
        >
          →
        </span>
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) notFound();

  const { frontmatter, content, readingTime } = cs;

  // Determine the next published case study (wraps around).
  const published = getPublishedCaseStudies();
  const currentIdx = published.findIndex((p) => p.frontmatter.slug === slug);
  const nextCs =
    currentIdx !== -1 && published.length > 1
      ? published[(currentIdx + 1) % published.length]
      : null;

  return (
    <main id="main-content">
      {/* Hero section — cover + metadata strip */}
      <Section spacing="hero">
        <Container>
          {/* Page h1 — lives here, not in MDX body (heading-hierarchy rule) */}
          <h1 className="font-display mb-8 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {frontmatter.title}
          </h1>

          <CoverMeta
            title={frontmatter.title}
            client={frontmatter.client}
            role={frontmatter.role}
            year={frontmatter.year}
            coverage={frontmatter.coverage}
            coverImage={frontmatter.coverImage}
            readingTimeText={readingTime.text}
          />
        </Container>
      </Section>

      {/* MDX body — constrained to max-w-prose for line-length compliance */}
      <Section>
        <Container width="narrow">
          <MDXRemote source={content} components={mdxComponents} options={mdxOptions} />

          {/* Next case study CTA */}
          {nextCs && (
            <NextCaseCTA nextTitle={nextCs.frontmatter.title} nextSlug={nextCs.frontmatter.slug} />
          )}
        </Container>
      </Section>
    </main>
  );
}
