import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import { getContainerStyle, buildSectionOrder } from "../../utils/templateHelpers";
import { DEFAULT_SECTION_HEADINGS } from "../SectionManager";

const ModernTemplate = ({ data, accentColor, styleOptions = {} }) => {
	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		const [year, month] = dateStr.split("-");
		return new Date(year, month - 1).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short"
		});
	};

	const heading = (key) =>
		(data.section_headings?.[key]?.trim() || DEFAULT_SECTION_HEADINGS[key]);

	const hasEducation = data.education?.length > 0;
	const hasSkills = data.skills?.length > 0;

	const sectionOrder = buildSectionOrder(styleOptions, data.custom_sections);

	const SummarySection = () =>
		data.professional_summary ? (
			<section className="mb-8">
				<h2 className="font-resume text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
					{heading("summary")}
				</h2>
				<p className="text-gray-700">{data.professional_summary}</p>
			</section>
		) : null;

	const ExperienceSection = () =>
		data.experience && data.experience.length > 0 ? (
			<section className="mb-8">
				<h2 className="font-resume text-xl font-semibold mb-6 pb-2 border-b border-gray-200">
					{heading("experience")}
				</h2>
				<div className="space-y-6">
					{data.experience.map((exp, index) => (
						<div key={index} className="relative pl-6 border-l border-gray-200">
							<div className="flex justify-between items-start mb-2">
								<div>
									<h3 className="text-xl font-medium text-gray-900">{exp.position}</h3>
									<p className="font-medium" style={{ color: accentColor }}>{exp.company}</p>
								</div>
								<div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
									{formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
								</div>
							</div>
							{exp.description && (
								<div className="text-gray-700 leading-relaxed mt-3 whitespace-pre-line">
									{exp.description}
								</div>
							)}
						</div>
					))}
				</div>
			</section>
		) : null;

	const ProjectsSection = () =>
		data.project && data.project.length > 0 ? (
			<section className="mb-8">
				<h2 className="font-resume text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
					{heading("projects")}
				</h2>
				<div className="space-y-6">
					{data.project.map((p, index) => (
						<div
							key={index}
							className="relative pl-6 border-l border-gray-200"
							style={{ borderLeftColor: accentColor }}
						>
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-lg font-medium text-gray-900">{p.name}</h3>
								</div>
							</div>
							{p.description && (
								<div className="text-gray-700 leading-relaxed text-sm mt-3">
									{p.description}
								</div>
							)}
						</div>
					))}
				</div>
			</section>
		) : null;

	const EducationSkillsSection = () =>
		(hasEducation || hasSkills) ? (
			<section className="mb-8">
				<div className={hasEducation && hasSkills ? "grid sm:grid-cols-2 gap-8" : ""}>
					{hasEducation && (
						<div>
							<h2 className="font-resume text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
								{heading("education")}
							</h2>
							<div className="space-y-4">
								{data.education.map((edu, index) => (
									<div key={index}>
										<h3 className="font-semibold text-gray-900">
											{edu.degree} {edu.field && `in ${edu.field}`}
										</h3>
										<p style={{ color: accentColor }}>{edu.institution}</p>
										<div className="flex justify-between items-center text-sm text-gray-600">
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
							<h2 className="font-resume text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
								{heading("skills")}
							</h2>
							<div className="flex flex-wrap gap-2">
								{data.skills.map((skill, index) => (
									<span
										key={index}
										className="px-3 py-1 text-sm text-white rounded-full"
										style={{ backgroundColor: accentColor }}
									>
										{skill}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			</section>
		) : null;

	const CustomSections = () =>
		(data.custom_sections || []).map((section) =>
			section.heading.trim() || section.content.trim() ? (
				<section key={section.id} className="mb-8">
					<h2
						className="font-resume text-xl font-semibold mb-4 pb-2 border-b border-gray-200"
						style={{ color: accentColor }}
					>
						{section.heading || "Untitled"}
					</h2>
					<div className="whitespace-pre-line text-gray-700">{section.content}</div>
				</section>
			) : null
		);

	const sectionMap = {
		summary: <SummarySection key="summary" />,
		experience: <ExperienceSection key="experience" />,
		projects: <ProjectsSection key="projects" />,
		education: null, // handled together with skills
		skills: null,    // handled together with education
	};

	// Combine education+skills as a unit; render once at whichever comes first
	const educationSkillsRendered = { done: false };

	const renderSection = (key) => {
		if (key === "education" || key === "skills") {
			if (!educationSkillsRendered.done) {
				educationSkillsRendered.done = true;
				return <EducationSkillsSection key="education-skills" />;
			}
			return null;
		}
		// Custom section by ID
		if (!sectionMap.hasOwnProperty(key)) {
			const customSection = (data.custom_sections || []).find((s) => s.id === key);
			if (customSection && (customSection.heading.trim() || customSection.content.trim())) {
				return (
					<section key={customSection.id} className="mb-8">
						<h2
							className="font-resume text-xl font-semibold mb-4 pb-2 border-b border-gray-200"
							style={{ color: accentColor }}
						>
							{customSection.heading || "Untitled"}
						</h2>
						<div className="whitespace-pre-line text-gray-700">{customSection.content}</div>
					</section>
				);
			}
			return null;
		}
		return sectionMap[key];
	};

	return (
		<div
			className="max-w-4xl mx-auto bg-white text-gray-800"
			style={getContainerStyle(styleOptions)}
		>
			{/* Header */}
			<header className="p-8 text-white" style={{ backgroundColor: accentColor }}>
				<h1 className="font-resume text-4xl font-semibold mb-3 tracking-tight">
					{data.personal_info?.full_name || "Your Name"}
				</h1>

				<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
					{data.personal_info?.email && (
						<div className="flex items-center gap-2">
							<Mail className="size-4" />
							<span>{data.personal_info.email}</span>
						</div>
					)}
					{data.personal_info?.phone && (
						<div className="flex items-center gap-2">
							<Phone className="size-4" />
							<span>{data.personal_info.phone}</span>
						</div>
					)}
					{data.personal_info?.location && (
						<div className="flex items-center gap-2">
							<MapPin className="size-4" />
							<span>{data.personal_info.location}</span>
						</div>
					)}
					{data.personal_info?.linkedin && (
						<a target="_blank" href={data.personal_info?.linkedin} className="flex items-center gap-2">
							<Linkedin className="size-4" />
							<span className="break-all text-xs">
								{data.personal_info.linkedin.split("https://www.")[1]
									? data.personal_info.linkedin.split("https://www.")[1]
									: data.personal_info.linkedin}
							</span>
						</a>
					)}
					{data.personal_info?.website && (
						<a target="_blank" href={data.personal_info?.website} className="flex items-center gap-2">
							<Globe className="size-4" />
							<span className="break-all text-xs">
								{data.personal_info.website.split("https://")[1]
									? data.personal_info.website.split("https://")[1]
									: data.personal_info.website}
							</span>
						</a>
					)}
				</div>
			</header>

			<div className="p-8">
				{sectionOrder.map((key) => renderSection(key))}
			</div>
		</div>
	);
};

export default ModernTemplate;
