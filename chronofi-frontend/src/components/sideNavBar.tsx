import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { FiMenu, FiX, FiHome, FiPlus, FiDatabase, FiDollarSign, FiUserCheck } from "react-icons/fi"; // Modern icons

const SideNavBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const navItems = [
    { name: "Create", href: "/create", icon: <FiPlus /> },
    { name: "Dashboard", href: "/dashboard", icon: <FiDatabase /> },
    { name: "Transactions", href: "/transactions", icon: <FiDollarSign /> },
    { name: "Faucet", href: "/faucet", icon: <FiDollarSign /> },
    { name: "Verify Gold User", href: "/verify-gold-user", icon: <FiUserCheck /> },
  ];

  const toggle = () => setIsOpen((prev) => !prev);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavItemClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex h-screen fixed top-0 bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`z-50 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-xl h-full transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "fixed" : "relative"} w-64 rounded-r-xl`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">
            <Link to="/" className="no-underline">
              MyApp
            </Link>
          </h2>
          {isMobile && isOpen && (
            <button
              onClick={toggle}
              className="text-white text-2xl focus:outline-none"
              aria-label="Close sidebar"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center">
            <img
              src="https://via.placeholder.com/80"
              alt="Profile"
              className="rounded-full"
            />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">John Doe</h3>
          <p className="text-sm text-gray-200">Gold Member</p>
        </div>

        {/* Navigation Items */}
        <nav className="mt-8">
          {navItems.map((item) => (
            <Link key={item.name} to={item.href}>
              <button
                onClick={handleNavItemClick}
                className="flex items-center w-full px-6 py-4 text-white hover:bg-white hover:text-blue-600 transition duration-300 rounded-lg"
              >
                <span className="mr-4 text-xl">{item.icon}</span>
                <span className="text-lg font-medium">{item.name}</span>
              </button>
            </Link>
          ))}
        </nav>

        {/* Dynamic Widget */}
        <div className="mt-auto p-4">
          <DynamicWidget />
        </div>
      </aside>

      {/* Hamburger Icon */}
      {isMobile && !isOpen && (
        <button
          onClick={toggle}
          className="p-4 text-3xl text-blue-600 focus:outline-none"
          aria-label="Open sidebar"
        >
          <FiMenu />
        </button>
      )}
    </div>
  );
};

export default SideNavBar;
