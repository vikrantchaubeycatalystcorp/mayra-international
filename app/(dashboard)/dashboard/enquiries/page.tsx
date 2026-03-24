"use client";

import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { cn } from "../../../../lib/utils";

const mockEnquiries = [
  {
    id: "1",
    college: "IIT Bombay",
    program: "B.Tech Computer Science",
    submittedOn: "2025-10-15",
    status: "under_review",
    responseTime: "3–5 business days",
  },
  {
    id: "2",
    college: "IIM Ahmedabad",
    program: "MBA (PGP)",
    submittedOn: "2025-10-10",
    status: "responded",
    responseTime: null,
    response: "Thank you for your interest. Please note that PGP admissions for 2026-28 batch will open in December 2025.",
  },
  {
    id: "3",
    college: "AIIMS Delhi",
    program: "MBBS",
    submittedOn: "2025-09-28",
    status: "rejected",
    responseTime: null,
    response: "AIIMS does not accept direct enquiries. Admissions are solely through NEET UG merit list.",
  },
];

const statusConfig = {
  under_review: { label: "Under Review", icon: Clock, variant: "warning" as const, color: "text-amber-600" },
  responded: { label: "Responded", icon: CheckCircle, variant: "success" as const, color: "text-green-600" },
  rejected: { label: "Closed", icon: XCircle, variant: "destructive" as const, color: "text-red-600" },
};

export default function EnquiriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-6">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-600" />
            My Enquiries ({mockEnquiries.length})
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track your college application enquiries</p>
        </div>
      </div>

      <div className="container mx-auto py-8 max-w-3xl">
        {mockEnquiries.length > 0 ? (
          <div className="space-y-4">
            {mockEnquiries.map((enquiry) => {
              const config = statusConfig[enquiry.status as keyof typeof statusConfig];
              return (
                <div key={enquiry.id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{enquiry.college}</h3>
                      <p className="text-sm text-gray-500">{enquiry.program}</p>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <span>Submitted: {enquiry.submittedOn}</span>
                    {enquiry.responseTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expected: {enquiry.responseTime}
                      </span>
                    )}
                  </div>

                  {enquiry.response && (
                    <div className={cn(
                      "p-3 rounded-xl text-sm",
                      enquiry.status === "responded" ? "bg-green-50 text-green-800 border border-green-100" : "bg-red-50 text-red-800 border border-red-100"
                    )}>
                      <p className="font-medium mb-0.5">College Response:</p>
                      <p>{enquiry.response}</p>
                    </div>
                  )}

                  {enquiry.status === "under_review" && (
                    <div className="flex items-center gap-2 mt-3 p-3 bg-amber-50 rounded-xl text-sm text-amber-700 border border-amber-100">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      Your enquiry is being processed. Expected response in {enquiry.responseTime}.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="h-20 w-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-primary-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Enquiries Yet</h2>
            <p className="text-gray-500 mb-6">
              Submit enquiries to colleges directly from their profile pages
            </p>
            <Link href="/colleges">
              <Button variant="gradient">
                Find Colleges
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
