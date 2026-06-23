import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import { DEFAULT_SECTION_HEADINGS } from "../SectionManager";
import { getContainerStyle, buildSectionOrder } from "../../utils/templateHelpers";

const ClassicTemplate = ({ data, accentColor, styleOptions = {} }) => {
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
  const customSectionIds = new Set((data.custom_sections || []).map((s) => s.id));

  // ── Section renderers ──────────────────────────────────────────────────────

  const renderSummary = () =>
    data.professional_summary ? (
      <section key="summary" style={{ marginBottom: "1.5em" }}>
        <h2
          style={{
            color: accent,
            fontSize: "0.8em",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75em",
            paddingBottom: "0.25em",
            borderBottom: `1px solid #e5e7eb`,
          }}
        >
          {heading("summary")}
        </h2>
        <p style={{ color: "#374151" }}>{data.professional_summary}</p>
      </section>
    ) : null;

  const renderExperience = () =>
    data.experience?.length > 0 ? (
      <section key="experience" style={{ marginBottom: "1.5em" }}>
        <h2
          style={{
            color: accent,
            fontSize: "0.8em",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75em",
            paddingBottom: "0.25em",
            borderBottom: `1px solid #e5e7eb`,
          }}
        >
          {heading("experience")}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
          {data.experience.map((exp, i) => (
            <div
              key={i}
              style={{
                paddingLeft: "0.9em",
                borderLeft: `3px solid ${accent}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25em" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#111827" }}>{exp.position}</div>
                  <div style={{ color: "#374151" }}>{exp.company}</div>
                </div>
                <div style={{ fontSize: "0.85em", color: "#6b7280", textAlign: "right", flexShrink: 0, marginLeft: "1em" }}>
                  {formatDate(exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.end_date)}
                </div>
              </div>
              {exp.description && (
                <div style={{ color: "#374151", whiteSpace: "pre-line", marginTop: "0.4em" }}>
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
      <section key="education" style={{ marginBottom: "1.5em" }}>
        <h2
          style={{
            color: accent,
            fontSize: "0.8em",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75em",
            paddingBottom: "0.25em",
            borderBottom: `1px solid #e5e7eb`,
          }}
        >
          {heading("education")}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}>
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600, color: "#111827" }}>
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                </div>
                <div style={{ color: "#374151" }}>{edu.institution}</div>
                {edu.gpa && <div style={{ fontSize: "0.85em", color: "#6b7280" }}>GPA: {edu.gpa}</div>}
              </div>
              <div style={{ fontSize: "0.85em", color: "#6b7280", flexShrink: 0, marginLeft: "1em" }}>
                {formatDate(edu.graduation_date)}
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderProjects = () =>
    data.project?.length > 0 ? (
      <section key="projects" style={{ marginBottom: "1.5em" }}>
        <h2
          style={{
            color: accent,
            fontSize: "0.8em",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75em",
            paddingBottom: "0.25em",
            borderBottom: `1px solid #e5e7eb`,
          }}
        >
          {heading("projects")}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}>
          {data.project.map((proj, i) => (
            <div
              key={i}
              style={{ paddingLeft: "0.9em", borderLeft: `3px solid ${accent}` }}
            >
              <div style={{ fontWeight: 600, color: "#111827" }}>{proj.name}</div>
              {proj.description && (
                <div style={{ color: "#4b5563", marginTop: "0.25em" }}>{proj.description}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderSkills = () =>
    data.skills?.length > 0 ? (
      <section key="skills" style={{ marginBottom: "1.5em" }}>
        <h2
          style={{
            color: accent,
            fontSize: "0.8em",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75em",
            paddingBottom: "0.25em",
            borderBottom: `1px solid #e5e7eb`,
          }}
        >
          {heading("skills")}
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5em 1.25em" }}>
          {data.skills.map((skill, i) => (
            <span key={i} style={{ color: "#374151" }}>• {skill}</span>
          ))}
        </div>
      </section>
    ) : null;

  const renderCustomSection = (id) => {
    const section = (data.custom_sections || []).find((s) => s.id === id);
    if (!section || (!section.heading?.trim() && !section.content?.trim())) return null;
    return (
      <section key={section.id} style={{ marginBottom: "1.5em" }}>
        <h2
          style={{
            color: accent,
            fontSize: "0.8em",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75em",
            paddingBottom: "0.25em",
            borderBottom: `1px solid #e5e7eb`,
          }}
        >
          {section.heading || "Untitled"}
        </h2>
        <div style={{ whiteSpace: "pre-line", color: "#374151" }}>{section.content}</div>
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
        padding: "2.5em",
        backgroundColor: "#ffffff",
        color: "#1f2937",
      }}
    >
      {/* Header */}
      <header
        style={{
          textAlign: "center",
          marginBottom: "2em",
          paddingBottom: "1.25em",
          borderBottom: `2px solid ${accent}`,
        }}
      >
        <h1
          style={{
            fontSize: "2em",
            fontWeight: 700,
            color: accent,
            marginBottom: "0.25em",
            letterSpacing: "-0.02em",
          }}
        >
          {data.personal_info?.full_name || "Your Name"}
        </h1>
        {data.personal_info?.profession && (
          <p style={{ color: "#6b7280", marginBottom: "0.5em", fontSize: "0.95em" }}>
            {data.personal_info.profession}
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.25em 1em", fontSize: "0.85em", color: "#6b7280" }}>
          {data.personal_info?.email && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
              <Mail size="1em" /> {data.personal_info.email}
            </span>
          )}
          {data.personal_info?.phone && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
              <Phone size="1em" /> {data.personal_info.phone}
            </span>
          )}
          {data.personal_info?.location && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
              <MapPin size="1em" /> {data.personal_info.location}
            </span>
          )}
          {data.personal_info?.linkedin && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
              <Linkedin size="1em" /> {data.personal_info.linkedin}
            </span>
          )}
          {data.personal_info?.website && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
              <Globe size="1em" /> {data.personal_info.website}
            </span>
          )}
        </div>
      </header>

      {/* Sections in resolved order */}
      {sectionOrder.map((key) => {
        if (builtInKeys.has(key)) return sectionRenderers[key]?.() ?? null;
        if (customSectionIds.has(key)) return renderCustomSection(key);
        return null;
      })}
    </div>
  );
};

export default ClassicTemplate;
