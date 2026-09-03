const StatCard = ({ title, value, subtitle, icon: Icon, variant="blue" }) => (
  <div className={`stat-card stat-${variant}`}>
    <div className="stat-card-content">
      <div>
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
      {Icon && <div className="stat-icon"><Icon size={23} /></div>}
    </div>
  </div>
);
export default StatCard;
