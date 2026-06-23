import { Mail, Phone, MapPin } from "lucide-react";
import { getContainerStyle } from "../../utils/templateHelpers";
import { DEFAULT_SECTION_HEADINGS } from "../SectionManager";

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

  // ── Shared sidebar section heading style ───────────────────────────────────
  const sidebarHeading = {
    fontSize: "0.7em",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#52525b",
    marginBottom: "0.75em",
    display: "block",
  };

  // ── Main section heading style ─────────────────────────────────────────────
  const mainHeading = {
    fontSize: "0.7em",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: accent,
    marginBottom: "0.75em",
    display: "block",
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
      {/* ── Header ────────────────────────────────────────────────────────── */}
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

        {/* Sidebar */}
        <aside
          style={{
            borderRight: "1px solid #e4e4e7",
            padding: "0 1.5em 2em",
          }}
        >
          {/* Contact */}
          <section style={{ marginBottom: "1.75em" }}>
            <span style={sidebarHeading}>Contact</span>
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

          {/* Education */}
          {data.education?.length > 0 && (
            <section style={{ marginBottom: "1.75em" }}>
              <span style={sidebarHeading}>{heading("education").toUpperCase()}</span>
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
          )}

          {/* Skills */}
          {data.skills?.length > 0 && (
            <section>
              <span style={sidebarHeading}>{heading("skills").toUpperCase()}</span>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.35em", fontSize: "0.88em", listStyle: "none", padding: 0, margin: 0 }}>
                {data.skills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Main content */}
        <main style={{ padding: "0 2em 2em" }}>

          {/* Summary */}
          {data.professional_summary && (
            <section style={{ marginBottom: "1.75em" }}>
              <span style={mainHeading}>{heading("summary").toUpperCase()}</span>
              <p style={{ color: "#3f3f46" }}>{data.professional_summary}</p>
            </section>
          )}

          {/* Experience */}
          {data.experience?.length > 0 && (
            <section style={{ marginBottom: "1.75em" }}>
              <span style={mainHeading}>{heading("experience").toUpperCase()}</span>
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
          )}

          {/* Projects */}
          {data.project?.length > 0 && (
            <section style={{ marginBottom: "1.75em" }}>
              <span style={mainHeading}>{heading("projects").toUpperCase()}</span>
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
          )}

          {/* Custom Sections */}
          {(data.custom_sections || []).map((section) =>
            section.heading?.trim() || section.content?.trim() ? (
              <section key={section.id} style={{ marginBottom: "1.75em" }}>
                <span style={mainHeading}>
                  {(section.heading || "Untitled").toUpperCase()}
                </span>
                <div style={{ fontSize: "0.88em", color: "#3f3f46", whiteSpace: "pre-line" }}>
                  {section.content}
                </div>
              </section>
            ) : null
          )}
        </main>
      </div>
    </div>
  );
};

export default MinimalImageTemplate;
