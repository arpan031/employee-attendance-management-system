import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock3,
  FileText,
  Users
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import api from "../../services/api";
import StatCard from "../../components/StatCard";

const HRDashboard = ({ analyticsOnly = false }) => {
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (analyticsOnly) {
        const response = await api.get("/hr/analytics");

        setAnalytics(response.data.analytics);
      } else {
        const [
          dashboardResponse,
          analyticsResponse
        ] = await Promise.all([
          api.get("/hr/dashboard"),
          api.get("/hr/analytics")
        ]);

        setDashboard(
          dashboardResponse.data.dashboard
        );

        setAnalytics(
          analyticsResponse.data.analytics
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load HR dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [analyticsOnly]);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p>Loading HR data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  /*
   * Prepare analytics data.
   *
   * Backend returns:
   * {
   *   _id,
   *   present,
   *   late,
   *   absent,
   *   leave
   * }
   */
  const chartData =
    analytics?.daily?.map((item) => ({
      date: item._id,
      present: Number(item.present || 0),
      late: Number(item.late || 0),
      absent: Number(item.absent || 0),
      leave: Number(item.leave || 0)
    })) || [];

  return (
    <div className="page-container">

      /*  HEADER  */}

      <div className="page-header">
        <div>
          <h2>
            {analyticsOnly
              ? "Attendance Analytics"
              : "HR Dashboard"}
          </h2>

          <p>
            {analyticsOnly
              ? "Analyze employee attendance trends."
              : "Monitor workforce attendance and leave activity."}
          </p>
        </div>
      </div>

      /*  STAT CARDS */

      {!analyticsOnly && dashboard && (
        <div className="stats-grid">

          <StatCard
            title="Total Employees"
            value={dashboard.totalEmployees}
            subtitle="Active workforce"
            icon={Users}
            variant="blue"
          />

          <StatCard
            title="Present Today"
            value={dashboard.presentToday}
            subtitle="Employees checked in"
            icon={CalendarCheck}
            variant="green"
          />

          <StatCard
            title="Late Today"
            value={dashboard.lateToday}
            subtitle="Late arrivals"
            icon={Clock3}
            variant="orange"
          />

          <StatCard
            title="Pending Leaves"
            value={dashboard.pendingLeaves}
            subtitle="Awaiting approval"
            icon={FileText}
            variant="purple"
          />

        </div>
      )}

      /* ATTENDANCE GRAPH  */

      <section className="card attendance-chart-card">

        <div className="card-header">
          <div>
            <h3>Attendance Overview</h3>

            <p>
              Current month's attendance distribution
            </p>
          </div>
        </div>

        <div className="analytics-chart">

          {chartData.length === 0 ? (
            <div className="empty-state">
              No analytics data available.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={280}
            >
              <BarChart
                data={chartData}
                margin={{
                  top: 15,
                  right: 10,
                  left: -10,
                  bottom: 20
                }}
                barCategoryGap="18%"
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e5ea"
                />

                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 10,
                    fill: "#64748b"
                  }}
                  tickLine={false}
                  axisLine={{
                    stroke: "#dbe1e8"
                  }}
                  tickFormatter={(value) => {
                    if (!value) return "";

                    const parts = String(value).split("-");

                    if (parts.length === 3) {
                      return `${parts[1]}-${parts[2]}`;
                    }

                    return value;
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  allowDataOverflow={false}
                  domain={[0, "auto"]}
                  tick={{
                    fontSize: 10,
                    fill: "#64748b"
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(109, 93, 252, 0.06)"
                  }}
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e5ea",
                    borderRadius: "10px",
                    boxShadow:
                      "0 8px 25px rgba(20, 42, 76, 0.12)"
                  }}
                  labelStyle={{
                    color: "#142a4c",
                    fontWeight: 700
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: "11px",
                    paddingTop: "8px"
                  }}
                />

                <Bar
                  dataKey="present"
                  name="Present"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />

                <Bar
                  dataKey="late"
                  name="Late"
                  fill="#b7791f"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />

                <Bar
                  dataKey="absent"
                  name="Absent"
                  fill="#c2410c"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />

                <Bar
                  dataKey="leave"
                  name="Leave"
                  fill="#142a4c"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />

              </BarChart>
            </ResponsiveContainer>
          )}

        </div>

      </section>

      /* MONTHLY SUMMARY*/

      {analytics && (
        <section className="card">

          <div className="card-header">
            <div>
              <h3>Monthly Summary</h3>

              <p>
                Attendance statistics for the current month.
              </p>
            </div>
          </div>

          <div className="summary-strip">

            <div className="summary-present">
              <span>Present</span>
              <strong>
                {analytics.summary?.present || 0}
              </strong>
            </div>

            <div className="summary-late">
              <span>Late</span>
              <strong>
                {analytics.summary?.late || 0}
              </strong>
            </div>

            <div className="summary-absent">
              <span>Absent</span>
              <strong>
                {analytics.summary?.absent || 0}
              </strong>
            </div>

            <div className="summary-leave">
              <span>Leave</span>
              <strong>
                {analytics.summary?.leave || 0}
              </strong>
            </div>

          </div>

        </section>
      )}

    </div>
  );
};

export default HRDashboard;