import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-7xl px-4 mt-12  ml-4flex flex-col items-center">
        {/* Hero Section with Animation */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 md:p-12 w-full">
          <div className="animate-pulse">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Decentralized Intent-Based Payouts
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Create payment intents and let our decentralized network of
              solvers handle your transactions. Powered by Threshold Key Sharing
              for maximum security and trustlessness.
            </p>
            <button
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold 
            hover:bg-opacity-90 transition-all shadow-lg"
              onClick={() => {
                navigate("/create");
              }}
            >
              Create Intent
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 bg-white rounded-xl shadow-lg hover:-translate-y-1 transition-all">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Intent-Based System</h3>
            <p className="text-gray-600">
              Create flexible payment intents that execute based on your
              specified conditions
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg hover:-translate-y-1 transition-all">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Threshold Key Sharing
            </h3>
            <p className="text-gray-600">
              Enhanced security through distributed key management among trusted
              solvers
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg hover:-translate-y-1 transition-all">
            <div className="h-12 w-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Decentralized Solvers
            </h3>
            <p className="text-gray-600">
              Network of independent solvers ensuring reliable and trustless
              execution
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-20 w-full bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-purple-600 mb-2">1</div>
              <h4 className="font-semibold mb-2">Create Intent</h4>
              <p className="text-sm text-gray-600">
                Define your payment conditions and requirements
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-purple-600 mb-2">2</div>
              <h4 className="font-semibold mb-2">Solver Assignment</h4>
              <p className="text-sm text-gray-600">
                Decentralized solvers are automatically assigned
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
              <h4 className="font-semibold mb-2">Key Distribution</h4>
              <p className="text-sm text-gray-600">
                Threshold keys are securely shared among solvers
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-purple-600 mb-2">4</div>
              <h4 className="font-semibold mb-2">Execution</h4>
              <p className="text-sm text-gray-600">
                Intent is executed when conditions are met
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
