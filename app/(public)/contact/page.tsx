import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  GraduationCap,
  Users,
  Award,
  Headphones,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — Free Career Counselling | Mayra International",
  description:
    "Get free expert guidance for college admissions, entrance exams, and career counselling. Reach out to Mayra International — India's trusted education advisory.",
};

const contactInfo = [
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 8700-XXX-XXX",
    subtext: "Mon-Sat, 9 AM - 7 PM IST",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "info@mayrainternational.com",
    subtext: "We reply within 24 hours",
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: MapPin,
    label: "Visit Us",
    value: "New Delhi, India",
    subtext: "By appointment only",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Mon - Sat: 9 AM - 7 PM",
    subtext: "Sunday: Closed",
    color: "from-green-500 to-emerald-600",
  },
];

const reasons = [
  {
    icon: GraduationCap,
    title: "Expert Guidance",
    desc: "Get personalized advice from experienced education counsellors for your dream career.",
  },
  {
    icon: Users,
    title: "50,000+ Students Helped",
    desc: "Trusted by thousands of students and parents across India for college admissions.",
  },
  {
    icon: Award,
    title: "Top College Network",
    desc: "Partnerships with 500+ colleges and universities for guaranteed placement support.",
  },
  {
    icon: Headphones,
    title: "Free Counselling",
    desc: "No charges for initial consultation. We guide you at every step of your journey.",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-20">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-100/40 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="container mx-auto relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6">
              <Headphones className="h-4 w-4" />
              We&apos;re here to help
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Get in{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              Have questions about admissions, courses, or career paths?
              Our expert counsellors are ready to guide you towards your dream college.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
            {contactInfo.map((item) => (
              <div
                key={item.label}
                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`inline-flex h-11 w-11 rounded-xl bg-gradient-to-br ${item.color} items-center justify-center mb-4 shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-gray-800 mb-0.5">
                  {item.value}
                </p>
                <p className="text-xs text-gray-400">{item.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Why Choose Us */}
      <section className="pb-20 lg:pb-28">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 max-w-6xl mx-auto">
            {/* Form — takes 3 cols */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
                {/* Form header */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 px-8 py-6">
                  <h2 className="text-xl font-bold text-white">
                    Student Inquiry Form
                  </h2>
                  <p className="text-indigo-200 text-sm mt-1">
                    Fill in your details and we&apos;ll connect you with an expert counsellor
                  </p>
                </div>
                {/* Client form component */}
                <div className="p-6 sm:p-8">
                  <ContactForm />
                </div>
              </div>
            </div>

            {/* Why Choose Us — takes 2 cols */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Why Students Trust Us
                </h3>
                <p className="text-sm text-gray-500">
                  Join thousands of students who found their perfect college with our guidance.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {reasons.map((r) => (
                  <div
                    key={r.title}
                    className="group flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 flex items-center justify-center flex-shrink-0 group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors">
                      <r.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm mb-0.5">
                        {r.title}
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {r.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust badge */}
              <div className="mt-auto p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">4.8/5 Rating</p>
                    <p className="text-[11px] text-gray-500">from 2,500+ students</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed italic">
                  &quot;Mayra International helped me get into my dream engineering college.
                  Their counsellors are amazing!&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
