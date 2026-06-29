import React from "react";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import {
  getContainerStyle,
  getHeadingStyle,
  getContentStyle,
  buildSectionOrder,
} from "../../utils/templateHelpers";
import { DEFAULT_SECTION_HEADINGS } from "../SectionManager";

const ExecutiveTemplate = ({ data, accentColor, styleOptions = {} }) => {
  const accent = accentColor || "#1e3a5f";

  // Derive a slightly darker shade for gradient
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };
  const darken = (hex, amount = 30) => {
    try {
      const { r, g, b } = hexToRgb(hex);
      const clamp = (v) => Math.max(0, Math.min(255, v));
      return `rgb(${clamp(r - amount)}, ${clamp(g - amount)}, ${clamp(b - amount)})`;
    } catch {
      return hex;
    }
  };

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

  const sectionHeadingStyle = {
    fontSize: "0.72em",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: accent,
    fontWeight: 700,
    marginBottom: "0.85em",
    paddingBottom: "0.4em",
    borderBottom: `2px solid ${accent}`,
    ...hStyle,
  };

  const sectionStyle = { marginBottom: "1.75em" };

  // ── Section renderers ──────────────────────────────────────────────────────

  const renderSummary = () =>
    data.professional_summary ? (
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("summary")}</h2>
        <p style={{ color: "#374151", lineHeight: 1.7, ...cStyle }}>
          {data.professional_summary}
        </p>
      </section>
    ) : null;

  const renderExperience = () =>
    data.experience?.length > 0 ? (
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("experience")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25em" }}>
          {data.experience.map((exp, i) => (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.2em",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.02em", color: "#111827" }}>
                    {exp.position}
                  </div>
                  <div style={{ color: accent, fontWeight: 600, fontSize: "0.93em" }}>
                    {exp.company}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "0.8em",
                    color: "#6b7280",
                    flexShrink: 0,
                    marginLeft: "1em",
                    marginTop: "0.15em",
                    fontStyle: "italic",
                  }}
                >
                  {formatDate(exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.end_date)}
                </div>
              </div>
              {exp.description && (
                <div
                  style={{
                    color: "#4b5563",
                    whiteSpace: "pre-line",
                    marginTop: "0.4em",
                    paddingLeft: "0.9em",
                    borderLeft: `3px solid ${accent}20`,
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
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85em" }}>
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <div style={{ fontWeight: 600, color: "#111827" }}>
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.9em" }}>{edu.institution}</div>
                {edu.gpa && (
                  <div style={{ fontSize: "0.82em", color: "#9ca3af" }}>GPA: {edu.gpa}</div>
                )}
              </div>
              <div style={{ fontSize: "0.82em", color: "#9ca3af", flexShrink: 0, marginLeft: "1em" }}>
                {formatDate(edu.graduation_date)}
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderProjects = () =>
    data.project?.length > 0 ? (
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("projects")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85em" }}>
          {data.project.map((proj, i) => (
            <div key={i}>
              <div style={{ fontWeight: 600, color: "#111827" }}>{proj.name}</div>
              {proj.description && (
                <div style={{ color: "#4b5563", marginTop: "0.2em", ...cStyle }}>
                  {proj.description}
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4em 0.75em" }}>
          {data.skills.map((skill, i) => (
            <span
              key={i}
              style={{
                padding: "0.25em 0.85em",
                fontSize: "0.83em",
                color: accent,
                border: `1px solid ${accent}`,
                borderRadius: "0.25em",
                backgroundColor: `${accent}0d`,
                ...cStyle,
              }}
            >
              {skill}
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
        <h2 style={sectionHeadingStyle}>{section.heading || "Untitled"}</h2>
        <div style={{ whiteSpace: "pre-line", color: "#374151", ...cStyle }}>
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
        backgroundColor: "#ffffff",
        color: "#1f2937",
      }}
    >
      {/* Executive Header — full-width gradient banner */}
      <header
        style={{
          background: `linear-gradient(135deg, ${darken(accent, 20)} 0%, ${accent} 60%, ${darken(accent, -15)} 100%)`,
          padding: "2.5em 2.5em 2em",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            right: "-3em",
            top: "-3em",
            width: "10em",
            height: "10em",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "4em",
            bottom: "-2em",
            width: "6em",
            height: "6em",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />

        <h1
          style={{
            fontSize: "2.2em",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "0.2em",
            position: "relative",
          }}
        >
          {data.personal_info?.full_name || "Your Name"}
        </h1>

        {data.personal_info?.profession && (
          <p
            style={{
              fontSize: "1em",
              opacity: 0.85,
              marginBottom: "1em",
              fontWeight: 400,
              letterSpacing: "0.02em",
              position: "relative",
            }}
          >
            {data.personal_info.profession}
          </p>
        )}

        {/* Contact bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.3em 1.75em",
            fontSize: "0.82em",
            opacity: 0.9,
            position: "relative",
          }}
        >
          {data.personal_info?.email && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.4em" }}>
              <Mail size="1em" /> {data.personal_info.email}
            </span>
          )}
          {data.personal_info?.phone && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.4em" }}>
              <Phone size="1em" /> {data.personal_info.phone}
            </span>
          )}
          {data.personal_info?.location && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.4em" }}>
              <MapPin size="1em" /> {data.personal_info.location}
            </span>
          )}
          {data.personal_info?.linkedin && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.4em" }}>
              <Linkedin size="1em" />{" "}
              {data.personal_info.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
            </span>
          )}
          {data.personal_info?.website && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.4em" }}>
              <Globe size="1em" />{" "}
              {data.personal_info.website.replace(/^https?:\/\//, "")}
            </span>
          )}
        </div>
      </header>

      {/* Body */}
      <div style={{ padding: "2em 2.5em" }}>
        {sectionOrder.map((key) => {
          if (builtInKeys.has(key)) {
            const content = sectionRenderers[key]?.() ?? null;
            return content ? <React.Fragment key={key}>{content}</React.Fragment> : null;
          }
          if (customSectionIds.has(key)) return renderCustomSection(key);
          return null;
        })}
      </div>
    </div>
  );
};

export default ExecutiveTemplate;
