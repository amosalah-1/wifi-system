import { Phone, MessageCircle } from "lucide-react";

export function Footer() {
  const phoneNumber = "0769599129";
  const whatsappNumber = "0769599129";

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-bold mb-4">CONTACT US</h3>
            <div className="space-y-3">
              <a
                href={`tel:${phoneNumber}`}
                className="flex items-center gap-2 hover:text-gray-200 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{phoneNumber}</span>
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: {whatsappNumber}</span>
              </a>
            </div>
          </div>

          {/* About Us */}
          <div>
            <h3 className="text-lg font-bold mb-4">About Us</h3>
            <p className="text-sm text-primary-foreground/80">
              Oloika WiFi provides ultra-fast, cheap, and reliable internet
              connectivity for everyone.
            </p>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="text-lg font-bold mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-gray-200 transition-colors">
                  Hourly Plans
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-200 transition-colors">
                  Daily Plans
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-200 transition-colors">
                  Weekly Plans
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-200 transition-colors">
                  Monthly Plans
                </a>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-lg font-bold mb-4">FAQ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-gray-200 transition-colors">
                  How to connect?
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-200 transition-colors">
                  Payment methods
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-200 transition-colors">
                  Plan duration
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-200 transition-colors">
                  Lost connection?
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/20 pt-8">
          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; 2026 Oloika WiFi. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-gray-200 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-200 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
