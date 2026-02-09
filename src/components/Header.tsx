"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface NavLink {
  label: string;
  href: string;
}

interface DropdownItem {
  icon: string;
  title: string;
  description: string;
  href: string;
}

interface Dropdown {
  label: string;
  description: string;
  items: DropdownItem[];
  ctaText?: string;
}

const navLinks: NavLink[] = [
  { label: "Our Work", href: "/case-studies" },
  { label: "About us", href: "/about" },
];

const servicesDropdown: Dropdown = {
  label: "Services",
  description: "Everything you need to design, build, and grow in Webflow.",
  items: [
    {
      icon: "/images/Frame-1321316759.svg",
      title: "Webflow Development",
      description:
        "Scalable, AI-enhanced Webflow builds optimized for visibility and performance.",
      href: "/services/webflow",
    },
    {
      icon: "/images/stair-group.svg",
      title: "SEO/AEO",
      description:
        "Visibility strategies that future-proof your search performance.",
      href: "/services/seo-aeo",
    },
    {
      icon: "/images/Frame-1321316760.svg",
      title: "UX/UI Design",
      description: "Conversion-focused design systems built for CRO and search.",
      href: "/services/ux-ui-design",
    },
    {
      icon: "/images/Frame-1321316762-1.svg",
      title: "CRO",
      description: "Data-driven optimization that turns visitors into customers.",
      href: "/services/cro",
    },
    {
      icon: "/images/Frame-1321316761.svg",
      title: "Copywriting",
      description:
        "Persuasive, SEO-optimized content that connects and converts.",
      href: "/services/copywriting",
    },
  ],
  ctaText: "Looking for a new agency partner? Get in touch",
};

const industriesDropdown: Dropdown = {
  label: "Industries",
  description: "Specialized SEO strategies for your sector.",
  items: [
    {
      icon: "/images/arcticons_app-saasu.svg",
      title: "SaaS",
      description:
        "High-performance SEO strategies that scale with your product.",
      href: "/seo-for/saas",
    },
    {
      icon: "/images/arcticons_studysmarter.svg",
      title: "B2B",
      description:
        "Authority-driven SEO strategies that capture high-intent B2B search demand.",
      href: "/seo-for/b2b",
    },
    {
      icon: "/images/arcticons_shopify.svg",
      title: "E-commerce",
      description:
        "Conversion-first SEO built for speed, performance, and measurable ROI.",
      href: "/seo-for/e-commerce",
    },
    {
      icon: "/images/Vector.svg",
      title: "Healthcare",
      description:
        "SEO strategies that communicate care and compliance.",
      href: "/seo-for/healthcare",
    },
  ],
  ctaText: "View all industries →",
};

