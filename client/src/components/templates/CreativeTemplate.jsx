import React from "react";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import {
  getContainerStyle,
  getHeadingStyle,
  getContentStyle,
  buildSectionOrder,
} from "../../utils/templateHelpers";
import { DEFAULT_SECTION_HEADINGS } from "../SectionManager";

const CreativeTemplate = ({ data, accentColor, styleOptions = {} }) => {
  const accent = accentColor || "#7c3aed";

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

  // Split sections: skills & education go to sidebar; rest go to main column
  const sidebarBuiltIn = new Set(["skills", "education"]);
  const mainBuiltIn = new Set(["summary", "experience", "projects", "certifications", "languages"]);
  const customSectionIds = (data.custom_sections || []).map((s) => s.id);

  const hStyle = getHeadingStyle(styleOptions);
  const cStyle = getContentStyle(styleOptions);

  // ── Sidebar section heading ────────────────────────────────────────────────
  const sidebarHeadingStyle = {
    fontSize: "0.65em",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.7)",
    fontWeight: 700,
    marginBottom: "0.85em",
    paddingBottom: "0.35em",
    borderBottom: "1px solid rgba(255,255,255,0.25)",
    ...hStyle,
  };

  // ── Main section heading ───────────────────────────────────────────────────
  const mainHeadingStyle = {
    fontSize: "0.72em",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: accent,
    fontWeight: 700,
    marginBottom: "0.85em",
    paddingBottom: "0.35em",
    borderBottom: `2px solid ${accent}22`,
    ...hStyle,
  };

  const mainSectionStyle = { marginBottom: "1.75em" };
  const sidebarSectionStyle = { marginBottom: "1.75em" };

  // ── Sidebar renderers ──────────────────────────────────────────────────────

  const renderSidebarSkills = () =>
    data.skills?.length > 0 ? (
      <section style={sidebarSectionStyle}>
        <h2 style={sidebarHeadingStyle}>{heading("skills")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45em" }}>
          {data.skills.map((skill, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                padding: "0.2em 0.6em",
                fontSize: "0.85em",
                background: "rgba(255,255,255,0.15)",
                color: "#ffffff",
                borderRadius: "0.2em",
                ...cStyle,
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    ) : null;

  const renderSidebarEducation = () =>
    data.education?.length > 0 ? (
      <section style={sidebarSectionStyle}>
        <h2 style={sidebarHeadingStyle}>{heading("education")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
          {data.education.map((edu, i) => (
            <div key={i}>
              <div style={{ fontWeight: 600, color: "#ffffff", fontSize: "0.9em" }}>
                {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85em", marginTop: "0.1em" }}>
                {edu.institution}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78em", marginTop: "0.15em" }}>
                {formatDate(edu.graduation_date)}
                {edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderSidebarContact = () => (
    <section style={{ marginBottom: "2em" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6em", fontSize: "0.85em" }}>
        {data.personal_info?.email && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.5em", color: "rgba(255,255,255,0.85)", wordBreak: "break-all" }}>
            <Mail size="0.95em" style={{ flexShrink: 0 }} /> {data.personal_info.email}
          </span>
        )}
        {data.personal_info?.phone && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.5em", color: "rgba(255,255,255,0.85)" }}>
            <Phone size="0.95em" style={{ flexShrink: 0 }} /> {data.personal_info.phone}
          </span>
        )}
        {data.personal_info?.location && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.5em", color: "rgba(255,255,255,0.85)" }}>
            <MapPin size="0.95em" style={{ flexShrink: 0 }} /> {data.personal_info.location}
          </span>
        )}
        {data.personal_info?.linkedin && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.5em", color: "rgba(255,255,255,0.85)", wordBreak: "break-all" }}>
            <Linkedin size="0.95em" style={{ flexShrink: 0 }} />{" "}
            {data.personal_info.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
          </span>
        )}
        {data.personal_info?.website && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.5em", color: "rgba(255,255,255,0.85)", wordBreak: "break-all" }}>
            <Globe size="0.95em" style={{ flexShrink: 0 }} />{" "}
            {data.personal_info.website.replace(/^https?:\/\//, "")}
          </span>
        )}
      </div>
    </section>
  );

  // ── Main renderers ─────────────────────────────────────────────────────────

  const renderSummary = () =>
    data.professional_summary ? (
      <section style={mainSectionStyle}>
        <h2 style={mainHeadingStyle}>{heading("summary")}</h2>
        <p style={{ color: "#374151", lineHeight: 1.7, ...cStyle }}>
          {data.professional_summary}
        </p>
      </section>
    ) : null;

  const renderExperience = () =>
    data.experience?.length > 0 ? (
      <section style={mainSectionStyle}>
        <h2 style={mainHeadingStyle}>{heading("experience")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25em" }}>
          {data.experience.map((exp, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#111827", fontSize: "1em" }}>
                    {exp.position}
                  </div>
                  <div style={{ color: accent, fontWeight: 500, fontSize: "0.9em" }}>
                    {exp.company}
                  </div>
                </div>
                <div style={{ fontSize: "0.78em", color: "#9ca3af", flexShrink: 0, marginLeft: "1em", fontStyle: "italic", marginTop: "0.1em" }}>
                  {formatDate(exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.end_date)}
                </div>
              </div>
              {exp.description && (
                <div style={{ color: "#4b5563", whiteSpace: "pre-line", marginTop: "0.45em", ...cStyle }}>
                  {exp.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderProjects = () =>
    data.project?.length > 0 ? (
      <section style={mainSectionStyle}>
        <h2 style={mainHeadingStyle}>{heading("projects")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9em" }}>
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

  const renderCertifications = () =>
    data.certifications?.length > 0 ? (
      <section style={mainSectionStyle}>
        <h2 style={mainHeadingStyle}>{heading("certifications")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9em" }}>
          {data.certifications.map((cert, i) => (
            <div key={i}>
              <div style={{ fontWeight: 600, color: "#111827" }}>{cert.name}</div>
              {cert.issuer && (
                <div style={{ color: accent, fontWeight: 500, fontSize: "0.9em" }}>{cert.issuer}</div>
              )}
              <div style={{ display: "flex", gap: "1em", fontSize: "0.78em", color: "#9ca3af", marginTop: "0.1em" }}>
                {(cert.issue_date || cert.expiry_date) && (
                  <span>{cert.issue_date}{cert.expiry_date ? ` – ${cert.expiry_date}` : ""}</span>
                )}
                {cert.credential_url && (
                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    View credential
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderLanguages = () =>
    data.languages?.length > 0 ? (
      <section style={mainSectionStyle}>
        <h2 style={mainHeadingStyle}>{heading("languages")}</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5em" }}>
          {data.languages.map((lang, i) => (
            <span
              key={i}
              style={{
                padding: "0.2em 0.7em",
                fontSize: "0.85em",
                color: "#374151",
                borderRadius: "0.2em",
                backgroundColor: "#f3f4f6",
                ...cStyle,
              }}
            >
              {lang.name}{lang.proficiency ? ` · ${lang.proficiency}` : ""}
            </span>
          ))}
        </div>
      </section>
    ) : null;

  const renderCustomSection = (id) => {
    const section = (data.custom_sections || []).find((s) => s.id === id);
    if (!section || (!section.heading?.trim() && !section.content?.trim())) return null;
    return (
      <section key={section.id} style={mainSectionStyle}>
        <h2 style={mainHeadingStyle}>{section.heading || "Untitled"}</h2>
        <div style={{ whiteSpace: "pre-line", color: "#374151", ...cStyle }}>
          {section.content}
        </div>
      </section>
    );
  };

  // Determine main column sections in order
  const mainSections = sectionOrder.filter(
    (key) => mainBuiltIn.has(key) || customSectionIds.includes(key)
  );

  const mainRenderers = {
    summary: renderSummary,
    experience: renderExperience,
    projects: renderProjects,
    certifications: renderCertifications,
    languages: renderLanguages,
  };

  return (
    <div
      style={{
        ...getContainerStyle(styleOptions),
        maxWidth: "56rem",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        display: "flex",
        minHeight: "100%",
      }}
    >
      {/* ── Left Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: "32%",
          flexShrink: 0,
          backgroundColor: accent,
          padding: "2.5em 1.5em",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Name & title */}
        <div style={{ marginBottom: "2em" }}>
          <h1
            style={{
              fontSize: "1.5em",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.2,
              marginBottom: "0.4em",
              letterSpacing: "-0.01em",
            }}
          >
            {data.personal_info?.full_name || "Your Name"}
          </h1>
          {data.personal_info?.profession && (
            <p style={{ fontSize: "0.85em", color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>
              {data.personal_info.profession}
            </p>
          )}
        </div>

        {/* Contact */}
        {renderSidebarContact()}

        {/* Skills */}
        {renderSidebarSkills()}

        {/* Education */}
        {renderSidebarEducation()}
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "2.5em 2em", backgroundColor: "#ffffff" }}>
        {mainSections.map((key) => {
          if (mainBuiltIn.has(key)) {
            const content = mainRenderers[key]?.() ?? null;
            return content ? <React.Fragment key={key}>{content}</React.Fragment> : null;
          }
          return renderCustomSection(key);
        })}
      </main>
    </div>
  );
};

export default CreativeTemplate;
