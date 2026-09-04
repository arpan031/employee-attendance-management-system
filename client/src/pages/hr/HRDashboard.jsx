import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock3,
  FileText,
  Percent,
  Timer,
  UserX,
  Users
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import api from "../../services/api";
import StatCard from "../../components/StatCard";

const BREAKDOWN_COLORS = {
  Present: "#10b981",
  Late: "#b7791f",
  "Half Day": "#0ea5e9",
  Absent: "#c2410c",
  Leave: "#142a4c"
};

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

  const weekChartData =
    analytics?.last7Days?.map((item) => ({
      date: item.date.slice(5),
      present: item.present || 0,
      late: item.late || 0,
      halfDay: item.halfDay || 0,
      absent: item.absent || 0
    })) || [];

  const trendChartData =
    analytics?.weeklyTrend?.weeks?.map(
      (week) => ({
        label: week.label,
        presenceRate: week.presenceRate
      })
    ) || [];

  const bestWeek =
    analytics?.weeklyTrend?.bestWeek;

  const averageRate =
    analytics?.weeklyTrend?.averageRate ?? 0;

  const trendVsPrevious =
    analytics?.weeklyTrend
      ?.trendVsPrevious ?? 0;

  const summary = analytics?.summary || {};

  const breakdownTotal =
    (summary.present || 0) +
    (summary.late || 0) +
    (summary.halfDay || 0) +
    (summary.absent || 0) +
    (summary.leave || 0);

  const breakdownData = [
    { name: "Present", value: summary.present || 0 },
    { name: "Late", value: summary.late || 0 },
    { name: "Half Day", value: summary.halfDay || 0 },
    { name: "Absent", value: summary.absent || 0 },
    { name: "Leave", value: summary.leave || 0 }
  ].filter((item) => item.value > 0);

  const overallRate =
    breakdownTotal > 0
      ? Math.round(
          (((summary.present || 0) +
            (summary.late || 0) +
            (summary.halfDay || 0)) /
            breakdownTotal) *
            1000
        ) / 10
      : 0;

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
        <div className="stats-grid stats-grid-wide">
          <StatCard
            title="Total Employees"
            value={dashboard.totalEmployees}
            subtitle="Active workforce"
            icon={Users}
            variant="blue"
            trend={
              dashboard.trends?.totalEmployees
            }
          />

          <StatCard
            title="Present Today"
            value={dashboard.presentToday}
            subtitle="Employees checked in"
            icon={CalendarCheck}
            variant="green"
            trend={
              dashboard.trends?.presentToday
            }
          />

          <StatCard
            title="Late Today"
            value={dashboard.lateToday}
            subtitle="Late arrivals"
            icon={Clock3}
            variant="orange"
          />

          <StatCard
            title="Half Day"
            value={dashboard.halfDayToday}
            subtitle="Partial attendance"
            icon={Timer}
            variant="sky"
            trend={
              dashboard.trends?.halfDayToday
            }
          />

          <StatCard
            title="Absent Today"
            value={dashboard.absentToday}
            subtitle="Not checked in"
            icon={UserX}
            variant="red"
            trend={
              dashboard.trends?.absentToday
            }
          />

          <StatCard
            title="Attendance Rate"
            value={`${dashboard.attendanceRate}%`}
            subtitle="Of active workforce"
            icon={Percent}
            variant="purple"
            trend={
              dashboard.trends?.attendanceRate
            }
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

      <div className="chart-grid">
        <section className="card chart-panel-overview">
          <div className="card-header">
            <div>
              <h3>Attendance Overview</h3>
              <p>Daily attendance breakdown &middot; last 7 days</p>
            </div>
          </div>

          <div className="analytics-chart">
            {weekChartData.length === 0 ? (
              <div className="empty-state">
                No attendance data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart data={weekChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Legend iconType="circle" />

                  <Bar
                    dataKey="present"
                    name="Present"
                    stackId="a"
                    fill="#10b981"
                  />

                  <Bar
                    dataKey="late"
                    name="Late"
                    stackId="a"
                    fill="#b7791f"
                  />

                  <Bar
                    dataKey="halfDay"
                    name="Half Day"
                    stackId="a"
                    fill="#0ea5e9"
                  />

                  <Bar
                    dataKey="absent"
                    name="Absent"
                    stackId="a"
                    fill="#c2410c"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="card chart-panel-trend">
          <div className="card-header">
            <div>
              <h3>Attendance Trend</h3>
              <p>Weekly presence rate &middot; last 7 weeks</p>
            </div>
          </div>

          <div className="analytics-chart">
            {trendChartData.length === 0 ? (
              <div className="empty-state">
                No trend data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={230}
              >
                <LineChart data={trendChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                    width={44}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${value}%`,
                      "Presence rate"
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="presenceRate"
                    name="Presence rate"
                    stroke="#142a4c"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#142a4c" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="trend-footer">
            <div>
              <span>Best Week</span>
              <strong>
                {bestWeek
                  ? `${bestWeek.presenceRate}%`
                  : "--"}
              </strong>
            </div>

            <div>
              <span>Average (7 weeks)</span>
              <strong>{averageRate}%</strong>
            </div>

            <div>
              <span>vs Previous 7 Weeks</span>
              <strong
                className={
                  trendVsPrevious >= 0
                    ? "trend-positive"
                    : "trend-negative"
                }
              >
                {trendVsPrevious >= 0 ? "+" : ""}
                {trendVsPrevious}%
              </strong>
            </div>
          </div>
        </section>

        <section className="card chart-panel-breakdown">
          <div className="card-header">
            <div>
              <h3>Attendance Breakdown</h3>
              <p>Current month &middot; overall distribution</p>
            </div>
          </div>

          <div className="donut-wrapper">
            {breakdownData.length === 0 ? (
              <div className="empty-state">
                No data yet.
              </div>
            ) : (
              <>
                <ResponsiveContainer
                  width="100%"
                  height={180}
                >
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {breakdownData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            BREAKDOWN_COLORS[
                              entry.name
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="donut-center">
                  <strong>{overallRate}%</strong>
                  <span>Overall Attendance</span>
                </div>
              </>
            )}
          </div>

          <div className="donut-legend">
            {breakdownData.map((entry) => (
              <div
                className="donut-legend-item"
                key={entry.name}
              >
                <span
                  className="donut-legend-dot"
                  style={{
                    background:
                      BREAKDOWN_COLORS[entry.name]
                  }}
                />
                <span className="donut-legend-name">
                  {entry.name}
                </span>
                <span className="donut-legend-value">
                  {entry.value} (
                  {breakdownTotal > 0
                    ? Math.round(
                        (entry.value /
                          breakdownTotal) *
                          1000
                      ) / 10
                    : 0}
                  %)
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

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
