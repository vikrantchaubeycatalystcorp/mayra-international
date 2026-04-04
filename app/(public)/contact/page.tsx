import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { LiveInquiryCount } from "./LiveInquiryCount";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  GraduationCap,
  Users,
  Award,
  Headphones,
  Quote,
  Star,
  ArrowRight,
  BadgeCheck,
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
    value: "+91 7506799678",
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
    value: "Office No 613, 6th Floor, Satra Plaza, Vashi, Navi Mumbai-400703",
    subtext: "Palm Beach Road, Sector 19D, Maharashtra",
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

const testimonials = [
  {
    name: "Priya Sharma",
    initials: "PS",
    course: "B.Tech Computer Science",
    college: "VIT Vellore",
    city: "Lucknow",
    year: "2025 Batch",
    rating: 5,
    gradient: "from-pink-500 to-rose-500",
    text: "I was so confused after 12th — my parents wanted me in engineering but I didn't know which college to pick. Mayra International's counsellor literally sat with me for 2 hours, understood my JEE score, budget, and hostel preference, and shortlisted 5 colleges. I got into VIT Vellore and I couldn't be happier. Honestly, without their guidance I would've ended up in a random college.",
    highlight: "Got into VIT Vellore with full guidance",
    date: "March 2025",
  },
  {
    name: "Rohit Deshmukh",
    initials: "RD",
    course: "MBA Finance",
    college: "Symbiosis Pune",
    city: "Nagpur",
    year: "2024 Batch",
    rating: 5,
    gradient: "from-blue-500 to-indigo-600",
    text: "After my B.Com, everyone told me MBA is the way to go but nobody explained HOW to get into a good college. I found Mayra International through a friend and they helped me with everything — SNAP exam prep tips, form filling, interview preparation, even negotiating the fee structure. The counsellor Amit sir was available even at 10 PM when I had doubts. This is genuine service.",
    highlight: "Complete MBA admission support",
    date: "January 2025",
  },
  {
    name: "Ananya Krishnan",
    initials: "AK",
    course: "MBBS",
    college: "Kasturba Medical College, Manipal",
    city: "Kochi",
    year: "2024 Batch",
    rating: 5,
    gradient: "from-emerald-500 to-teal-600",
    text: "Getting an MBBS seat is a nightmare — I scored 520 in NEET and thought I'd have to settle for a private college with huge donation. Mayra International showed me options I didn't even know existed. They guided me through the counselling rounds, helped with document verification, and I finally got admitted to Kasturba Medical College. My father still thanks them every time we talk about it.",
    highlight: "MBBS seat without donation pressure",
    date: "November 2024",
  },
  {
    name: "Sahil Mehta",
    initials: "SM",
    course: "B.Des Communication Design",
    college: "MIT Institute of Design, Pune",
    city: "Ahmedabad",
    year: "2025 Batch",
    rating: 5,
    gradient: "from-orange-500 to-amber-600",
    text: "I wanted to pursue design but my family had zero idea about design colleges in India. Most consultants I spoke to only pushed engineering. Mayra International was different — they actually listened, explained the scope of design careers, showed placement records, and helped me prepare my portfolio for MIT ID. Today I'm studying what I love. If you're confused about your career, just talk to them once.",
    highlight: "Found the right creative career path",
    date: "February 2025",
  },
  {
    name: "Fatima Sheikh",
    initials: "FS",
    course: "LLB (5-Year Integrated)",
    college: "Symbiosis Law School, Pune",
    city: "Mumbai",
    year: "2024 Batch",
    rating: 5,
    gradient: "from-purple-500 to-violet-600",
    text: "I filled the inquiry form on this website at 11 PM and got a call the very next morning. The counsellor understood that I wanted law and not just any law college — I wanted a top NLU or Symbiosis. They guided me through CLAT preparation resources, backup options, and the entire admission timeline. I'm now at Symbiosis Law School. The best part? They didn't charge me a single rupee for the counselling.",
    highlight: "Free counselling, premium results",
    date: "September 2024",
  },
  {
    name: "Arjun Reddy",
    initials: "AR",
    course: "M.Tech AI & ML",
    college: "IIIT Hyderabad",
    city: "Visakhapatnam",
    year: "2025 Batch",
    rating: 5,
    gradient: "from-cyan-500 to-blue-600",
    text: "After B.Tech I was confused between working and doing M.Tech. Mayra International helped me see the bigger picture — they showed me salary comparisons, career growth data, and which M.Tech specializations have the best ROI. They even connected me with alumni from IIIT Hyderabad. That one conversation changed my career trajectory. I'd recommend them to anyone who feels lost after graduation.",
    highlight: "Data-driven career decision making",
    date: "March 2025",
  },
];

