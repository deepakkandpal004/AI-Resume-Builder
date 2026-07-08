const Logo = ({ className = "h-12 w-auto" }) => (
  <img
    src="/logo.svg"
    alt="Resume AI"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

export default Logo;
