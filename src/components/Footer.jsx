export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            Green Coffee
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            We provide high quality coffee products with a great
            experience for coffee lovers everywhere.
          </p>
        </div>


        {/* Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">
            Quick Links
          </h3>

          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Home</a></li>
            <li><a href="#" className="hover:text-white">Products</a></li>
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>


        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">
            Contact
          </h3>

          <p className="text-sm">
            Kigali, Rwanda
          </p>

          <p className="text-sm mt-2">
            Email: info@greencoffee.com
          </p>

          <p className="text-sm mt-2">
            Phone: +250 700 000 000
          </p>
        </div>


        {/* Social */}
        <div>
          <h3 className="text-white font-semibold mb-4">
            Follow Us
          </h3>

          <div className="flex gap-4">
            <a href="#" className="hover:text-white">
              Facebook
            </a>

            <a href="#" className="hover:text-white">
              Instagram
            </a>

            <a href="#" className="hover:text-white">
              Twitter
            </a>
          </div>
        </div>

      </div>


      {/* Bottom */}
      <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Green Coffee. All rights reserved.
      </div>

    </footer>
  );
}