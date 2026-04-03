import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Twitter, Linkedin, Youtube, Instagram, Facebook, ShieldCheck, Smartphone, PlayCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const quickLinks = [
  { label: "Top Colleges", href: "/colleges" },
  { label: "Top Exams", href: "/exams" },
  { label: "Courses", href: "/courses" },
  { label: "Study Abroad", href: "/study-abroad" },
  { label: "Compare Colleges", href: "/compare" },
  { label: "News & Articles", href: "/news" },
  { label: "Resume Builder", href: "/resume-builder" },
  { label: "Career Guide", href: "/news?category=Careers" },
];

const topColleges = [
  { label: "IIT Bombay", href: "/colleges/iit-bombay" },
  { label: "IIT Delhi", href: "/colleges/iit-delhi" },
  { label: "IIM Ahmedabad", href: "/colleges/iim-ahmedabad" },
  { label: "AIIMS Delhi", href: "/colleges/aiims-delhi" },
  { label: "IIT Madras", href: "/colleges/iit-madras" },
  { label: "BITS Pilani", href: "/colleges/bits-pilani" },
  { label: "NIT Trichy", href: "/colleges/nit-trichy" },
  { label: "Jadavpur University", href: "/colleges/jadavpur-university" },
];

const topExams = [
  { label: "JEE Main 2026", href: "/exams/jee-main" },
  { label: "JEE Advanced 2026", href: "/exams/jee-advanced" },
  { label: "NEET UG 2026", href: "/exams/neet-ug" },
  { label: "CAT 2025", href: "/exams/cat" },
  { label: "GATE 2026", href: "/exams/gate" },
  { label: "CLAT 2025", href: "/exams/clat" },
  { label: "CUET UG 2026", href: "/exams/cuet-ug" },
  { label: "XAT 2026", href: "/exams/xat" },
];

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-sky-400" },
  { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-400" },
  { icon: Youtube, href: "#", label: "YouTube", color: "hover:text-red-400" },
  { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-400" },
  { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-500" },
];

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/images/mayra-logo-clean.png"
                alt="Mayra logo"
                width={170}
                height={52}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              India&apos;s most trusted education platform. Helping students discover the right college, exam, and career since 2020.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-primary-400" />
                <span>info@mayrainternational.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-primary-400" />
                <span>+91 7506799678</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span>Office No 613, 6th Floor, Satra Plaza, Vashi, Navi Mumbai-400703</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`text-gray-500 transition-colors ${social.color}`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Colleges */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Top Colleges
            </h4>
            <ul className="space-y-2.5">
              {topColleges.map((college) => (
                <li key={college.href}>
                  <Link
                    href={college.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {college.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Exams */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Top Exams
            </h4>
            <ul className="space-y-2.5">
              {topExams.map((exam) => (
                <li key={exam.href}>
                  <Link
                    href={exam.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {exam.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Stay Updated
            </h4>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Get latest exam dates, results, and admission news straight to your inbox.
            </p>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-primary-500"
              />
              <Button variant="gradient" className="w-full">
                Subscribe Free
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              No spam. Unsubscribe anytime.
            </p>

            {/* App Download */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Download App</p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-500 transition-colors">
                  <Smartphone className="h-4 w-4 text-gray-300" />
                  <div>
                    <p className="text-xs text-gray-500 leading-none">Get it on</p>
                    <p className="text-xs font-semibold text-white leading-none">App Store</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-500 transition-colors">
                  <PlayCircle className="h-4 w-4 text-gray-300" />
                  <div>
                    <p className="text-xs text-gray-500 leading-none">Get it on</p>
                    <p className="text-xs font-semibold text-white leading-none">Google Play</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Mayra International. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Terms of Use</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Disclaimer</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Advertise</Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2 py-1 bg-green-900/50 border border-green-700 rounded text-xs text-green-400 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              SSL Secured
            </span>
            <span className="px-2 py-1 bg-blue-900/50 border border-blue-700 rounded text-xs text-blue-400 font-medium">
              ISO 27001
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
