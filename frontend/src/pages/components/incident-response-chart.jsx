import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export function IncidentResponseChart({ transportRequests }) {
  // Placeholder: Assuming response_time field exists
  const data = [
    { type: "Doente Não Urgente", avgTime: 10 },
    { type: "Doente Urgente", avgTime: 5 },
  ];

  return (
    <BarChart width={500} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="type" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="avgTime" fill="#82ca9d" />
    </BarChart>
  );
}
