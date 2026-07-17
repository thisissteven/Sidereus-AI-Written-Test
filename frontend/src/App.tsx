import { FileSearch, Braces, DatabaseZap } from "lucide-react"
import { SiteHeader } from "@/modules/site-header"
import { ResumeAnalyzer } from "@/modules/resume-analyzer"

const FEATURES = [
  {
    icon: FileSearch,
    title: "PDF parsing",
    desc: "Multi-page resumes cleaned and structured for extraction.",
  },
  {
    icon: Braces,
    title: "AI extraction",
    desc: "Key fields pulled into structured JSON automatically.",
  },
  {
    icon: DatabaseZap,
    title: "Cached scoring",
    desc: "Redis-backed match scores avoid recomputing candidates.",
  },
]

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <section className="mb-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            AI for Science · GaliLeo Platform
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            Intelligent resume analysis, powered by ADAM
          </h1>
          <p className="mt-3 leading-relaxed text-pretty text-muted-foreground">
            Upload a candidate&apos;s resume, automatically extract the details
            that matter, and match them against a role in seconds — so
            recruiters can screen faster and focus on the right people.
          </p>

          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="rounded-xl border border-border bg-card p-4"
              >
                <f.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {f.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <ResumeAnalyzer />
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          <p>
            Sidereus AI · 星使智算 — bringing scientific computing into a new
            era.
          </p>
        </div>
      </footer>
    </div>
  )
}
