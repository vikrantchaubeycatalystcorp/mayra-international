import type { Metadata } from "next";

// Signed-in student dashboard — private, keep it out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
