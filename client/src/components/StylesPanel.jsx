import React, { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bold, GripVertical, Italic, ImageIcon } from "lucide-react";
import { DEFAULT_SECTION_HEADINGS } from "./SectionManager";
import { applyPhotoEffect } from "../utils/imagekit";

// eslint-disable-next-line react-refresh/only-export-components
export const FONT_FAMILY_OPTIONS = [
  { value: "inter",        label: "Inter",            css: "Inter, sans-serif",                 category: "Sans-serif" },
  { value: "spacegrotesk", label: "Space Grotesk",    css: "'Space Grotesk', sans-serif",       category: "Sans-serif" },
  { value: "lato",         label: "Lato",             css: "Lato, sans-serif",                  category: "Sans-serif" },
  { value: "raleway",      label: "Raleway",          css: "Raleway, sans-serif",               category: "Sans-serif" },
  { value: "nunitosans",   label: "Nunito Sans",      css: "'Nunito Sans', sans-serif",         category: "Sans-serif" },
  { value: "georgia",      label: "Georgia",         css: "Georgia, serif",                  category: "Serif" },
  { value: "merriweather", label: "Merriweather",    css: "Merriweather, serif",             category: "Serif" },
  { value: "playfair",     label: "Playfair Display",css: "'Playfair Display', serif",       category: "Serif" },
  { value: "sourceserif",  label: "Source Serif 4",  css: "'Source Serif 4', serif",         category: "Serif" },
  { value: "garamond",     label: "EB Garamond",     css: "'EB Garamond', serif",            category: "Serif" },
  { value: "ibmplexserif", label: "IBM Plex Serif",  css: "'IBM Plex Serif', serif",         category: "Serif" },
  { value: "courier",      label: "Courier New",     css: "'Courier New', monospace",        category: "Mono" },
];

const LINE_SPACING_OPTIONS = [
  { value: 1.2, label: "Compact" },
  { value: 1.5, label: "Normal" },
  { value: 1.8, label: "Relaxed" },
];

const PHOTO_EFFECT_OPTIONS = [
  { value: "none",      label: "Original",      description: "No effect" },
  { value: "grayscale", label: "Grayscale",      description: "Classic B&W" },
  { value: "contrast",  label: "High Contrast",  description: "Sharper look" },
  { value: "sharpen",   label: "Sharpen",        description: "Crisp details" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "MM/YYYY",   label: "06/2024" },
  { value: "Month YYYY",label: "Jun 2024" },
  { value: "MMMM YYYY", label: "June 2024" },
];

const SECTION_SPACING_OPTIONS = [
  { value: "compact",  label: "Compact" },
  { value: "normal",   label: "Normal" },
  { value: "relaxed",  label: "Relaxed" },
];

const hasContent = (resumeData, key) => {
  switch (key) {
    case "summary":        return !!resumeData.professional_summary?.trim();
    case "experience":     return resumeData.experience?.length > 0;
    case "education":      return resumeData.education?.length > 0;
    case "projects":       return resumeData.project?.length > 0;
    case "skills":         return resumeData.skills?.length > 0;
    case "certifications": return resumeData.certifications?.length > 0;
    case "languages":      return resumeData.languages?.length > 0;
    default:               return false;
  }
};

const getActiveSections = (resumeData) => {
  const sh = resumeData.section_headings || {};
  const builtIn = [
    { key: "summary",        label: sh.summary?.trim()        || DEFAULT_SECTION_HEADINGS.summary },
    { key: "experience",     label: sh.experience?.trim()     || DEFAULT_SECTION_HEADINGS.experience },
    { key: "education",      label: sh.education?.trim()      || DEFAULT_SECTION_HEADINGS.education },
    { key: "projects",       label: sh.projects?.trim()       || DEFAULT_SECTION_HEADINGS.projects },
    { key: "skills",         label: sh.skills?.trim()         || DEFAULT_SECTION_HEADINGS.skills },
    { key: "certifications", label: sh.certifications?.trim() || DEFAULT_SECTION_HEADINGS.certifications },
    { key: "languages",      label: sh.languages?.trim()      || DEFAULT_SECTION_HEADINGS.languages },
  ].filter((s) => hasContent(resumeData, s.key));

  const custom = (resumeData.custom_sections || []).map((s) => ({
    key: s.id,
    label: s.heading?.trim() || "Untitled Section",
  }));

  return [...builtIn, ...custom];
};

