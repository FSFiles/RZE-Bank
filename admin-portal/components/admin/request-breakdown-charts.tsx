"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const COLORS = ["#D4AF37", "#60A5FA", "#F472B6", "#34D399", "#FB923C", "#A78BFA", "#F87171"];

const tooltipStyle = {
  background: "#0B1230",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
  color: "#fff",
};

export function RequestBreakdownCharts({
  byType,
  byPriority,
}: {
  byType: { type: string; count: number }[];
  byPriority: { priority: string; count: number }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requests by Type</CardTitle>
          <CardDescription>All-time distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            {byType.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byType} dataKey="count" nameKey="type" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {byType.map((entry, i) => (
                      <Cell key={entry.type} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {byType.map((entry, i) => (
              <span key={entry.type} className="flex items-center gap-1 text-[11px] text-muted-foreground capitalize">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {entry.type.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requests by Priority</CardTitle>
          <CardDescription>All-time distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            {byPriority.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byPriority} dataKey="count" nameKey="priority" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {byPriority.map((entry, i) => (
                      <Cell key={entry.priority} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {byPriority.map((entry, i) => (
              <span key={entry.priority} className="flex items-center gap-1 text-[11px] text-muted-foreground capitalize">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {entry.priority}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
