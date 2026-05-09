'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklyReportChartProps {
  workoutData?: Array<{ day: string; completed: number; planned: number }>;
  intensityData?: Array<{ date: string; averageRpe: number }>;
  dietData?: Array<{ name: string; value: number }>;
  volumeData?: Array<{ date: string; volume: number }>;
  completionRate?: number;
  submissionRate?: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export function WeeklyReportChart({
  workoutData = [],
  intensityData = [],
  dietData = [],
  volumeData = [],
  completionRate = 0,
  submissionRate = 0,
}: WeeklyReportChartProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 운동 완료도 - Bar Chart */}
      {workoutData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              주간 운동 완료도 ({completionRate}%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workoutData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="planned" fill="#e5e7eb" name="계획" />
                <Bar dataKey="completed" fill="#10b981" name="완료" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 운동 강도 추이 - Line Chart */}
      {intensityData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">운동 강도 추이 (RPE)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={intensityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="averageRpe"
                  stroke="#3b82f6"
                  name="평균 RPE"
                  dot
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 식단 제출 현황 - Pie Chart */}
      {dietData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              식단 제출 현황 ({submissionRate}%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dietData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dietData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 부하량 추이 - Area Chart */}
      {volumeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">총 부하량 추이 (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#8b5cf6"
                  name="총 부하"
                  dot={false}
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 통계 요약 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">주간 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">운동 완료도</p>
              <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">식단 제출률</p>
              <p className="text-2xl font-bold text-blue-600">{submissionRate}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-muted-foreground">데이터</p>
              <p className="text-sm mt-2">
                운동: {workoutData.length}일 | 식단: {dietData.length} 타입
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
