import { useEffect, useRef } from "react";
import gsap from "gsap";
import "../../stylesheets/navbar.css";

export default function Navbar() {
  const navRef = useRef(null);
  const lastScroll = useRef(0);

  useEffect(() => {
    const nav = navRef.current;
    gsap.set(nav, { y: 0 });

    const onScroll = () => {
      const current = window.scrollY;

      if (current > lastScroll.current && current > 80) {
        // scroll down → hide
        gsap.to(nav, {
          //   x: "-50%",
          y: "-120%",
          duration: 0.5,
          ease: "power3.out",
        });
      } else {
        // scroll up → show
        gsap.to(nav, {
          //   x: "-50%",
          y: "0%",
          duration: 0.5,
          ease: "power3.out",
        });
      }

      lastScroll.current = current;

      if (current > 10) {
        nav.classList.add("nav-scrolled");
      } else {
        nav.classList.remove("nav-scrolled");
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav ref={navRef} className="navbar">
      {/* LEFT — IMAGE LOGO */}
      <div className="navbar-left">
        <div className="logo-wrapper">
          <img src="/logo.png" alt="Logo" />
        </div>
      </div>

      {/* RIGHT — SVG ICON */}
      <div className="navbar-icon">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      </div>
    </nav>
  );
}