export function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [timezone, setTimezone] = useState({
    city: "",
    timezone: "",
    time: "",
  });
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update timezone display
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const parts = timeZone.split("/");
        const offset = -now.getTimezoneOffset();
        const hours = Math.floor(Math.abs(offset) / 60);
        const sign = offset >= 0 ? "+" : "-";

        setTimezone({
          city: parts[parts.length - 1]?.replace(/_/g, " ") || "",
          timezone: `GMT${sign}${hours}`,
          time: now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        });
      } catch {
        // Ignore errors
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown) {
        const dropdown = dropdownRefs.current[openDropdown];
        if (dropdown && !dropdown.contains(e.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openDropdown]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Clean up hover timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleDropdownEnter = (name: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(name);
  };

  const handleDropdownLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const toggleMobileAccordion = (name: string) => {
    setMobileAccordion(mobileAccordion === name ? null : name);
  };

  const renderDropdown = (dropdown: Dropdown, name: string) => (
    <div
      ref={(el) => {
        dropdownRefs.current[name] = el;
      }}
      className={`group relative dropdown-container ${openDropdown === name ? "is-open" : ""}`}
      onMouseEnter={() => handleDropdownEnter(name)}
      onMouseLeave={handleDropdownLeave}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown(name);
        }}
        className={`nav-link flex items-center gap-1.5 px-3 py-2 text-nav font-sans font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-50 ${openDropdown === name ? "bg-surface-50 text-surface-900" : ""} rounded-lg transition-colors cursor-pointer bg-transparent border-none`}
        aria-expanded={openDropdown === name}
        aria-haspopup="true"
      >
        {dropdown.label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${openDropdown === name ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className={`absolute top-full left-1/2 pt-2 w-dropdown z-50 transition-all duration-200 ${
          openDropdown === name
            ? "opacity-100 visible -translate-x-1/2 translate-y-0 pointer-events-auto"
            : "opacity-0 invisible -translate-x-1/2 -translate-y-2 pointer-events-none"
        }`}
        role="menu"
      >
        <div
          className={`bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden transition-transform duration-200 ${
            openDropdown === name ? "scale-100" : "scale-[0.98]"
          }`}
        >
          <div className="p-6">
            <div className="pb-4">
              <h4 className="text-sm font-semibold text-surface-900">
                {dropdown.label}
              </h4>
              <p className="text-2xs text-surface-500 mt-1">
                {dropdown.description}
              </p>
            </div>
            <div className="h-px bg-surface-100 -mx-6 mb-4" />
            <div className="grid gap-1">
              {dropdown.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-start gap-3 p-2.5 -mx-1 rounded-xl hover:bg-surface-50 transition-colors duration-150 no-underline"
                  role="menuitem"
                  onClick={() => setOpenDropdown(null)}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-surface-100 group-hover:bg-surface-200 rounded-lg transition-colors duration-150">
                    <Image
                      src={item.icon}
                      alt=""
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <span className="block text-sm font-medium text-surface-900">
                      {item.title}
                    </span>
                    <span className="block text-2xs text-surface-500 mt-0.5 leading-snug">
                      {item.description}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {dropdown.ctaText && (
              <>
                <div className="h-px bg-surface-100 -mx-6 mt-4 mb-4" />
                <button
                  type="button"
                  data-cal-trigger
                  className="w-full text-2xs py-2.5 px-4 rounded-lg bg-surface-900 hover:bg-surface-800 transition-colors duration-150 inline-flex items-center justify-center gap-1 font-medium border-none cursor-pointer"
                  onClick={() => setOpenDropdown(null)}
                >
                  <span className="text-surface-400">
                    Looking for a new agency partner?
                  </span>
                  <span className="text-white">Get in touch →</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-surface-100/80">
      <div className="py-3.5 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-8">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center gap-10">
              <Link
                href="/"
                className="flex items-center flex-shrink-0 cursor-pointer"
                aria-label="LoudFace Home"
              >
                <Image
                  src="/images/loudface.svg"
                  width={133}
                  height={26}
                  alt="LoudFace"
                  className="h-6.5 w-auto"
                  priority
                />
              </Link>

              {/* Desktop Navigation */}
              <nav
                className="hidden lg:flex items-center gap-2"
                aria-label="Main navigation"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="nav-link flex items-center px-3 py-2 text-nav font-sans font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {renderDropdown(servicesDropdown, "services")}
                {renderDropdown(industriesDropdown, "industries")}
              </nav>
            </div>

            {/* Right: Status, Timezone, CTA */}
            <div className="flex items-center gap-5">
              {/* Status Badge */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-surface-50 rounded-full">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                <span className="text-2xs font-medium text-surface-600">
                  Accepting Bookings
                </span>
              </div>

              {/* Timezone */}
              <div className="hidden xl:flex text-2xs text-surface-400 gap-1.5 tabular-nums">
                <span>{timezone.city}</span>
                <span>{timezone.timezone}</span>
                <span className="text-surface-300">·</span>
                <span className="font-medium text-surface-500">
                  {timezone.time}
                </span>
              </div>

              {/* Divider */}
              <div className="hidden lg:block w-px h-5 bg-surface-200" />

              {/* CTA Button */}
              <button
                type="button"
                data-cal-trigger
                className="hidden lg:inline-flex items-center justify-center px-5 py-2 bg-surface-900 text-white text-sm font-sans font-medium rounded-full hover:bg-surface-800 active:scale-[0.98] transition-all duration-150 border-none cursor-pointer focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
              >
                Book an intro call
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="nav-burger lg:hidden relative flex items-center justify-center w-10 h-10 -mr-1 bg-transparent border-none cursor-pointer rounded-xl hover:bg-surface-100 active:bg-surface-200 transition-colors duration-150"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <div className="relative w-[18px] h-3">
                  <span
                    className={`absolute left-0 h-0.5 bg-surface-900 rounded-sm transition-all duration-300 ${
                      mobileMenuOpen
                        ? "top-[5px] w-full rotate-45"
                        : "top-0 w-full"
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 bg-surface-900 rounded-sm transition-all duration-300 ${
                      mobileMenuOpen
                        ? "bottom-[5px] left-0 w-full -rotate-45"
                        : "bottom-0 right-0 w-[60%]"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${mobileMenuOpen ? "block" : "hidden"} fixed top-[61px] inset-x-0 h-[calc(100dvh-61px)] bg-white overflow-y-auto z-40 lg:!hidden`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className="p-6" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block py-4 text-lg font-medium text-surface-900 no-underline border-b border-surface-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Services Accordion */}
          <div className="border-b border-surface-100">
            <button
              type="button"
              onClick={() => toggleMobileAccordion("services")}
              className="flex items-center justify-between w-full py-4 text-lg font-medium text-surface-900 bg-transparent border-none cursor-pointer text-left"
              aria-expanded={mobileAccordion === "services"}
            >
              <span>Services</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === "services" ? "rotate-180" : ""}`}
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div
              className={`pb-4 ${mobileAccordion === "services" ? "block" : "hidden"}`}
            >
              {servicesDropdown.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center gap-3 py-3 text-base text-surface-700 no-underline hover:text-surface-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-b border-surface-100">
            <button
              type="button"
              onClick={() => toggleMobileAccordion("industries")}
              className="flex items-center justify-between w-full py-4 text-lg font-medium text-surface-900 bg-transparent border-none cursor-pointer text-left"
              aria-expanded={mobileAccordion === "industries"}
            >
              <span>Industries</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === "industries" ? "rotate-180" : ""}`}
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div
              className={`pb-4 ${mobileAccordion === "industries" ? "block" : "hidden"}`}
            >
              {industriesDropdown.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center gap-3 py-3 text-base text-surface-700 no-underline hover:text-surface-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              data-cal-trigger
              className="w-full inline-flex items-center justify-center px-5 py-2.5 bg-surface-900 text-white text-sm font-medium rounded-lg hover:bg-surface-800 transition-colors border-none cursor-pointer focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book an intro call
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
