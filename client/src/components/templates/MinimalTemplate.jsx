import { buildSectionOrder, getContainerStyle } from "../../utils/templateHelpers";
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
  const builtInKeys = new Set(["summary", "experience", "education", "projects", "skills"]);

  // ── Shared styles ─────────────────────────────────────────────────────────
  const labelStyle = {
    fontSize: "0.7em",
    fontWeight: 500,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: accent,
    marginBottom: "1em",
    display: "block",
  };

  const sectionStyle = { marginBottom: "2.25em" };

  // ── Section renderers ─────────────────────────────────────────────────────

  const renderSummary = () =>
    data.professional_summary ? (
      <section key="summary" style={sectionStyle}>
        <span style={labelStyle}>{heading("summary")}</span>
        <p style={{ color: "#374151" }}>{data.professional_summary}</p>
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
                <div style={{ color: "#374151", whiteSpace: "pre-line" }}>{exp.description}</div>
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
              {proj.description && (
                <p style={{ color: "#6b7280", marginTop: "0.15em" }}>{proj.description}</p>
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
        <p style={{ color: "#374151" }}>{data.skills.join(" • ")}</p>
      </section>
    ) : null;

  const renderCustomSection = (id) => {
    const section = (data.custom_sections || []).find((s) => s.id === id);
    if (!section || (!section.heading?.trim() && !section.content?.trim())) return null;
    return (
      <section key={section.id} style={sectionStyle}>
        <span style={labelStyle}>{section.heading || "Untitled"}</span>
        <div style={{ color: "#374151", whiteSpace: "pre-line" }}>{section.content}</div>
      </section>
    );
  };

  const sectionRenderers = {
    summary: renderSummary,
    experience: renderExperience,
    projects: renderProjects,
    education: renderEducation,
    skills: renderSkills,
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2em 1.5em", fontSize: "0.88em", color: "#6b7280" }}>
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
        if (builtInKeys.has(key)) return sectionRenderers[key]?.() ?? null;
        return renderCustomSection(key);
      })}
    </div>
  );
};

export default MinimalTemplate;
