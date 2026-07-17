import {
  User,
  Phone,
  Mail,
  MapPin,
  Target,
  Wallet,
  Clock,
  GraduationCap,
  FolderGit2,
  Briefcase,
  Wrench,
  FileText,
  Info,
} from "lucide-react"
import type { ResumeInfo } from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function hasText(value?: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function Field({
  icon: Icon,
  label,
  value,
  bonus,
}: {
  icon: React.ElementType
  label: string
  value?: string | null
  bonus?: boolean
}) {
  const { t } = useI18n()
  const filled = hasText(value)

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {label}
          {bonus ? (
            <span className="rounded bg-accent/15 px-1 py-px text-[10px] font-semibold text-accent-foreground">
              {t("profile.bonus")}
            </span>
          ) : null}
        </p>
        {filled ? (
          <p className="truncate text-sm font-medium text-foreground">
            {value}
          </p>
        ) : (
          <p className="truncate text-sm font-medium text-muted-foreground/60 italic">
            {t("profile.notProvided")}
          </p>
        )}
      </div>
    </div>
  )
}

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </p>
  )
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground/80">
      {children}
    </p>
  )
}

export function CandidateProfileCard({
  resumeInfo,
}: {
  resumeInfo: ResumeInfo
}) {
  const { t } = useI18n()

  const basic = resumeInfo.basic_info ?? null
  const intent = resumeInfo.job_intent ?? null
  const skills = resumeInfo.skills ?? []
  const education = resumeInfo.education ?? []
  const workExperience = resumeInfo.work_experience ?? []
  const projectExperience = resumeInfo.project_experience ?? []

  // Determine whether the basic-info / job-intent objects hold any real data.
  const hasBasic =
    !!basic &&
    (hasText(basic.name) ||
      hasText(basic.phone) ||
      hasText(basic.email) ||
      hasText(basic.address))
  const hasIntent =
    !!intent &&
    (hasText(intent.desired_position) ||
      hasText(intent.expected_salary) ||
      hasText(intent.available_date))

  const hasSkills = skills.some((s) => hasText(s))
  const hasSummary = hasText(resumeInfo.summary)
  const hasEducation = education.length > 0
  const hasWork = workExperience.length > 0
  const hasProjects = projectExperience.length > 0

  // If literally nothing was extracted, show a single clear message.
  const nothingExtracted =
    !hasBasic &&
    !hasIntent &&
    !hasSkills &&
    !hasSummary &&
    !hasEducation &&
    !hasWork &&
    !hasProjects

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="font-heading text-base">
          {t("profile.title")}
        </CardTitle>
        <Badge variant="secondary" className="font-mono text-[11px]">
          {t("profile.aiExtracted")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {nothingExtracted ? (
          <div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-secondary/30 p-4">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("profile.empty")}
            </p>
          </div>
        ) : (
          <>
            {/* Basic Info — always shown so missing fields are explicit */}
            <div>
              <SectionHeading icon={User}>
                {t("profile.section.basic")}
              </SectionHeading>
              {hasBasic ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    icon={User}
                    label={t("profile.field.name")}
                    value={basic?.name}
                  />
                  <Field
                    icon={Phone}
                    label={t("profile.field.phone")}
                    value={basic?.phone}
                  />
                  <Field
                    icon={Mail}
                    label={t("profile.field.email")}
                    value={basic?.email}
                  />
                  <Field
                    icon={MapPin}
                    label={t("profile.field.location")}
                    value={basic?.address}
                  />
                </div>
              ) : (
                <EmptyNote>{t("profile.empty.basic")}</EmptyNote>
              )}
            </div>

            {/* Job Intent */}
            <Separator />
            <div>
              <SectionHeading icon={Target}>
                {t("profile.section.jobIntent")}
              </SectionHeading>
              {hasIntent ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    icon={Target}
                    label={t("profile.field.jobIntention")}
                    value={intent?.desired_position}
                    bonus
                  />
                  <Field
                    icon={Wallet}
                    label={t("profile.field.expectedSalary")}
                    value={intent?.expected_salary}
                    bonus
                  />
                  <Field
                    icon={Clock}
                    label={t("profile.field.availableDate")}
                    value={intent?.available_date}
                    bonus
                  />
                </div>
              ) : (
                <EmptyNote>{t("profile.empty.jobIntent")}</EmptyNote>
              )}
            </div>

            {/* Skills */}
            <Separator />
            <div>
              <SectionHeading icon={Wrench}>
                {t("profile.section.skills")}
              </SectionHeading>
              {hasSkills ? (
                <div className="flex flex-wrap gap-2">
                  {skills
                    .filter((s) => hasText(s))
                    .map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="font-mono text-[11px]"
                      >
                        {skill}
                      </Badge>
                    ))}
                </div>
              ) : (
                <EmptyNote>{t("profile.empty.skills")}</EmptyNote>
              )}
            </div>

            {/* Summary */}
            <Separator />
            <div>
              <SectionHeading icon={FileText}>
                {t("profile.section.summary")}
              </SectionHeading>
              {hasSummary ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {resumeInfo.summary}
                </p>
              ) : (
                <EmptyNote>{t("profile.empty.summary")}</EmptyNote>
              )}
            </div>

            {/* Education */}
            <Separator />
            <div>
              <SectionHeading icon={GraduationCap}>
                {t("profile.section.education")}
              </SectionHeading>
              {hasEducation ? (
                <div className="space-y-3">
                  {education.map((edu, i) => (
                    <div
                      key={`${edu.school ?? "edu"}-${i}`}
                      className="rounded-lg border border-border bg-secondary/40 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {hasText(edu.school)
                            ? edu.school
                            : t("profile.unknownSchool")}
                        </p>
                        <p className="shrink-0 text-xs text-muted-foreground">
                          {hasText(edu.start_date)
                            ? edu.start_date
                            : t("profile.dateUnknown")}{" "}
                          –{" "}
                          {hasText(edu.end_date)
                            ? edu.end_date
                            : t("profile.dateUnknown")}
                        </p>
                      </div>
                      {(hasText(edu.degree) || hasText(edu.major)) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {hasText(edu.degree) ? edu.degree : ""}
                          {hasText(edu.major) ? ` · ${edu.major}` : ""}
                        </p>
                      )}
                      {hasText(edu.gpa) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("profile.gpa", { gpa: edu.gpa })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyNote>{t("profile.empty.education")}</EmptyNote>
              )}
            </div>

            {/* Work Experience */}
            <Separator />
            <div>
              <SectionHeading icon={Briefcase}>
                {t("profile.section.work")}
              </SectionHeading>
              {hasWork ? (
                <div className="space-y-3">
                  {workExperience.map((work, i) => (
                    <div
                      key={`${work.company ?? "work"}-${i}`}
                      className="rounded-lg border border-border bg-secondary/40 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {hasText(work.company)
                            ? work.company
                            : t("profile.unknownCompany")}
                        </p>
                        <p className="shrink-0 text-xs text-muted-foreground">
                          {hasText(work.start_date)
                            ? work.start_date
                            : t("profile.dateUnknown")}{" "}
                          –{" "}
                          {hasText(work.end_date)
                            ? work.end_date
                            : t("profile.dateUnknown")}
                        </p>
                      </div>
                      {hasText(work.position) && (
                        <p className="mt-1 text-xs font-medium text-primary/80">
                          {work.position}
                        </p>
                      )}
                      {hasText(work.description) && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {work.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyNote>{t("profile.empty.work")}</EmptyNote>
              )}
            </div>

            {/* Project Experience */}
            <Separator />
            <div>
              <SectionHeading icon={FolderGit2}>
                {t("profile.section.projects")}
              </SectionHeading>
              {hasProjects ? (
                <div className="space-y-3">
                  {projectExperience.map((proj, i) => (
                    <div
                      key={`${proj.name ?? "proj"}-${i}`}
                      className="rounded-lg border border-border bg-secondary/40 p-3"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {hasText(proj.name)
                          ? proj.name
                          : t("profile.unknownProject")}
                      </p>
                      {hasText(proj.role) && (
                        <p className="mt-1 text-xs font-medium text-primary/80">
                          {proj.role}
                        </p>
                      )}
                      {hasText(proj.description) && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {proj.description}
                        </p>
                      )}
                      {proj.tech_stack &&
                        proj.tech_stack.filter((tech) => hasText(tech)).length >
                          0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {proj.tech_stack
                              .filter((tech) => hasText(tech))
                              .map((tech) => (
                                <Badge
                                  key={tech}
                                  variant="outline"
                                  className="font-mono text-[10px]"
                                >
                                  {tech}
                                </Badge>
                              ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyNote>{t("profile.empty.projects")}</EmptyNote>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
