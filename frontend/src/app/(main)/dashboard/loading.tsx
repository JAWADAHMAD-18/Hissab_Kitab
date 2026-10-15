import React from "react";

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 flex flex-col gap-8 animate-pulse">
      {/* Top row skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-48 h-10 bg-surface border border-border rounded-xl" />
        <div className="flex gap-3">
          <div className="w-32 h-10 bg-surface border border-border rounded-xl" />
          <div className="w-32 h-10 bg-surface border border-border rounded-xl" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-28 bg-surface border border-border rounded-2xl p-6" />
        <div className="h-28 bg-surface border border-border rounded-2xl p-6" />
        <div className="h-28 bg-surface border border-border rounded-2xl p-6" />
      </div>

      {/* Runway skeleton */}
      <div className="h-24 bg-surface border border-border rounded-2xl p-6" />

      {/* Main grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 bg-surface border border-border rounded-2xl p-6" />
        <div className="h-80 bg-surface border border-border rounded-2xl p-6" />
      </div>
    </div>
  );
}
