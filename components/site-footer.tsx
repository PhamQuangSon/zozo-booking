export function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="border-t border-gray-800 mt-12 pt-6 text-center">
          <p>
            &copy; {new Date().getFullYear()} Zozo Booking. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
