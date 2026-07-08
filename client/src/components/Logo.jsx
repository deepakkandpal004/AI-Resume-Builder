// Logo renders at a consistent width so it looks good regardless of
// the image's aspect ratio. Height scales automatically.
const Logo = ({ className = "", size = "md" }) => {
  const widths = { sm: 100, md: 130, lg: 160 };
  const w = widths[size] || widths.md;

  return (
    <img
      src="/logo.png"
      alt="Resume AI"
      style={{ width: `${w}px`, height: "auto", display: "block", objectFit: "contain" }}
      className={className}
    />
  );
};

export default Logo;
