import { Link } from "react-router-dom";

const NavLink = ({ to, children, className = "" }) => {
  return (
    <Link to={to} className={`text-foreground hover:text-primary transition-colors ${className}`}>
      {children}
    </Link>
  );
};

export default NavLink;
