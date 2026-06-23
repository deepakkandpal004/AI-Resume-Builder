import { buildSectionOrder, getContainerStyle } from "../../utils/templateHelpers";
import { DEFAULT_SECTION_HEADINGS } from "../SectionManager";

const MinimalTemplate = ({ data, accentColor, styleOptions = {} }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short"
        });
    };

    // Resolve section heading with fallback to default
    const heading = (key) =>
        data.section_headings?.[key]?.trim() || DEFAULT_SECTION_HEADINGS[key];

    // Resolve the full ordered list of sections to render
    const sectionOrder = buildSectionOrder(styleOptions, data.custom_sections);

    // Map of section key → render function
    const sectionRenderers = {
        summary: () =>
            data.professional_summary ? (
                <section key="summary" className="mb-10">
                    <h2
                        className="text-sm uppercase tracking-widest mb-4 font-medium"
                        style={{ color: accentColor }}
                    >
                        {heading("summary")}
                    </h2>
                    <p className="text-gray-700">{data.professional_summary}</p>
                </section>
            ) : null,

        experience: () =>
            data.experience && data.experience.length > 0 ? (
                <section key="experience" className="mb-10">
                    <h2
                        className="text-sm uppercase tracking-widest mb-6 font-medium"
                        style={{ color: accentColor }}
                    >
                        {heading("experience")}
                    </h2>
                    <div className="space-y-6">
                        {data.experience.map((exp, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-lg font-medium">{exp.position}</h3>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(exp.start_date)} -{" "}
                                        {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-2">{exp.company}</p>
                                {exp.description && (
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {exp.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null,

        projects: () =>
            data.project && data.project.length > 0 ? (
                <section key="projects" className="mb-10">
                    <h2
                        className="text-sm uppercase tracking-widest mb-6 font-medium"
                        style={{ color: accentColor }}
                    >
                        {heading("projects")}
                    </h2>
                    <div className="space-y-4">
                        {data.project.map((proj, index) => (
                            <div
                                key={index}
                                className="flex flex-col gap-2 justify-between items-baseline"
                            >
                                <h3 className="text-lg font-medium">{proj.name}</h3>
                                <p className="text-gray-600">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null,

        education: () =>
            data.education && data.education.length > 0 ? (
                <section key="education" className="mb-10">
                    <h2
                        className="text-sm uppercase tracking-widest mb-6 font-medium"
                        style={{ color: accentColor }}
                    >
                        {heading("education")}
                    </h2>
                    <div className="space-y-4">
                        {data.education.map((edu, index) => (
                            <div key={index} className="flex justify-between items-baseline">
                                <div>
                                    <h3 className="font-medium">
                                        {edu.degree} {edu.field && `in ${edu.field}`}
                                    </h3>
                                    <p className="text-gray-600">{edu.institution}</p>
                                    {edu.gpa && (
                                        <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>
                                    )}
                                </div>
                                <span className="text-sm text-gray-500">
                                    {formatDate(edu.graduation_date)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null,

        skills: () =>
            data.skills && data.skills.length > 0 ? (
                <section key="skills" className="mb-10">
                    <h2
                        className="text-sm uppercase tracking-widest mb-6 font-medium"
                        style={{ color: accentColor }}
                    >
                        {heading("skills")}
                    </h2>
                    <div className="text-gray-700">{data.skills.join(" • ")}</div>
                </section>
            ) : null,
    };

    // Render a custom section by its id
    const renderCustomSection = (id) => {
        const section = (data.custom_sections || []).find((s) => s.id === id);
        if (!section) return null;
        if (!section.heading?.trim() && !section.content?.trim()) return null;
        return (
            <section key={section.id} className="mb-10">
                <h2
                    className="text-sm uppercase tracking-widest mb-4 font-medium"
                    style={{ color: accentColor }}
                >
                    {section.heading || "Untitled"}
                </h2>
                <div className="whitespace-pre-line text-gray-700">{section.content}</div>
            </section>
        );
    };

    // Ids of built-in sections so we can distinguish them from custom section ids
    const builtInKeys = new Set(["summary", "experience", "education", "projects", "skills"]);

    return (
        <div
            className="max-w-4xl mx-auto p-8 bg-white text-gray-900 font-light"
            style={getContainerStyle(styleOptions)}
        >
            {/* Header */}
            <header className="mb-10">
                <h1 className="font-resume text-4xl font-semibold mb-4 tracking-tight">
                    {data.personal_info?.full_name || "Your Name"}
                </h1>
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    {data.personal_info?.email && (
                        <span>{data.personal_info.email}</span>
                    )}
                    {data.personal_info?.phone && (
                        <span>{data.personal_info.phone}</span>
                    )}
                    {data.personal_info?.location && (
                        <span>{data.personal_info.location}</span>
                    )}
                    {data.personal_info?.linkedin && (
                        <span className="break-all">{data.personal_info.linkedin}</span>
                    )}
                    {data.personal_info?.website && (
                        <span className="break-all">{data.personal_info.website}</span>
                    )}
                </div>
            </header>

            {/* Sections rendered in resolved order */}
            {sectionOrder.map((key) => {
                if (builtInKeys.has(key)) {
                    return sectionRenderers[key]?.() ?? null;
                }
                return renderCustomSection(key);
            })}
        </div>
    );
};

export default MinimalTemplate;
