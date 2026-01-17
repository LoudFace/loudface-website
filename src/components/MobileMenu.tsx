import { useState } from 'react';

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  navLinks: NavLink[];
}

export default function MobileMenu({ navLinks }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-16 bg-white z-40">
          <nav className="flex flex-col p-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}

            <div className="flex items-center gap-2 py-2 text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Accepting New Bookings
            </div>

            <a
              href="#contact"
              className="mt-4 inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-[#5046E5] hover:bg-[#3d38b8] rounded-full transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Book an intro call
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
