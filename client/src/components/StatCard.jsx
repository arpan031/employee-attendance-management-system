import { TrendingDown, TrendingUp } from "lucide-react";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "blue",
  trend
}) => {
  const hasTrend =
    typeof trend === "number" &&
    !Number.isNaN(trend);

  const isPositive = hasTrend && trend >= 0;

  return (
    <div className={`stat-card stat-${variant}`}>
      <div className="stat-card-content">
        <div>
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>

          {subtitle && (
            <p className="stat-subtitle">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className="stat-icon">
            <Icon size={24} />
          </div>
        )}
      </div>

      {hasTrend && (
        <div
          className={
            isPositive
              ? "stat-trend stat-trend-up"
              : "stat-trend stat-trend-down"
          }
        >
          {isPositive ? (
            <TrendingUp size={13} />
          ) : (
            <TrendingDown size={13} />
          )}
          {Math.abs(trend)}%
          <span className="stat-trend-caption">
            vs last week
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
