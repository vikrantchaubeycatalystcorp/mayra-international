import type { Metadata } from "next";

// Account pages have no search value; keep them out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
