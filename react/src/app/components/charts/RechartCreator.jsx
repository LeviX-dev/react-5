import { ResponsiveContainer } from "recharts";

export default function RechartCreator({ height = "320px", width = "100%", children }) {
  return (
    <div style={{ height: height, width: width }}>
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  );
}
