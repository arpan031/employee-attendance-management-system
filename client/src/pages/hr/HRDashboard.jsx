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
  const [dashboard, setDashboard] =
    useState(null);

  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (analyticsOnly) {
        const response = await api.get(
          "/hr/analytics"
        );

        setAnalytics(response.data.analytics);
      } else {
        const [dashboardResponse, analyticsResponse] =
          await Promise.all([
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

  const chartData =
    analytics?.daily?.map((item) => ({
      date: item._id,
      present: item.present || 0,
      late: item.late || 0,
      absent: item.absent || 0,
      leave: item.leave || 0
    })) || [];

  return (
    <div className="page-container">
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

      <section className="card">
        <div className="card-header">
          <div>
            <h3>Attendance Overview</h3>
            <p>
              Current month's attendance
              distribution
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
              height={350}
            >
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="date" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Legend iconType="circle" />

                <Bar
                  dataKey="present"
                  name="Present"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="late"
                  name="Late"
                  fill="#b7791f"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="absent"
                  name="Absent"
                  fill="#c2410c"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="leave"
                  name="Leave"
                  fill="#142a4c"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {analytics && (
        <section className="card">
          <div className="card-header">
            <div>
              <h3>Monthly Summary</h3>
              <p>
                Attendance statistics for the
                current month.
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
