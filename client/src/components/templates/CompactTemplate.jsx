import React from "react";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import {
  getContainerStyle,
  getHeadingStyle,
  getContentStyle,
  buildSectionOrder,
} from "../../utils/templateHelpers";
import { DEFAULT_SECTION_HEADINGS } from "../SectionManager";

const CompactTemplate = ({ data, accentColor, styleOptions = {} }) => {
  const accent = accentColor || "#059669";

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
  const customSectionIds = new Set((data.custom_sections || []).map((s) => s.id));

  const hStyle = getHeadingStyle(styleOptions);
  const cStyle = getContentStyle(styleOptions);

  // Tight, compact section heading — thin rule below
  const sectionHeadingStyle = {
    fontSize: "0.68em",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#374151",
    fontWeight: 700,
    marginBottom: "0.6em",
    paddingBottom: "0.3em",
    borderBottom: `1px solid #d1d5db`,
    ...hStyle,
  };

  const sectionStyle = { marginBottom: "1.25em" };

  // ── Section renderers ──────────────────────────────────────────────────────

  const renderSummary = () =>
    data.professional_summary ? (
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("summary")}</h2>
        <p style={{ color: "#374151", lineHeight: 1.55, ...cStyle }}>
          {data.professional_summary}
        </p>
      </section>
    ) : null;

  const renderExperience = () =>
    data.experience?.length > 0 ? (
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("experience")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9em" }}>
          {data.experience.map((exp, i) => (
            <div key={i}>
              {/* Position + date on one line */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, color: "#111827", fontSize: "0.97em" }}>
                  {exp.position}
                </span>
                <span style={{ fontSize: "0.78em", color: "#6b7280", flexShrink: 0, marginLeft: "0.75em" }}>
                  {formatDate(exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.end_date)}
                </span>
              </div>
              {/* Company + location inline */}
              <div style={{ fontSize: "0.88em", color: accent, fontWeight: 500, marginTop: "0.05em" }}>
                {exp.company}
              </div>
              {exp.description && (
                <div
                  style={{
                    color: "#4b5563",
                    whiteSpace: "pre-line",
                    marginTop: "0.3em",
                    fontSize: "0.93em",
                    lineHeight: 1.5,
                    ...cStyle,
                  }}
                >
                  {exp.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderEducation = () =>
    data.education?.length > 0 ? (
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("education")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55em" }}>
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <span style={{ fontWeight: 600, color: "#111827", fontSize: "0.93em" }}>
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                </span>
                <span style={{ color: "#6b7280", fontSize: "0.85em" }}>
                  {" "}&mdash; {edu.institution}
                </span>
                {edu.gpa && (
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}> · GPA: {edu.gpa}</span>
                )}
              </div>
              <span style={{ fontSize: "0.78em", color: "#6b7280", flexShrink: 0, marginLeft: "0.75em" }}>
                {formatDate(edu.graduation_date)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderProjects = () =>
    data.project?.length > 0 ? (
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("projects")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
          {data.project.map((proj, i) => (
            <div key={i}>
              <div>
                <span style={{ fontWeight: 600, color: "#111827", fontSize: "0.93em" }}>
                  {proj.name}
                </span>
                {proj.type && (
                  <span style={{ color: "#6b7280", fontSize: "0.85em", marginLeft: "0.4em", ...cStyle }}>{proj.type}</span>
                )}
                {proj.description && (
                  <span style={{ color: "#4b5563", fontSize: "0.88em" }}>
                    {" "}— {proj.description}
                  </span>
                )}
              </div>
              {(proj.techStack?.length > 0) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3em", marginTop: "0.25em" }}>
                  {proj.techStack.map((tech, ti) => (
                    <span key={ti} style={{ fontSize: "0.75em", padding: "0.05em 0.4em", borderRadius: "2px", background: "#f3f4f6", color: "#374151" }}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {(proj.githubUrl || proj.liveUrl) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65em", marginTop: "0.2em" }}>
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

  const renderSkills = () =>
    data.skills?.length > 0 ? (
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("skills")}</h2>
        <p style={{ color: "#374151", fontSize: "0.92em", lineHeight: 1.6, ...cStyle }}>
          {data.skills.join(" · ")}
        </p>
      </section>
    ) : null;

  const renderCertifications = () =>
    data.certifications?.length > 0 ? (
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("certifications")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55em" }}>
          {data.certifications.map((cert, i) => (
            <div key={i}>
              <span style={{ fontWeight: 600, color: "#111827", fontSize: "0.93em" }}>
                {cert.name}
              </span>
              {cert.issuer && (
                <span style={{ color: "#6b7280", fontSize: "0.85em" }}> — {cert.issuer}</span>
              )}
              {(cert.issue_date || cert.expiry_date) && (
                <span style={{ color: "#9ca3af", fontSize: "0.8em" }}>
                  {" "}· {cert.issue_date}{cert.expiry_date ? ` – ${cert.expiry_date}` : ""}
                </span>
              )}
              {cert.credential_url && (
                <span style={{ marginLeft: "0.4em" }}>
                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" style={{ color: accent, fontSize: "0.8em" }}>
                    View
                  </a>
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderLanguages = () =>
    data.languages?.length > 0 ? (
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("languages")}</h2>
        <p style={{ color: "#374151", fontSize: "0.92em", lineHeight: 1.6, ...cStyle }}>
          {data.languages.map((l) => l.proficiency ? `${l.name} (${l.proficiency})` : l.name).join(" · ")}
        </p>
      </section>
    ) : null;

  const renderCustomSection = (id) => {
    const section = (data.custom_sections || []).find((s) => s.id === id);
    if (!section || (!section.heading?.trim() && !section.content?.trim())) return null;
    return (
      <section key={section.id} style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{section.heading || "Untitled"}</h2>
        <div style={{ whiteSpace: "pre-line", color: "#374151", fontSize: "0.92em", ...cStyle }}>
          {section.content}
        </div>
      </section>
    );
  };

  const sectionRenderers = {
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    projects: renderProjects,
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
        padding: "2em 2.5em",
        backgroundColor: "#ffffff",
        color: "#1f2937",
      }}
    >
      {/* Compact Header — name + contact all on ~2 lines */}
      <header style={{ marginBottom: "1.5em", paddingBottom: "1em", borderBottom: `3px solid ${accent}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "0.5em" }}>
          <div>
            <h1
              style={{
                fontSize: "1.8em",
                fontWeight: 700,
                color: "#111827",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {data.personal_info?.full_name || "Your Name"}
            </h1>
            {data.personal_info?.profession && (
              <p style={{ color: accent, fontSize: "0.9em", fontWeight: 600, marginTop: "0.2em" }}>
                {data.personal_info.profession}
              </p>
            )}
          </div>

          {/* Contact — right-aligned column */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2em", fontSize: "0.78em", color: "#6b7280", ...cStyle }}>
            {data.personal_info?.email && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
                <Mail size="0.9em" /> {data.personal_info.email}
              </span>
            )}
            {data.personal_info?.phone && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
                <Phone size="0.9em" /> {data.personal_info.phone}
              </span>
            )}
            {data.personal_info?.location && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
                <MapPin size="0.9em" /> {data.personal_info.location}
              </span>
            )}
            {data.personal_info?.linkedin && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
                <Linkedin size="0.9em" />{" "}
                {data.personal_info.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
              </span>
            )}
            {data.personal_info?.website && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
                <Globe size="0.9em" />{" "}
                {data.personal_info.website.replace(/^https?:\/\//, "")}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Sections */}
      {sectionOrder.map((key) => {
        if (builtInKeys.has(key)) {
          const content = sectionRenderers[key]?.() ?? null;
          return content ? <React.Fragment key={key}>{content}</React.Fragment> : null;
        }
        if (customSectionIds.has(key)) return renderCustomSection(key);
        return null;
      })}
    </div>
  );
};

export default CompactTemplate;
