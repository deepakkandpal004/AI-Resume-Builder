import { Mail, Phone, MapPin } from "lucide-react";
import { getContainerStyle } from "../../utils/templateHelpers";
import { DEFAULT_SECTION_HEADINGS } from "../SectionManager";

const MinimalImageTemplate = ({ data, accentColor, styleOptions = {} }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
        });
    };

    // Resolve section heading: use custom value if set, otherwise fall back to default
    const heading = (key) =>
        (data.section_headings?.[key]?.trim() || DEFAULT_SECTION_HEADINGS[key]);

    // Resolve profile image src — handle both URL strings and File objects
    const resolveImageSrc = () => {
        const image = data.personal_info?.image;
        if (!image) return null;
        if (typeof image === "string") return image;
        if (typeof image === "object") {
            try {
                return URL.createObjectURL(image);
            } catch {
                return null;
            }
        }
        return null;
    };

    const imageSrc = resolveImageSrc();

    return (
        <div
            style={getContainerStyle(styleOptions)}
            className="max-w-5xl mx-auto bg-white text-zinc-800"
        >
            {/* === Header: flex row — image + name side by side === */}
            <header className="flex items-center gap-6 px-8 py-8">
                {imageSrc ? (
                    <div className="shrink-0">
                        <img
                            src={imageSrc}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                            style={{ background: accentColor + "70" }}
                        />
                    </div>
                ) : null}
                <div>
                    <h1 className="font-resume text-4xl font-bold tracking-tight text-zinc-800">
                        {data.personal_info?.full_name || "Your Name"}
                    </h1>
                    <p className="uppercase text-zinc-600 font-medium text-sm tracking-widest">
                        {data?.personal_info?.profession || "Profession"}
                    </p>
                </div>
            </header>

            {/* === Body: two-column grid — sidebar + main === */}
            <div className="grid grid-cols-3">

                {/* Left Sidebar */}
                <aside className="col-span-1 border-r border-zinc-300 px-6 pt-6 pb-8">

                    {/* Contact */}
                    <section className="mb-8">
                        <h2 className="text-sm font-semibold tracking-widest text-zinc-600 mb-3">
                            CONTACT
                        </h2>
                        <div className="space-y-2 text-sm">
                            {data.personal_info?.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={14} style={{ color: accentColor }} />
                                    <span>{data.personal_info.phone}</span>
                                </div>
                            )}
                            {data.personal_info?.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={14} style={{ color: accentColor }} />
                                    <span>{data.personal_info.email}</span>
                                </div>
                            )}
                            {data.personal_info?.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} style={{ color: accentColor }} />
                                    <span>{data.personal_info.location}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Education */}
                    {data.education && data.education.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-sm font-semibold tracking-widest text-zinc-600 mb-3">
                                {heading("education").toUpperCase()}
                            </h2>
                            <div className="space-y-4 text-sm">
                                {data.education.map((edu, index) => (
                                    <div key={index}>
                                        <p className="font-semibold uppercase">{edu.degree}</p>
                                        <p className="text-zinc-600">{edu.institution}</p>
                                        <p className="text-xs text-zinc-500">
                                            {formatDate(edu.graduation_date)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills */}
                    {data.skills && data.skills.length > 0 && (
                        <section>
                            <h2 className="text-sm font-semibold tracking-widest text-zinc-600 mb-3">
                                {heading("skills").toUpperCase()}
                            </h2>
                            <ul className="space-y-1 text-sm">
                                {data.skills.map((skill, index) => (
                                    <li key={index}>{skill}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </aside>

                {/* Right Main Content */}
                <main className="col-span-2 px-8 pt-6 pb-8">

                    {/* Summary */}
                    {data.professional_summary && (
                        <section className="mb-8">
                            <h2
                                className="text-sm font-semibold tracking-widest mb-3"
                                style={{ color: accentColor }}
                            >
                                {heading("summary").toUpperCase()}
                            </h2>
                            <p className="text-zinc-700 leading-relaxed">
                                {data.professional_summary}
                            </p>
                        </section>
                    )}

                    {/* Experience */}
                    {data.experience && data.experience.length > 0 && (
                        <section className="mb-8">
                            <h2
                                className="text-sm font-semibold tracking-widest mb-4"
                                style={{ color: accentColor }}
                            >
                                {heading("experience").toUpperCase()}
                            </h2>
                            <div className="space-y-6">
                                {data.experience.map((exp, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-zinc-900">
                                                {exp.position}
                                            </h3>
                                            <span className="text-xs text-zinc-500">
                                                {formatDate(exp.start_date)} –{" "}
                                                {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                            </span>
                                        </div>
                                        <p className="text-sm mb-2" style={{ color: accentColor }}>
                                            {exp.company}
                                        </p>
                                        {exp.description && (
                                            <ul className="list-disc list-inside text-sm text-zinc-700 leading-relaxed space-y-1">
                                                {exp.description.split("\n").map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {data.project && data.project.length > 0 && (
                        <section className="mb-8">
                            <h2
                                className="text-sm uppercase tracking-widest font-semibold"
                                style={{ color: accentColor }}
                            >
                                {heading("projects").toUpperCase()}
                            </h2>
                            <div className="space-y-4 mt-3">
                                {data.project.map((project, index) => (
                                    <div key={index}>
                                        <h3 className="text-md font-medium text-zinc-800">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm mb-1" style={{ color: accentColor }}>
                                            {project.type}
                                        </p>
                                        {project.description && (
                                            <ul className="list-disc list-inside text-sm text-zinc-700 space-y-1">
                                                {project.description.split("\n").map((line, i) => (
                                                    <li key={i}>{line}</li>
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
                            <div key={section.id} className="mb-6">
                                <h2
                                    className="text-sm font-semibold tracking-widest mb-3"
                                    style={{ color: accentColor }}
                                >
                                    {(section.heading || "Untitled").toUpperCase()}
                                </h2>
                                <div className="whitespace-pre-line text-sm text-zinc-700">
                                    {section.content}
                                </div>
                            </div>
                        ) : null
                    )}
                </main>
            </div>
        </div>
    );
};

export default MinimalImageTemplate;
