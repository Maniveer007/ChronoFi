import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

const SideNavBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Determine if the screen is mobile

  const navItems = [
    { name: "Create", href: "/create" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Transactions", href: "/transactions" },
    { name: "Faucet", href: "/faucet" },
    { name: "VerifyGoldUser", href: "/verify-gold-user" },
  ];
  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    } else {
      setIsOpen(true); // Keep sidebar open on larger screens
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to handle navigation item click
  const handleNavItemClick = () => {
    if (isMobile) {
      setIsOpen(false); // Close sidebar on mobile when nav item is clicked
    }
  };

  return (
    <div className="flex h-screen fixed bg-blue-500 top-0 text-white ">
      {/* Sidebar */}
      <aside
        className={`w-64  h-full transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "fixed" : "relative"}`}
      >
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-blue-600 cursor-pointer">
            <Link to="/" className="no-underline text-blue-600">
              Project
            </Link>
          </h2>
          {isMobile &&
            isOpen && ( // Only show X on mobile and when sidebar is open
              <a
                onClick={toggle}
                className="text-3xl cursor-pointer text-black "
                aria-label="Close sidebar"
              >
                ✖ {/* X icon to close sidebar */}
              </a>
            )}
        </div>

        {(isOpen || !isMobile) && ( // Show nav items if open or on larger screens
          <nav className="mt-8">
            {navItems.map((item) => (
              <Link key={item.name} to={item.href}>
                <button
                  onClick={handleNavItemClick} // Close sidebar on nav item click
                  className="flex items-center w-full text-left px-4 py-5 text-gray-700 hover:bg-blue-100"
                >
                  {item.name}
                </button>
              </Link>
            ))}
          </nav>
        )}

        {(isOpen || !isMobile) && ( // Show nav items if open or on larger screens
          <nav className="mt-8">
            <DynamicWidget />
          </nav>
        )}
      </aside>

      {/* Hamburger icon for mobile view */}
      {isMobile && !isOpen && (
        <div className="p-4">
          <a
            onClick={toggle}
            className="text-3xl cursor-pointer"
            aria-label="Open sidebar"
          >
            ☰ {/* Hamburger icon */}
          </a>
        </div>
      )}
    </div>
  );
};

export default SideNavBar;
