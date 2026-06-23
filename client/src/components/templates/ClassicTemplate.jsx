import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import { DEFAULT_SECTION_HEADINGS } from "../SectionManager";
import { getContainerStyle, buildSectionOrder } from "../../utils/templateHelpers";

const ClassicTemplate = ({ data, accentColor, styleOptions = {} }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short"
        });
    };

    // Resolve section heading: use custom heading if set and non-empty, else fall back to default
    const heading = (key) =>
        (data.section_headings?.[key]?.trim() || DEFAULT_SECTION_HEADINGS[key]);

    // Build the ordered list of sections to render
    const sectionOrder = buildSectionOrder(styleOptions, data.custom_sections);

    // Render a single built-in section by key
    const renderBuiltInSection = (key) => {
        switch (key) {
            case "summary":
                return data.professional_summary ? (
                    <section key="summary" className="mb-6">
                        <h2 className="font-resume text-lg font-semibold tracking-wide mb-3 uppercase" style={{ color: accentColor }}>
                            {heading("summary")}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">{data.professional_summary}</p>
                    </section>
                ) : null;

            case "experience":
                return data.experience && data.experience.length > 0 ? (
                    <section key="experience" className="mb-6">
                        <h2 className="font-resume text-lg font-semibold tracking-wide mb-4 uppercase" style={{ color: accentColor }}>
                            {heading("experience")}
                        </h2>
                        <div className="space-y-4">
                            {data.experience.map((exp, index) => (
                                <div
                                    key={index}
                                    className="pl-4"
                                    style={{ borderLeft: `4px solid ${accentColor || "#4F46E5"}` }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                                            <p className="text-gray-700 font-medium">{exp.company}</p>
                                        </div>
                                        <div className="text-right text-sm text-gray-600">
                                            <p>{formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}</p>
                                        </div>
                                    </div>
                                    {exp.description && (
                                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {exp.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;

            case "projects":
                return data.project && data.project.length > 0 ? (
                    <section key="projects" className="mb-6">
                        <h2 className="font-resume text-lg font-semibold tracking-wide mb-4 uppercase" style={{ color: accentColor }}>
                            {heading("projects")}
                        </h2>
                        <ul className="space-y-3">
                            {data.project.map((proj, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-start pl-4"
                                    style={{ borderLeft: `4px solid ${accentColor || "#4F46E5"}` }}
                                >
                                    <div>
                                        <li className="font-semibold text-gray-800">{proj.name}</li>
                                        <p className="text-gray-600">{proj.description}</p>
                                    </div>
                                </div>
                            ))}
                        </ul>
                    </section>
                ) : null;

            case "education":
                return data.education && data.education.length > 0 ? (
                    <section key="education" className="mb-6">
                        <h2 className="font-resume text-lg font-semibold tracking-wide mb-4 uppercase" style={{ color: accentColor }}>
                            {heading("education")}
                        </h2>
                        <div className="space-y-3">
                            {data.education.map((edu, index) => (
                                <div key={index} className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {edu.degree} {edu.field && `in ${edu.field}`}
                                        </h3>
                                        <p className="text-gray-700">{edu.institution}</p>
                                        {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p>{formatDate(edu.graduation_date)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;

            case "skills":
                return data.skills && data.skills.length > 0 ? (
                    <section key="skills" className="mb-6">
                        <h2 className="font-resume text-lg font-semibold tracking-wide mb-4 uppercase" style={{ color: accentColor }}>
                            {heading("skills")}
                        </h2>
                        <div className="flex gap-x-5 gap-y-2 flex-wrap">
                            {data.skills.map((skill, index) => (
                                <div key={index} className="text-gray-700">
                                    • {skill}
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;

            default:
                return null;
        }
    };

    // Render custom sections by id
    const renderCustomSection = (id) => {
        const section = (data.custom_sections || []).find((s) => s.id === id);
        if (!section) return null;
        if (!section.heading.trim() && !section.content.trim()) return null;
        return (
            <section key={section.id} className="mb-6">
                <h2 className="font-resume text-lg font-semibold tracking-wide mb-3 uppercase" style={{ color: accentColor }}>
                    {section.heading || "Untitled"}
                </h2>
                <div className="whitespace-pre-line text-gray-700">{section.content}</div>
            </section>
        );
    };

    const builtInKeys = new Set(["summary", "experience", "education", "projects", "skills"]);
    const customSectionIds = new Set((data.custom_sections || []).map((s) => s.id));

    return (
        <div
            className="max-w-4xl mx-auto p-10 bg-white text-gray-800 leading-relaxed"
            style={getContainerStyle(styleOptions)}
        >
            {/* Header */}
            <header className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: accentColor }}>
                <h1 className="font-resume text-4xl font-bold mb-2 tracking-tight" style={{ color: accentColor }}>
                    {data.personal_info?.full_name || "Your Name"}
                </h1>

                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                    {data.personal_info?.email && (
                        <div className="flex items-center gap-1">
                            <Mail className="size-4" />
                            <span>{data.personal_info.email}</span>
                        </div>
                    )}
                    {data.personal_info?.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="size-4" />
                            <span>{data.personal_info.phone}</span>
                        </div>
                    )}
                    {data.personal_info?.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="size-4" />
                            <span>{data.personal_info.location}</span>
                        </div>
                    )}
                    {data.personal_info?.linkedin && (
                        <div className="flex items-center gap-1">
                            <Linkedin className="size-4" />
                            <span className="break-all">{data.personal_info.linkedin}</span>
                        </div>
                    )}
                    {data.personal_info?.website && (
                        <div className="flex items-center gap-1">
                            <Globe className="size-4" />
                            <span className="break-all">{data.personal_info.website}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Sections rendered in the resolved order */}
            {sectionOrder.map((key) => {
                if (builtInKeys.has(key)) {
                    return renderBuiltInSection(key);
                }
                if (customSectionIds.has(key)) {
                    return renderCustomSection(key);
                }
                return null;
            })}

            {/* Custom sections not yet in sectionOrder (fallback) */}
            {(data.custom_sections || [])
                .filter((s) => !sectionOrder.includes(s.id))
                .map((section) =>
                    section.heading.trim() || section.content.trim() ? (
                        <section key={section.id} className="mb-6">
                            <h2 className="font-resume text-lg font-semibold tracking-wide mb-3 uppercase" style={{ color: accentColor }}>
                                {section.heading || "Untitled"}
                            </h2>
                            <div className="whitespace-pre-line text-gray-700">{section.content}</div>
                        </section>
                    ) : null
                )}
        </div>
    );
};

export default ClassicTemplate;
