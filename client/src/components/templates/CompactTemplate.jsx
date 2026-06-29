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
  const builtInKeys = new Set(["summary", "experience", "education", "projects", "skills"]);
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
              <span style={{ fontWeight: 600, color: "#111827", fontSize: "0.93em" }}>
                {proj.name}
              </span>
              {proj.description && (
                <span style={{ color: "#4b5563", fontSize: "0.88em" }}>
                  {" "}— {proj.description}
                </span>
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
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2em", fontSize: "0.78em", color: "#6b7280" }}>
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
