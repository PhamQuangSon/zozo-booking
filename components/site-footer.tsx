import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 hidden">
          {/* Logo and about */}
          {/* <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="relative h-10 w-10">
                <Image src="/placeholder-logo.png" alt="Zozo Booking" fill className="object-contain" />
              </div>
              <span className="font-bold text-white text-xl">Zozo Booking</span>
            </Link>
            <p className="mb-4">Order delicious food from your favorite restaurants with our easy-to-use platform.</p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-white">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="hover:text-white">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="hover:text-white">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="hover:text-white">
                <Youtube size={20} />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div> */}

          {/* Quick links */}
          {/* <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/restaurants" className="hover:text-white">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-white">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div> */}

          {/* Contact info */}
          {/* <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5" />
                <span>123 Food Street, Cuisine City, FC 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <span>info@zozobooking.com</span>
              </li>
            </ul>
          </div> */}

          {/* Newsletter */}
          {/* <div>
            <h3 className="text-white font-bold text-lg mb-4">Newsletter</h3>
            <p className="mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                Subscribe
              </button>
            </form>
          </div> */}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} Zozo Booking. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