const statsHighlights = [
  { value: "50,000+", label: "Students Guided" },
  { value: "500+", label: "Partner Colleges" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24hrs", label: "Response Time" },
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
      <section id="inquiry-form" className="pb-20 lg:pb-28 scroll-mt-24">
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
      {/* Student Testimonials Section */}
      <section className="pb-20 lg:pb-28">
        <div className="container mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-medium mb-5">
              <BadgeCheck className="h-4 w-4" />
              Verified Student Reviews
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Hear From{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Real Students
              </span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              These students were once in the same position as you — confused, overwhelmed, and unsure
              about their future. Here&apos;s how Mayra International changed their journey.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {statsHighlights.map((stat) => (
              <div
                key={stat.label}
                className="text-center py-5 px-4 rounded-2xl bg-white border border-gray-100 shadow-sm"
              >
                <p className="text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300 flex flex-col"
              >
                {/* Quote Icon + Rating */}
                <div className="flex items-center justify-between mb-4">
                  <Quote className="h-8 w-8 text-indigo-100" />
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-sm text-gray-600 leading-relaxed mb-5 flex-1">
                  &quot;{t.text}&quot;
                </p>

                {/* Highlight Badge */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-medium">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {t.highlight}
                  </span>
                </div>

                {/* Student Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div
                    className={`h-11 w-11 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg`}
                  >
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      {t.name}
                      <BadgeCheck className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {t.course} &bull; {t.college}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {t.city} &bull; {t.year}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-8 sm:p-10 lg:p-12">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl" />
            </div>

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                  Your Success Story Starts With One Step
                </h3>
                <p className="text-indigo-200 text-sm max-w-lg">
                  Just like Priya, Rohit, Ananya, and thousands of others — fill the inquiry form
                  above and let our expert counsellors guide you to your dream college. It&apos;s
                  100% free.
                </p>
              </div>
              <a
                href="#inquiry-form"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-sm hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 whitespace-nowrap flex-shrink-0"
              >
                Fill Inquiry Form Now
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Mini social proof */}
            <div className="relative mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["PS", "RD", "AK", "SM", "FS"].map((init, i) => (
                    <div
                      key={init}
                      className="h-7 w-7 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ zIndex: 5 - i }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <LiveInquiryCount />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-200">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Counsellors are online now
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="pb-20 lg:pb-28">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Find Us on the{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Map
              </span>
            </h2>
            <p className="text-sm text-gray-500">
              Office No 613, 6th Floor, Satra Plaza, Palm Beach Road, Sector 19D, Vashi, Navi Mumbai - 400703
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
            {/* Map Header Bar */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Our Office Location</p>
                <p className="text-xs text-orange-100">Satra Plaza, Vashi, Navi Mumbai</p>
              </div>
            </div>

            {/* Embedded Map */}
            <div className="relative w-full h-[350px] sm:h-[420px] lg:h-[450px]">
              <iframe
                title="Mayra International Office Location — Satra Plaza, Vashi, Navi Mumbai"
                src="https://maps.google.com/maps?q=Satra+Plaza,+Palm+Beach+Rd,+Sector+19D,+Vashi,+Navi+Mumbai,+Maharashtra+400703&z=17&output=embed"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Map Footer with directions link */}
            <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Office No 613, 6th Floor, Satra Plaza
                  </p>
                  <p className="text-xs text-gray-500">
                    Palm Beach Road, Sector 19D, Vashi, Navi Mumbai - 400703, Maharashtra
                  </p>
                </div>
              </div>
              <a
                href="https://www.google.com/maps/dir//Satra+Plaza,+Palm+Beach+Rd,+Sector+19D,+Vashi,+Navi+Mumbai,+Maharashtra+400703"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              >
                <MapPin className="h-4 w-4" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
