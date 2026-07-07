const Logo = ({ className = "h-9 w-auto" }) => (
  <img
    src="/logo.png"
    alt="Resume AI"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

export default Logo;
