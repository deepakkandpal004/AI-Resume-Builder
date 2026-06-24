import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { getContainerStyle, buildSectionOrder } from "../../utils/templateHelpers";
import { DEFAULT_SECTION_HEADINGS } from "../SectionManager";

/**
 * MinimalImageTemplate — two-column layout (sidebar + main).
 *
 * Section ordering behaviour:
 *  - Sidebar columns: Contact (always first), then Education and Skills
 *    in the order they appear in sectionOrder.
 *  - Main column: Summary, Experience, Projects, and custom sections
 *    in the order they appear in sectionOrder.
 *  - Sections absent from sectionOrder are appended at the end of their
 *    respective column in default order.
 */
const MinimalImageTemplate = ({ data, accentColor, styleOptions = {} }) => {
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

  const resolveImageSrc = () => {
    const image = data.personal_info?.image;
    if (!image) return null;
    if (typeof image === "string") return image;
    if (typeof image === "object") {
      try { return URL.createObjectURL(image); } catch { return null; }
    }
    return null;
  };

  const imageSrc = resolveImageSrc();

  // Build the full resolved section order
  const sectionOrder = buildSectionOrder(styleOptions, data.custom_sections);

  // Split sections into sidebar keys and main keys, preserving sectionOrder
  const sidebarKeys = ["education", "skills"];
  const mainKeys = ["summary", "experience", "projects"];
  const customIds = (data.custom_sections || []).map((s) => s.id);

  // Ordered sidebar sections (education, skills in sectionOrder sequence)
  const orderedSidebarKeys = sectionOrder.filter((k) => sidebarKeys.includes(k));
  // Ordered main sections (summary, experience, projects, custom in sectionOrder sequence)
  const orderedMainKeys = sectionOrder.filter(
    (k) => mainKeys.includes(k) || customIds.includes(k)
  );

  // ── Shared heading styles ──────────────────────────────────────────────────
  const sidebarHeadingStyle = {
    fontSize: "0.7em",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#52525b",
    marginBottom: "0.75em",
    display: "block",
  };

  const mainHeadingStyle = {
    fontSize: "0.7em",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: accent,
    marginBottom: "0.75em",
    display: "block",
  };

  const sectionStyle = { marginBottom: "1.75em" };

  // ── Sidebar section renderers ──────────────────────────────────────────────
  const renderEducation = () =>
    data.education?.length > 0 ? (
      <section style={sectionStyle}>
        <span style={sidebarHeadingStyle}>{heading("education").toUpperCase()}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "1em", fontSize: "0.88em" }}>
          {data.education.map((edu, i) => (
            <div key={i}>
              <div style={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.9em" }}>
                {edu.degree}
              </div>
              {edu.field && <div style={{ color: "#52525b" }}>{edu.field}</div>}
              <div style={{ color: "#71717a" }}>{edu.institution}</div>
              <div style={{ fontSize: "0.85em", color: "#a1a1aa" }}>
                {formatDate(edu.graduation_date)}
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderSkills = () =>
    data.skills?.length > 0 ? (
      <section style={sectionStyle}>
        <span style={sidebarHeadingStyle}>{heading("skills").toUpperCase()}</span>
        <ul style={{ display: "flex", flexDirection: "column", gap: "0.35em", fontSize: "0.88em", listStyle: "none", padding: 0, margin: 0 }}>
          {data.skills.map((skill, i) => (
            <li key={i}>{skill}</li>
          ))}
        </ul>
      </section>
    ) : null;

  const sidebarRenderers = { education: renderEducation, skills: renderSkills };

  // ── Main section renderers ─────────────────────────────────────────────────
  const renderSummary = () =>
    data.professional_summary ? (
      <section style={sectionStyle}>
        <span style={mainHeadingStyle}>{heading("summary").toUpperCase()}</span>
        <p style={{ color: "#3f3f46" }}>{data.professional_summary}</p>
      </section>
    ) : null;

  const renderExperience = () =>
    data.experience?.length > 0 ? (
      <section style={sectionStyle}>
        <span style={mainHeadingStyle}>{heading("experience").toUpperCase()}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25em" }}>
          {data.experience.map((exp, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.15em" }}>
                <span style={{ fontWeight: 600, color: "#18181b" }}>{exp.position}</span>
                <span style={{ fontSize: "0.8em", color: "#71717a", flexShrink: 0, marginLeft: "0.5em" }}>
                  {formatDate(exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.end_date)}
                </span>
              </div>
              <p style={{ fontSize: "0.88em", color: accent, marginBottom: "0.4em" }}>{exp.company}</p>
              {exp.description && (
                <ul style={{ paddingLeft: "1.2em", fontSize: "0.88em", color: "#3f3f46" }}>
                  {exp.description.split("\n").filter(Boolean).map((line, j) => (
                    <li key={j} style={{ marginBottom: "0.2em" }}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderProjects = () =>
    data.project?.length > 0 ? (
      <section style={sectionStyle}>
        <span style={mainHeadingStyle}>{heading("projects").toUpperCase()}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
          {data.project.map((proj, i) => (
            <div key={i}>
              <div style={{ fontWeight: 500, color: "#18181b" }}>{proj.name}</div>
              {proj.type && (
                <div style={{ fontSize: "0.85em", color: accent }}>{proj.type}</div>
              )}
              {proj.description && (
                <ul style={{ paddingLeft: "1.2em", fontSize: "0.88em", color: "#3f3f46" }}>
                  {proj.description.split("\n").filter(Boolean).map((line, j) => (
                    <li key={j} style={{ marginBottom: "0.2em" }}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderCustomSection = (id) => {
    const section = (data.custom_sections || []).find((s) => s.id === id);
    if (!section || (!section.heading?.trim() && !section.content?.trim())) return null;
    return (
      <section style={sectionStyle}>
        <span style={mainHeadingStyle}>
          {(section.heading || "Untitled").toUpperCase()}
        </span>
        <div style={{ fontSize: "0.88em", color: "#3f3f46", whiteSpace: "pre-line" }}>
          {section.content}
        </div>
      </section>
    );
  };

  const mainRenderers = {
    summary: renderSummary,
    experience: renderExperience,
    projects: renderProjects,
  };

  return (
    <div
      style={{
        ...getContainerStyle(styleOptions),
        maxWidth: "64rem",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        color: "#27272a",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5em",
          padding: "2em 2em 1.5em",
        }}
      >
        {imageSrc && (
          <div style={{ flexShrink: 0 }}>
            <img
              src={imageSrc}
              alt="Profile"
              style={{
                width: "5.5em",
                height: "5.5em",
                borderRadius: "9999px",
                objectFit: "cover",
                background: accent + "30",
              }}
            />
          </div>
        )}
        <div>
          <h1
            style={{
              fontSize: "2em",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#18181b",
              marginBottom: "0.1em",
            }}
          >
            {data.personal_info?.full_name || "Your Name"}
          </h1>
          <p
            style={{
              fontSize: "0.8em",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#71717a",
              fontWeight: 500,
            }}
          >
            {data.personal_info?.profession || ""}
          </p>
        </div>
      </header>

      {/* ── Body: sidebar + main ──────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>

        {/* Sidebar — Contact always first, then Education/Skills in sectionOrder */}
        <aside style={{ borderRight: "1px solid #e4e4e7", padding: "0 1.5em 2em" }}>

          {/* Contact is always pinned at the top of sidebar */}
          <section style={sectionStyle}>
            <span style={sidebarHeadingStyle}>Contact</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5em", fontSize: "0.88em" }}>
              {data.personal_info?.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
                  <Phone size="1em" style={{ color: accent, flexShrink: 0 }} />
                  <span>{data.personal_info.phone}</span>
                </div>
              )}
              {data.personal_info?.email && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
                  <Mail size="1em" style={{ color: accent, flexShrink: 0 }} />
                  <span style={{ wordBreak: "break-all" }}>{data.personal_info.email}</span>
                </div>
              )}
              {data.personal_info?.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
                  <MapPin size="1em" style={{ color: accent, flexShrink: 0 }} />
                  <span>{data.personal_info.location}</span>
                </div>
              )}
            </div>
          </section>

          {/* Education + Skills in sectionOrder sequence */}
          {orderedSidebarKeys.map((key) => {
            const content = sidebarRenderers[key]?.();
            return content ? (
              <React.Fragment key={key}>{content}</React.Fragment>
            ) : null;
          })}
        </aside>

        {/* Main — Summary, Experience, Projects, custom in sectionOrder sequence */}
        <main style={{ padding: "0 2em 2em" }}>
          {orderedMainKeys.map((key) => {
            let content = null;
            if (mainRenderers[key]) {
              content = mainRenderers[key]();
            } else if (customIds.includes(key)) {
              content = renderCustomSection(key);
            }
            return content ? (
              <React.Fragment key={key}>{content}</React.Fragment>
            ) : null;
          })}
        </main>
      </div>
    </div>
  );
};

export default MinimalImageTemplate;
