const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-0 ${className}`}>
      <img src="/uptoskills-logo.png" alt="logo" className="h-10 w-auto" />
    </div>
  );
};

export default Logo;