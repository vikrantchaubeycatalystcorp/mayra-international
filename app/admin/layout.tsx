import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal | Mayra International",
    template: "%s | Admin - Mayra",
  },
  description: "Mayra International Admin Portal",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-portal fixed inset-0 z-[100] bg-gray-50 overflow-auto">
      {children}
    </div>
  );
}
