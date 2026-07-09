import React from "react";
import { buildSectionOrder, getContainerStyle, getHeadingStyle, getContentStyle } from "../../utils/templateHelpers";
import { DEFAULT_SECTION_HEADINGS } from "../SectionManager";

const MinimalTemplate = ({ data, accentColor, styleOptions = {} }) => {
  const accent = accentColor || "#4F46E5";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month] = dateStr.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const heading = (key) =>
    data.section_headings?.[key]?.trim() || DEFAULT_SECTION_HEADINGS[key];

  const sectionOrder = buildSectionOrder(styleOptions, data.custom_sections);
  const builtInKeys = new Set(["summary", "experience", "education", "projects", "skills", "certifications", "languages"]);

  const hStyle = getHeadingStyle(styleOptions);
  const cStyle = getContentStyle(styleOptions);

  const labelStyle = {
    fontSize: "0.7em",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: accent,
    marginBottom: "1em",
    display: "block",
    ...hStyle,
  };

  const sectionStyle = { marginBottom: "2.25em" };

  // ── Section renderers ─────────────────────────────────────────────────────

  const renderSummary = () =>
    data.professional_summary ? (
      <section key="summary" style={sectionStyle}>
        <span style={labelStyle}>{heading("summary")}</span>
        <p style={{ color: "#374151", ...cStyle }}>{data.professional_summary}</p>
      </section>
    ) : null;

  const renderExperience = () =>
    data.experience?.length > 0 ? (
      <section key="experience" style={sectionStyle}>
        <span style={labelStyle}>{heading("experience")}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25em" }}>
          {data.experience.map((exp, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.15em" }}>
                <span style={{ fontSize: "1.05em", fontWeight: 500 }}>{exp.position}</span>
                <span style={{ fontSize: "0.82em", color: "#6b7280", flexShrink: 0, marginLeft: "1em" }}>
                  {formatDate(exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.end_date)}
                </span>
              </div>
              <p style={{ color: "#6b7280", marginBottom: "0.4em" }}>{exp.company}</p>
              {exp.description && (
                <div style={{ color: "#374151", whiteSpace: "pre-line", ...cStyle }}>{exp.description}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderProjects = () =>
    data.project?.length > 0 ? (
      <section key="projects" style={sectionStyle}>
        <span style={labelStyle}>{heading("projects")}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9em" }}>
          {data.project.map((proj, i) => (
            <div key={i}>
              <span style={{ fontSize: "1.05em", fontWeight: 500 }}>{proj.name}</span>
              {proj.type && (
                <span style={{ fontSize: "0.85em", color: "#9ca3af", marginLeft: "0.5em", ...cStyle }}>{proj.type}</span>
              )}
              {proj.description && (
                <p style={{ color: "#6b7280", marginTop: "0.15em" }}>{proj.description}</p>
              )}
              {(proj.techStack?.length > 0) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3em", marginTop: "0.3em" }}>
                  {proj.techStack.map((tech, ti) => (
                    <span key={ti} style={{ fontSize: "0.78em", padding: "0.08em 0.45em", borderRadius: "3px", background: "#f3f4f6", color: "#374151" }}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {(proj.githubUrl || proj.liveUrl) && (
                <div style={{ display: "flex", gap: "0.7em", marginTop: "0.25em" }}>
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.3em", fontSize: "0.72em", padding: "0.15em 0.6em", borderRadius: "999px", background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", textDecoration: "none", lineHeight: 1.4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
                      GitHub
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.3em", fontSize: "0.72em", padding: "0.15em 0.6em", borderRadius: "999px", background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", textDecoration: "none", lineHeight: 1.4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Live Demo
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderEducation = () =>
    data.education?.length > 0 ? (
      <section key="education" style={sectionStyle}>
        <span style={labelStyle}>{heading("education")}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9em" }}>
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <div style={{ fontWeight: 500 }}>
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                </div>
                <div style={{ color: "#6b7280" }}>{edu.institution}</div>
                {edu.gpa && <div style={{ fontSize: "0.85em", color: "#9ca3af" }}>GPA: {edu.gpa}</div>}
              </div>
              <span style={{ fontSize: "0.85em", color: "#6b7280", flexShrink: 0, marginLeft: "1em" }}>
                {formatDate(edu.graduation_date)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderSkills = () =>
    data.skills?.length > 0 ? (
      <section key="skills" style={sectionStyle}>
        <span style={labelStyle}>{heading("skills")}</span>
        <p style={{ color: "#374151", ...cStyle }}>{data.skills.join(" • ")}</p>
      </section>
    ) : null;

  const renderCertifications = () =>
    data.certifications?.length > 0 ? (
      <section key="certifications" style={sectionStyle}>
        <span style={labelStyle}>{heading("certifications")}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
          {data.certifications.map((cert, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <span style={{ fontWeight: 500 }}>{cert.name}</span>
                {cert.issuer && <span style={{ color: "#6b7280", marginLeft: "0.4em" }}>· {cert.issuer}</span>}
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: "0.4em", color: accent, fontSize: "0.8em" }}
                  >View ↗</a>
                )}
              </div>
              {cert.issue_date && (
                <span style={{ fontSize: "0.82em", color: "#6b7280", flexShrink: 0, marginLeft: "1em" }}>
                  {new Date(cert.issue_date + "-01").toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                  {cert.expiry_date
                    ? ` – ${new Date(cert.expiry_date + "-01").toLocaleDateString("en-US", { year: "numeric", month: "short" })}`
                    : ""}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderLanguages = () =>
    data.languages?.length > 0 ? (
      <section key="languages" style={sectionStyle}>
        <span style={labelStyle}>{heading("languages")}</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4em 2em" }}>
          {data.languages.map((lang, i) => (
            <span key={i}>
              <strong style={{ fontWeight: 500 }}>{lang.name}</strong>
              {lang.proficiency && (
                <span style={{ color: "#6b7280", marginLeft: "0.35em", fontSize: "0.88em" }}>
                  — {lang.proficiency}
                </span>
              )}
            </span>
          ))}
        </div>
      </section>
    ) : null;

  const renderCustomSection = (id) => {
    const section = (data.custom_sections || []).find((s) => s.id === id);
    if (!section || (!section.heading?.trim() && !section.content?.trim())) return null;
    return (
      <section key={section.id} style={sectionStyle}>
        <span style={labelStyle}>{section.heading || "Untitled"}</span>
        <div style={{ color: "#374151", whiteSpace: "pre-line", ...cStyle }}>{section.content}</div>
      </section>
    );
  };

  const sectionRenderers = {
    summary: renderSummary,
    experience: renderExperience,
    projects: renderProjects,
    education: renderEducation,
    skills: renderSkills,
    certifications: renderCertifications,
    languages: renderLanguages,
  };

  return (
    <div
      style={{
        ...getContainerStyle(styleOptions),
        maxWidth: "56rem",
        margin: "0 auto",
        padding: "2.5em",
        backgroundColor: "#ffffff",
        color: "#111827",
        fontWeight: 300,
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: "2.5em" }}>
        <h1
          style={{
            fontSize: "2.2em",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            marginBottom: "0.6em",
            color: "#111827",
          }}
        >
          {data.personal_info?.full_name || "Your Name"}
        </h1>
        {data.personal_info?.profession && (
          <p style={{ color: "#6b7280", marginBottom: "0.5em" }}>
            {data.personal_info.profession}
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2em 1.5em", fontSize: "0.88em", color: "#6b7280", ...cStyle }}>
          {data.personal_info?.email && <span>{data.personal_info.email}</span>}
          {data.personal_info?.phone && <span>{data.personal_info.phone}</span>}
          {data.personal_info?.location && <span>{data.personal_info.location}</span>}
          {data.personal_info?.linkedin && <span>{data.personal_info.linkedin}</span>}
          {data.personal_info?.website && <span>{data.personal_info.website}</span>}
        </div>
        <hr style={{ marginTop: "1.5em", borderColor: "#e5e7eb" }} />
      </header>

      {/* Sections in resolved order */}
      {sectionOrder.map((key) => {
        let content = null;
        if (builtInKeys.has(key)) {
          content = sectionRenderers[key]?.() ?? null;
        } else {
          content = renderCustomSection(key);
        }
        return content ? <React.Fragment key={key}>{content}</React.Fragment> : null;
      })}
    </div>
  );
};

export default MinimalTemplate;
