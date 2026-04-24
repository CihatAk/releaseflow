"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, TrendingDownIcon, TargetIcon, CalendarIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface BurndownData {
  day: string;
  ideal: number;
  actual: number;
  remaining: number;
}

export default function BurndownPage() {
  const [days, setDays] = useState(14);
  
  const mockData: BurndownData[] = Array.from({ length: days }, (_, i) => {
    const ideal = Math.round(100 - (100 / days) * i);
    const actual = i < days - 3 
      ? Math.round(100 - (100 / days) * i * (0.8 + Math.random() * 0.4))
      : 0;
    return {
      day: `Day ${i + 1}`,
      ideal,
      actual,
      remaining: actual,
    };
  });

  const maxValue = 100;
  const currentRemaining = mockData[mockData.length - 3]?.remaining || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Burndown Chart</h1>
            <p className="text-gray-600">Track work remaining for release</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[7, 14, 21, 30].map((d) => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(d)}
            >
              {d} Days
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TargetIcon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentRemaining}</p>
                  <p className="text-sm text-gray-500">Remaining Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingDownIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{100 - currentRemaining}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{3}</p>
                  <p className="text-sm text-gray-500">Days Left</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Release Burndown</CardTitle>
            <CardDescription>Ideal vs actual progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 relative">
              {/* Y-axis */}
              <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>
              
              {/* Chart */}
              <div className="ml-14 h-full relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-b border-gray-100 w-full" />
                  ))}
                </div>
                
                {/* Ideal line */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    points={mockData.map((d, i) => {
                      const x = (i / (mockData.length - 1)) * 100;
                      const y = ((maxValue - d.ideal) / maxValue) * 100;
                      return `${x},${y}`;
                    }).join(" ")}
                  />
                </svg>
                
                {/* Actual line */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    points={mockData.map((d, i) => {
                      const x = (i / (mockData.length - 1)) * 100;
                      const y = ((maxValue - d.actual) / maxValue) * 100;
                      return `${x},${y}`;
                    }).join(" ")}
                  />
                </svg>
                
                {/* Data points */}
                {mockData.map((d, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-blue-500 rounded-full -translate-x-1.5"
                    style={{
                      left: `${(i / (mockData.length - 1)) * 100}%`,
                      top: `${((maxValue - d.actual) / maxValue) * 100}%`,
                    }}
                    title={`${d.day}: ${d.actual} remaining`}
                  />
                ))}
              </div>
              
              {/* X-axis */}
              <div className="absolute bottom-0 left-14 right-0 flex justify-between text-xs text-gray-400">
                <span>Day 1</span>
                <span>Day {Math.floor(days / 2)}</span>
                <span>Day {days}</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex gap-6 mt-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-gray-300 border-dashed" />
                <span className="text-sm text-gray-500">Ideal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-blue-500" />
                <span className="text-sm text-gray-500">Actual</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}