const SortableItem = ({ id, label }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : "auto",
      }}
      className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink shadow-sm"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted touch-none focus:outline-none"
        aria-label={`Drag to reorder ${label}`}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="flex-1">{label}</span>
    </div>
  );
};

const ToggleButton = ({ active, onClick, label, icon: Icon }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    aria-pressed={active}
    className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all select-none ${
      active
        ? "border-brand-500 bg-brand-600 text-white"
        : "border-line bg-surface text-ink hover:bg-canvas"
    }`}
  >
    <Icon className="size-4" />
    <span className="text-xs">{label}</span>
  </button>
);

const SectionCard = ({ title, children }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-body">{title}</h4>
    {children}
  </div>
);

const SelectGroup = ({ options, value, onChange }) => (
  <div className="flex gap-2">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
          value === opt.value
            ? "border-brand-500 bg-brand-600 text-white"
            : "border-line bg-surface text-ink hover:bg-canvas"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const StylesPanel = ({ styleOptions, onChange, resumeData }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeSections = useMemo(() => {
    const raw = getActiveSections(resumeData);
    const storedOrder = styleOptions?.sectionOrder ?? [];
    if (storedOrder.length === 0) return raw;
    const byKey = Object.fromEntries(raw.map((s) => [s.key, s]));
    const ordered = storedOrder.filter((k) => byKey[k]).map((k) => byKey[k]);
    const extra = raw.filter((s) => !storedOrder.includes(s.key));
    return [...ordered, ...extra];
  }, [resumeData, styleOptions?.sectionOrder]);

  const itemIds = useMemo(() => activeSections.map((s) => s.key), [activeSections]);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = itemIds.indexOf(active.id);
    const newIndex = itemIds.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange({ ...styleOptions, sectionOrder: arrayMove(itemIds, oldIndex, newIndex) });
  };

  const update = (key, value) => onChange({ ...styleOptions, [key]: value });

  const fontFamily    = styleOptions?.fontFamily    ?? "inter";
  const fontSize      = styleOptions?.fontSize      ?? 14;
  const lineSpacing   = styleOptions?.lineSpacing   ?? 1.5;
  const headingBold   = styleOptions?.headingBold   ?? true;
  const headingItalic = styleOptions?.headingItalic ?? false;
  const contentBold   = styleOptions?.contentBold   ?? false;
  const contentItalic = styleOptions?.contentItalic ?? false;
  const photoEffect   = styleOptions?.photoEffect   ?? "none";
  const pageSize      = styleOptions?.pageSize      ?? "letter";
  const dateFormat    = styleOptions?.dateFormat    ?? "MM/YYYY";
  const sectionSpacing = styleOptions?.sectionSpacing ?? "normal";

  const categories = [...new Set(FONT_FAMILY_OPTIONS.map((f) => f.category))];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-ink">Styles</h3>
        <p className="text-sm text-muted mt-0.5">Customize fonts, spacing, and section layout.</p>
      </div>

      {/* ── Typography ─────────────────────────────────────────────── */}
      <div className="space-y-4 pb-5 border-b border-line">
        <SectionCard title="Font Family">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="text-xs text-muted mb-1.5">{cat}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {FONT_FAMILY_OPTIONS.filter((f) => f.category === cat).map((opt) => {
                  const isActive = fontFamily === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => update("fontFamily", opt.value)}
                      className={`rounded-lg border px-3 py-2 text-sm text-left transition-all ${
                        isActive
                          ? "border-brand-500 ring-2 ring-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                          : "border-line bg-surface text-ink hover:border-brand-300 hover:bg-canvas"
                      }`}
                      style={{ fontFamily: opt.css }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Font Size">
          <div className="flex items-center gap-4">
            <button
              onClick={() => update("fontSize", Math.min(16, Math.max(11, fontSize - 1)))}
              disabled={fontSize <= 11}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease font size"
            >−</button>
            <span className="min-w-[3.5rem] text-center text-sm font-medium text-ink tabular-nums">
              {fontSize}px
            </span>
            <button
              onClick={() => update("fontSize", Math.min(16, Math.max(11, fontSize + 1)))}
              disabled={fontSize >= 16}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase font size"
            >+</button>
            <span className="ml-auto text-xs text-muted">11 – 16px</span>
          </div>
        </SectionCard>

        <SectionCard title="Line Spacing">
          <SelectGroup options={LINE_SPACING_OPTIONS} value={lineSpacing} onChange={(v) => update("lineSpacing", v)} />
        </SectionCard>
      </div>

      {/* ── Layout ─────────────────────────────────────────────────── */}
      <div className="space-y-4 pb-5 border-b border-line">
        <SectionCard title="Page Format">
          <p className="text-xs text-muted mb-2">Paper size for export & printing.</p>
          <SelectGroup options={[
            { value: "letter", label: "Letter (US)" },
            { value: "a4", label: "A4 (International)" },
          ]} value={pageSize} onChange={(v) => update("pageSize", v)} />
        </SectionCard>

        <SectionCard title="Date Format">
          <p className="text-xs text-muted mb-2">How dates appear on the resume.</p>
          <SelectGroup options={DATE_FORMAT_OPTIONS} value={dateFormat} onChange={(v) => update("dateFormat", v)} />
        </SectionCard>

        <SectionCard title="Section Spacing">
          <p className="text-xs text-muted mb-2">Vertical gap between sections.</p>
          <SelectGroup options={SECTION_SPACING_OPTIONS} value={sectionSpacing} onChange={(v) => update("sectionSpacing", v)} />
        </SectionCard>
      </div>

      {/* ── Text Style ─────────────────────────────────────────────── */}
      <div className="space-y-4 pb-5 border-b border-line">
        <SectionCard title="Heading Style">
          <p className="text-xs text-muted mb-2">Applied to all section headings.</p>
          <div className="flex gap-2">
            <ToggleButton active={headingBold} onClick={() => update("headingBold", !headingBold)} icon={Bold} label="Bold" />
            <ToggleButton active={headingItalic} onClick={() => update("headingItalic", !headingItalic)} icon={Italic} label="Italic" />
          </div>
          <div
            className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
            style={{
              fontWeight: headingBold ? 700 : 400,
              fontStyle: headingItalic ? "italic" : "normal",
              fontFamily: FONT_FAMILY_OPTIONS.find((f) => f.value === fontFamily)?.css ?? "inherit",
            }}
          >
            Professional Experience
          </div>
        </SectionCard>

        <SectionCard title="Content Style">
          <p className="text-xs text-muted mb-2">Applied to body text (descriptions, summaries).</p>
          <div className="flex gap-2">
            <ToggleButton active={contentBold} onClick={() => update("contentBold", !contentBold)} icon={Bold} label="Bold" />
            <ToggleButton active={contentItalic} onClick={() => update("contentItalic", !contentItalic)} icon={Italic} label="Italic" />
          </div>
          <div
            className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
            style={{
              fontWeight: contentBold ? 700 : 400,
              fontStyle: contentItalic ? "italic" : "normal",
              fontFamily: FONT_FAMILY_OPTIONS.find((f) => f.value === fontFamily)?.css ?? "inherit",
            }}
          >
            Developed and maintained full-stack web applications…
          </div>
        </SectionCard>
      </div>

      {/* ── Photo Style ────────────────────────────────────────────── */}
      {resumeData?.personal_info?.image && typeof resumeData.personal_info.image === "string" && (
        <div className="pb-5 border-b border-line">
          <SectionCard title="Photo Style">
            <p className="text-xs text-muted mb-2">Apply a visual effect to your profile photo.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {PHOTO_EFFECT_OPTIONS.map((opt) => {
                const isActive = photoEffect === opt.value;
                const previewUrl = opt.value === "none"
                  ? resumeData.personal_info.image
                  : applyPhotoEffect(resumeData.personal_info.image, opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => update("photoEffect", opt.value)}
                    title={opt.description}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left transition-all ${
                      isActive
                        ? "border-brand-500 ring-2 ring-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        : "border-line bg-surface text-ink hover:border-brand-300 hover:bg-canvas"
                    }`}
                  >
                    <img
                      src={previewUrl}
                      alt={opt.label}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-line"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div>
                      <p className="font-medium text-xs leading-tight">{opt.label}</p>
                      <p className="text-[10px] text-muted leading-tight">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Section Order ──────────────────────────────────────────── */}
      <div className="pb-5 border-b border-line">
        <SectionCard title="Section Order">
          <p className="text-xs text-muted mb-2">Drag to reorder sections in the resume.</p>
          {activeSections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line py-6 text-center text-sm text-muted">
              Add content to sections to reorder them.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-1.5">
                  {activeSections.map((section) => (
                    <SortableItem key={section.key} id={section.key} label={section.label} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </SectionCard>
      </div>

      <div className="rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-body dark:bg-brand-500/10">
        <strong>Tip:</strong> Changes apply in real time. Save to persist.
      </div>
    </div>
  );
};

export default StylesPanel;
