const Logo = ({ className = "", size = "md" }) => {
  const iconSizes = { sm: 20, md: 26, lg: 32 };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };
  const iconSize = iconSizes[size] || iconSizes.md;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/favicon.png"
        alt=""
        draggable={false}
        className="shrink-0"
        style={{ width: iconSize, height: iconSize }}
      />
      <span
        className={`font-['Space_Grotesk'] font-extrabold tracking-tight ${textSizes[size] || textSizes.md}`}
      >
        Resume<span className="ml-0.5 text-emerald-500">AI</span>
      </span>
    </span>
  );
};

export default Logo;
