"use client";

import React, { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function ClientOnly({
  children,
  fallback = <div className="min-h-screen bg-slate-50" />,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isServer = useSyncExternalStore(
    emptySubscribe,
    () => false, // Client snapshot
    () => true   // Server snapshot
  );

  if (isServer) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
