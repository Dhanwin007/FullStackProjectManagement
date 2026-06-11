import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const COLORS = ["#94a3b8", "#3b82f6", "#10b981"];

const AnalyticsTab = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get(
        `/projects/tasks/${projectId}`
      );

      setTasks(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading Analytics...
      </div>
    );
  }

  const totalTasks = tasks.length;

  const todoTasks = tasks.filter(
    task => task.status === "todo"
  ).length;

  const inProgressTasks = tasks.filter(
    task => task.status === "in_progress"
  ).length;

  const doneTasks = tasks.filter(
    task => task.status === "done"
  ).length;

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round((doneTasks / totalTasks) * 100);

 const statusData = totalTasks === 0
  ? [{ name: "No Tasks", value: 1 }]
  : [
      { name: "Todo", value: todoTasks },
      { name: "In Progress", value: inProgressTasks },
      { name: "Done", value: doneTasks }
    ];

  const workloadMap = {};

  tasks.forEach(task => {
  const user =
  task.assignedTo?.username ??
  task.assignedTo?.fullName ??
  "No Assignee";

    workloadMap[user] =
      (workloadMap[user] || 0) + 1;
  });

  const workloadData = Object.entries(
    workloadMap
  ).map(([name, tasks]) => ({
    name,
    tasks
  }));

  return (
    <div className="space-y-8">

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-slate-500 text-sm">
            Total Tasks
          </h3>
          <p className="text-3xl font-bold">
            {totalTasks}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-slate-500 text-sm">
            Todo
          </h3>
          <p className="text-3xl font-bold">
            {todoTasks}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-slate-500 text-sm">
            In Progress
          </h3>
          <p className="text-3xl font-bold">
            {inProgressTasks}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-slate-500 text-sm">
            Completed
          </h3>
          <p className="text-3xl font-bold">
            {doneTasks}
          </p>
        </div>

      </div>

      {/* Completion Rate */}

      <div className="bg-white p-6 rounded-2xl shadow-sm">

        <h2 className="font-bold text-lg mb-4">
          Completion Rate
        </h2>

        <div className="w-full bg-slate-200 rounded-full h-4">

          <div
            className="bg-green-500 h-4 rounded-full"
            style={{
              width: `${completionRate}%`
            }}
          />

        </div>

        <p className="mt-3 font-semibold">
          {completionRate}%
        </p>

      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm h-[400px]">

          <h2 className="font-bold mb-4">
            Task Status Distribution
          </h2>

          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                outerRadius={120}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm h-[400px]">

          <h2 className="font-bold mb-4">
            Team Workload
          </h2>

          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={workloadData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="tasks"
                fill="#2563eb"
              />

            </BarChart>
          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
};

export default AnalyticsTab;