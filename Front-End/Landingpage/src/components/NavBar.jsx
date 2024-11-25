import logo from "../assets/logo.png";
import { navItems } from "../constants";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleNavbar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80">
      <div className="container px-4 mx-auto relative text-sm">
        {/* Flex container holding both logo and menu button */}
        <div className="flex justify-between items-center border rounded-full border-neutral-700/80 pl-[10px] pt-2 pb-2"> 
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <img className="h-10 w-10 mr-2" src={logo} alt="logo" />
            <span className="text-xl tracking-tight">InterLink</span>
          </div>

          {/* Navigation Items - Hidden on mobile */}
          <ul className="hidden lg:flex mr-[500px] space-x-12">
            {navItems.map((item, index) => (
              <li key={index}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button - Visible on small screens */}
          <div className="lg:hidden pr-4 pl-4">
            <button onClick={toggleNavbar}>
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Items - Conditionally displayed when clicked on small screen/devices */}
        {mobileOpen && (
          <ul className="flex flex-col mt-4 space-y-4 lg:hidden bg-neutral-900 items-end ml-auto md:items-end md:ml-auto">
            {navItems.map((item, index) => (
              <li key={index} className="py-2">
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

