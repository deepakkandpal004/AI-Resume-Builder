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
import { Bold, GripVertical, Italic, Palette } from "lucide-react";
import { DEFAULT_SECTION_HEADINGS } from "./SectionManager";

// ---------------------------------------------------------------------------
// Font options — resume-appropriate typefaces
// ---------------------------------------------------------------------------
export const FONT_FAMILY_OPTIONS = [
  // Sans-serif
  { value: "inter",        label: "Inter",          css: "Inter, sans-serif",               category: "Sans-serif" },
  { value: "lato",         label: "Lato",            css: "Lato, sans-serif",                category: "Sans-serif" },
  { value: "raleway",      label: "Raleway",         css: "Raleway, sans-serif",             category: "Sans-serif" },
  { value: "nunitosans",   label: "Nunito Sans",     css: "'Nunito Sans', sans-serif",       category: "Sans-serif" },
  // Serif
  { value: "georgia",      label: "Georgia",         css: "Georgia, serif",                  category: "Serif" },
  { value: "merriweather", label: "Merriweather",    css: "Merriweather, serif",             category: "Serif" },
  { value: "playfair",     label: "Playfair Display",css: "'Playfair Display', serif",       category: "Serif" },
  { value: "sourceserif",  label: "Source Serif 4",  css: "'Source Serif 4', serif",         category: "Serif" },
  { value: "garamond",     label: "EB Garamond",     css: "'EB Garamond', serif",            category: "Serif" },
  { value: "ibmplexserif", label: "IBM Plex Serif",  css: "'IBM Plex Serif', serif",         category: "Serif" },
  // Monospace
  { value: "courier",      label: "Courier New",     css: "'Courier New', monospace",        category: "Mono" },
];

const LINE_SPACING_OPTIONS = [
  { value: 1.2, label: "Compact" },
  { value: 1.5, label: "Normal" },
  { value: 1.8, label: "Relaxed" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const hasContent = (resumeData, key) => {
  switch (key) {
    case "summary":    return !!resumeData.professional_summary?.trim();
    case "experience": return resumeData.experience?.length > 0;
    case "education":  return resumeData.education?.length > 0;
    case "projects":   return resumeData.project?.length > 0;
    case "skills":     return resumeData.skills?.length > 0;
    default:           return false;
  }
};

const getActiveSections = (resumeData) => {
  const sh = resumeData.section_headings || {};
  const builtIn = [
    { key: "summary",    label: sh.summary?.trim()    || DEFAULT_SECTION_HEADINGS.summary },
    { key: "experience", label: sh.experience?.trim() || DEFAULT_SECTION_HEADINGS.experience },
    { key: "education",  label: sh.education?.trim()  || DEFAULT_SECTION_HEADINGS.education },
    { key: "projects",   label: sh.projects?.trim()   || DEFAULT_SECTION_HEADINGS.projects },
    { key: "skills",     label: sh.skills?.trim()     || DEFAULT_SECTION_HEADINGS.skills },
  ].filter((s) => hasContent(resumeData, s.key));

  const custom = (resumeData.custom_sections || []).map((s) => ({
    key: s.id,
    label: s.heading?.trim() || "Untitled Section",
  }));

  return [...builtIn, ...custom];
};

// ---------------------------------------------------------------------------
// SortableItem
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// ToggleButton — reusable bold / italic toggle
// ---------------------------------------------------------------------------
const ToggleButton = ({ active, onClick, icon: Icon, label }) => (
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

// ---------------------------------------------------------------------------
// StylesPanel
// ---------------------------------------------------------------------------
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

  // Group fonts by category for the selector
  const categories = [...new Set(FONT_FAMILY_OPTIONS.map((f) => f.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
          <Palette className="size-5" /> Styles
        </h3>
        <p className="text-sm text-muted">Customize font, size, spacing, and section order.</p>
      </div>

      {/* ── Font Family ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-body uppercase tracking-wide">Font Family</h4>
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
      </div>

      {/* ── Font Size ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-body uppercase tracking-wide">Font Size</h4>
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
      </div>

      {/* ── Line Spacing ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-body uppercase tracking-wide">Line Spacing</h4>
        <div className="flex gap-2">
          {LINE_SPACING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("lineSpacing", opt.value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                lineSpacing === opt.value
                  ? "border-brand-500 bg-brand-600 text-white"
                  : "border-line bg-surface text-ink hover:bg-canvas"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Heading Style ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-body uppercase tracking-wide">Heading Style</h4>
        <p className="text-xs text-muted">Applied to all section headings in the resume.</p>
        <div className="flex gap-2">
          <ToggleButton
            active={headingBold}
            onClick={() => update("headingBold", !headingBold)}
            icon={Bold}
            label="Bold"
          />
          <ToggleButton
            active={headingItalic}
            onClick={() => update("headingItalic", !headingItalic)}
            icon={Italic}
            label="Italic"
          />
        </div>
        {/* Live preview */}
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
      </div>

      {/* ── Content Style ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-body uppercase tracking-wide">Content Style</h4>
        <p className="text-xs text-muted">Applied to body text (descriptions, summaries, etc.).</p>
        <div className="flex gap-2">
          <ToggleButton
            active={contentBold}
            onClick={() => update("contentBold", !contentBold)}
            icon={Bold}
            label="Bold"
          />
          <ToggleButton
            active={contentItalic}
            onClick={() => update("contentItalic", !contentItalic)}
            icon={Italic}
            label="Italic"
          />
        </div>
        {/* Live preview */}
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
      </div>

      {/* ── Section Order ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-body uppercase tracking-wide">Section Order</h4>
        <p className="text-xs text-muted">Drag to reorder how sections appear in the resume.</p>
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
      </div>

      <div className="rounded-lg bg-brand-50 p-3 text-sm text-body dark:bg-brand-500/10">
        <p><strong>Tip:</strong> Changes apply to the preview in real time. Save your resume to persist them.</p>
      </div>
    </div>
  );
};

export default StylesPanel;
