"use client";

import { AuthProvider } from "@/components/AuthProvider";
import LoginGate from "@/components/LoginGate";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <LoginGate>{children}</LoginGate>
    </AuthProvider>
  );
}
