function Footer() {
  return (
    <footer className="bg-[#041633] text-gray-300 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-gray-500">
          
          {/* Contact Us */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              Contact Us
            </h4>

            <p className="text-sm">
              Email: support@flights.com
            </p>

            <p className="text-sm mt-3">
              Phone: 1-800-FLIGHTS
            </p>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              Social Media
            </h4>

            <div className="space-y-3">
              <a
                href="#"
                className="block text-sm text-gray-500 hover:text-white transition"
              >
                Facebook
              </a>

              <a
                href="#"
                className="block text-sm text-gray-500 hover:text-white transition"
              >
                Messenger
              </a>

              <a
                href="#"
                className="block text-sm text-gray-500 hover:text-white transition"
              >
                Viber
              </a>
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              Address
            </h4>

            <p className="text-sm uppercase">
              JOHN SMITH, 123 MAIN STREET, SUITE 678,
              <br />
              OTTAWA, ON K1A 0B1, CANADA
            </p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          <p>&copy; 2026 Flight Booking. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;