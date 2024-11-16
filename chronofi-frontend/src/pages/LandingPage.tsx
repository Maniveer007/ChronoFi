import React, { FC } from "react";
import { Link } from "react-router-dom";

const LandingPage: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full mt-32 ">
      <h1 className="text-5xl font-bold mb-6 text-white">Web3 AutoPay</h1>
      <p className="text-xl mb-8 text-center max-w-md text-white">
        Simplify your recurring payments with blockchain technology. Secure,
        transparent, and efficient.
      </p>
      <Link to="/home">
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-3  rounded-xl">
          Enter App
        </button>
      </Link>
    </div>
  );
};

export default LandingPage;
