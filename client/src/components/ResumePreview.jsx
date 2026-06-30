import React from "react";
import ModernTemplate from "./templates/ModernTemplate";
import ClassicTemplate from "./templates/ClassicTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import MinimalImageTemplate from "./templates/MinimalImageTemplate";
import ExecutiveTemplate from "./templates/ExecutiveTemplate";
import CreativeTemplate from "./templates/CreativeTemplate";
import CompactTemplate from "./templates/CompactTemplate";

const ResumePreview = ({ data, template, accentColor, styleOptions = {}, classes = "" }) => {
  const renderTemplate = () => {
    switch (template) {
      case "modern":
        return <ModernTemplate data={data} accentColor={accentColor} styleOptions={styleOptions} />;
      case "minimal":
        return <MinimalTemplate data={data} accentColor={accentColor} styleOptions={styleOptions} />;
      case "minimal-image":
        return <MinimalImageTemplate data={data} accentColor={accentColor} styleOptions={styleOptions} />;
      case "executive":
        return <ExecutiveTemplate data={data} accentColor={accentColor} styleOptions={styleOptions} />;
      case "creative":
        return <CreativeTemplate data={data} accentColor={accentColor} styleOptions={styleOptions} />;
      case "compact":
        return <CompactTemplate data={data} accentColor={accentColor} styleOptions={styleOptions} />;
      default:
        return <ClassicTemplate data={data} accentColor={accentColor} styleOptions={styleOptions} />;
    }
  };
  const pageSize = styleOptions?.pageSize || "letter";

  return (
    <div className="w-full bg-canvas">
      <div
        id="resume-preview"
        className={
          "border border-line print:shadow-none print:border-none " + classes
        }
      >
        {renderTemplate()}
      </div>

      <style jsx="true">
        {`
          @page {
            size: ${pageSize};
            margin: 0;
          }
          @media print {
            html,
            body {
              width: ${pageSize === "a4" ? "210mm" : "8.5in"};
              height: ${pageSize === "a4" ? "297mm" : "11in"};
              overflow: hidden;
            }
            body * {
              visibility: hidden;
            }
            #resume-preview,
            #resume-preview * {
              visibility: visible;
            }
            #resume-preview {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: auto;
              margin: 0;
              padding: 0;
              box-shadow: none !important;
              border: none !important;
            }
          }
          /* Custom print breaks to prevent section header/entry clipping */
          #resume-preview h1,
          #resume-preview h2,
          #resume-preview h3,
          #resume-preview h4 {
            page-break-after: avoid;
            break-after: avoid;
          }
          #resume-preview section > div > div,
          #resume-preview section > ul > li,
          #resume-preview section > ol > li {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        `}
      </style>
    </div>
  );
};

export default ResumePreview;
