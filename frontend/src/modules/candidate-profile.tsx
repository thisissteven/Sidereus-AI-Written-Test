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
} from "lucide-react"
import type { ResumeInfo } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function Field({
  icon: Icon,
  label,
  value,
  bonus,
}: {
  icon: React.ElementType
  label: string
  value: string
  bonus?: boolean
}) {
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
              bonus
            </span>
          ) : null}
        </p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function CandidateProfileCard({
  resumeInfo,
}: {
  resumeInfo: ResumeInfo
}) {
  const basic = resumeInfo.basic_info
  const intent = resumeInfo.job_intent

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="font-heading text-base">
          Extracted Profile
        </CardTitle>
        <Badge variant="secondary" className="font-mono text-[11px]">
          AI extracted
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        {basic && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {basic.name && (
              <Field icon={User} label="Name" value={basic.name} />
            )}
            {basic.phone && (
              <Field icon={Phone} label="Phone" value={basic.phone} />
            )}
            {basic.email && (
              <Field icon={Mail} label="Email" value={basic.email} />
            )}
            {basic.address && (
              <Field icon={MapPin} label="Location" value={basic.address} />
            )}
          </div>
        )}

        {/* Job Intent */}
        {intent && (
          <>
            <Separator />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {intent.desired_position && (
                <Field
                  icon={Target}
                  label="Job Intention"
                  value={intent.desired_position}
                  bonus
                />
              )}
              {intent.expected_salary && (
                <Field
                  icon={Wallet}
                  label="Expected Salary"
                  value={intent.expected_salary}
                  bonus
                />
              )}
              {intent.available_date && (
                <Field
                  icon={Clock}
                  label="Available Date"
                  value={intent.available_date}
                  bonus
                />
              )}
            </div>
          </>
        )}

        {/* Skills */}
        {resumeInfo.skills && resumeInfo.skills.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {resumeInfo.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="font-mono text-[11px]"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Summary */}
        {resumeInfo.summary && (
          <>
            <Separator />
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Summary
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {resumeInfo.summary}
              </p>
            </div>
          </>
        )}

        {/* Education */}
        {resumeInfo.education && resumeInfo.education.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                Education
              </p>
              <div className="space-y-3">
                {resumeInfo.education.map((edu, i) => (
                  <div
                    key={`${edu.school ?? "edu"}-${i}`}
                    className="rounded-lg border border-border bg-secondary/40 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {edu.school || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {edu.start_date || "?"} – {edu.end_date || "?"}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {edu.degree || ""}
                      {edu.major ? ` · ${edu.major}` : ""}
                    </p>
                    {edu.gpa && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Work Experience */}
        {resumeInfo.work_experience &&
          resumeInfo.work_experience.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                  Work Experience
                </p>
                <div className="space-y-3">
                  {resumeInfo.work_experience.map((work, i) => (
                    <div
                      key={`${work.company ?? "work"}-${i}`}
                      className="rounded-lg border border-border bg-secondary/40 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          {work.company || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {work.start_date || "?"} – {work.end_date || "?"}
                        </p>
                      </div>
                      {work.position && (
                        <p className="mt-1 text-xs font-medium text-primary/80">
                          {work.position}
                        </p>
                      )}
                      {work.description && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {work.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        {/* Project Experience */}
        {resumeInfo.project_experience &&
          resumeInfo.project_experience.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Project Experience
                </p>
                <div className="space-y-3">
                  {resumeInfo.project_experience.map((proj, i) => (
                    <div
                      key={`${proj.name ?? "proj"}-${i}`}
                      className="rounded-lg border border-border bg-secondary/40 p-3"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {proj.name || "N/A"}
                      </p>
                      {proj.role && (
                        <p className="mt-1 text-xs font-medium text-primary/80">
                          {proj.role}
                        </p>
                      )}
                      {proj.description && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {proj.description}
                        </p>
                      )}
                      {proj.tech_stack && proj.tech_stack.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {proj.tech_stack.map((tech) => (
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
              </div>
            </>
          )}
      </CardContent>
    </Card>
  )
}
