import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import { getContainerStyle, buildSectionOrder } from "../../utils/templateHelpers";
import { DEFAULT_SECTION_HEADINGS } from "../SectionManager";

const ModernTemplate = ({ data, accentColor, styleOptions = {} }) => {
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

  const hasEducation = (data.education?.length ?? 0) > 0;
  const hasSkills = (data.skills?.length ?? 0) > 0;

  const sectionOrder = buildSectionOrder(styleOptions, data.custom_sections);
  const builtInKeys = new Set(["summary", "experience", "education", "projects", "skills"]);

  // Track if education+skills block has been rendered (they share one block)
  let educationSkillsDone = false;

  // ── Shared heading style ────────────────────────────────────────────────────
  const sectionHeadingStyle = {
    fontSize: "1.05em",
    fontWeight: 600,
    marginBottom: "0.75em",
    paddingBottom: "0.4em",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
  };

  const sectionStyle = { marginBottom: "2em" };

  // ── Section renderers ───────────────────────────────────────────────────────

  const renderSummary = () =>
    data.professional_summary ? (
      <section key="summary" style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("summary")}</h2>
        <p style={{ color: "#374151" }}>{data.professional_summary}</p>
      </section>
    ) : null;

  const renderExperience = () =>
    data.experience?.length > 0 ? (
      <section key="experience" style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("experience")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25em" }}>
          {data.experience.map((exp, i) => (
            <div
              key={i}
              style={{
                paddingLeft: "1em",
                borderLeft: `2px solid #e5e7eb`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.2em" }}>
                <div>
                  <div style={{ fontSize: "1.05em", fontWeight: 500, color: "#111827" }}>{exp.position}</div>
                  <div style={{ fontWeight: 500, color: accent }}>{exp.company}</div>
                </div>
                <div
                  style={{
                    fontSize: "0.8em",
                    color: "#6b7280",
                    backgroundColor: "#f3f4f6",
                    padding: "0.2em 0.6em",
                    borderRadius: "0.3em",
                    flexShrink: 0,
                    marginLeft: "1em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.end_date)}
                </div>
              </div>
              {exp.description && (
                <div style={{ color: "#374151", whiteSpace: "pre-line", marginTop: "0.5em" }}>
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
      <section key="projects" style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>{heading("projects")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
          {data.project.map((p, i) => (
            <div
              key={i}
              style={{ paddingLeft: "1em", borderLeft: `2px solid ${accent}` }}
            >
              <div style={{ fontSize: "1.05em", fontWeight: 500, color: "#111827" }}>{p.name}</div>
              {p.description && (
                <div style={{ color: "#374151", marginTop: "0.3em" }}>{p.description}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  // Education and Skills are rendered together as one block
  const renderEducationSkills = () => {
    if (!hasEducation && !hasSkills) return null;
    return (
      <section key="education-skills" style={sectionStyle}>
        <div
          style={
            hasEducation && hasSkills
              ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2em" }
              : {}
          }
        >
          {hasEducation && (
            <div>
              <h2 style={sectionHeadingStyle}>{heading("education")}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}>
                {data.education.map((edu, i) => (
                  <div key={i}>
                    <div style={{ fontWeight: 600, color: "#111827" }}>
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                    </div>
                    <div style={{ color: accent }}>{edu.institution}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85em", color: "#6b7280" }}>
                      <span>{formatDate(edu.graduation_date)}</span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {hasSkills && (
            <div>
              <h2 style={sectionHeadingStyle}>{heading("skills")}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4em" }}>
                {data.skills.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "0.2em 0.75em",
                      fontSize: "0.85em",
                      color: "#ffffff",
                      borderRadius: "9999px",
                      backgroundColor: accent,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderCustomSection = (id) => {
    const section = (data.custom_sections || []).find((s) => s.id === id);
    if (!section || (!section.heading?.trim() && !section.content?.trim())) return null;
    return (
      <section key={section.id} style={sectionStyle}>
        <h2 style={{ ...sectionHeadingStyle, color: accent }}>
          {section.heading || "Untitled"}
        </h2>
        <div style={{ color: "#374151", whiteSpace: "pre-line" }}>{section.content}</div>
      </section>
    );
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
      {/* Header */}
      <header style={{ padding: "2em", color: "#ffffff", backgroundColor: accent }}>
        <h1 style={{ fontSize: "2em", fontWeight: 600, marginBottom: "0.5em", letterSpacing: "-0.02em" }}>
          {data.personal_info?.full_name || "Your Name"}
        </h1>
        {data.personal_info?.profession && (
          <p style={{ marginBottom: "0.6em", opacity: 0.9, fontSize: "0.95em" }}>
            {data.personal_info.profession}
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3em 1.5em", fontSize: "0.85em" }}>
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
            <a
              href={data.personal_info.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "0.4em", color: "inherit" }}
            >
              <Linkedin size="1em" />
              <span style={{ fontSize: "0.9em" }}>
                {data.personal_info.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
              </span>
            </a>
          )}
          {data.personal_info?.website && (
            <a
              href={data.personal_info.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "0.4em", color: "inherit" }}
            >
              <Globe size="1em" />
              <span style={{ fontSize: "0.9em" }}>
                {data.personal_info.website.replace(/^https?:\/\//, "")}
              </span>
            </a>
          )}
        </div>
      </header>

      {/* Body */}
      <div style={{ padding: "2em" }}>
        {sectionOrder.map((key) => {
          if (!builtInKeys.has(key)) {
            // Custom section
            return renderCustomSection(key);
          }
          if (key === "education" || key === "skills") {
            if (!educationSkillsDone) {
              educationSkillsDone = true;
              return renderEducationSkills();
            }
            return null;
          }
          if (key === "summary") return renderSummary();
          if (key === "experience") return renderExperience();
          if (key === "projects") return renderProjects();
          return null;
        })}
      </div>
    </div>
  );
};

export default ModernTemplate;
