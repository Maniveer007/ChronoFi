import React, { FC } from "react";
import { Link } from "react-router-dom";

const LandingPage: FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center w-full h-full justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient-xy"></div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute h-4 w-4 rounded-full bg-white animate-float-slow top-1/4 left-1/4"></div>
        <div className="absolute h-3 w-3 rounded-full bg-white animate-float-medium top-1/2 left-1/3"></div>
        <div className="absolute h-5 w-5 rounded-full bg-white animate-float-fast top-3/4 left-2/3"></div>
      </div>

      <div className="z-10 text-center px-4">
        <div className="animate-fade-in-up">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-8 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              ChronoFi
            </span>
          </h1>
          <p className="text-2xl md:text-3xl mb-8 text-white/90 font-light max-w-2xl mx-auto leading-relaxed">
            The Future of Decentralized Intent-Based Payments
          </p>
          <p className="text-xl mb-12 text-white/80 max-w-xl mx-auto">
            Experience seamless, secure, and automated crypto payments powered
            by threshold cryptography
          </p>
        </div>

        <Link to="/home">
          <button
            className="relative group px-8 py-4 bg-white rounded-xl text-purple-600 font-bold text-lg 
            hover:bg-opacity-90 transition-all duration-200 animate-fade-in-up animation-delay-300
            hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1"
          >
            Launch App
            <span className="absolute -inset-1 rounded-xl bg-white/30 group-hover:blur-md transition-all duration-200"></span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
