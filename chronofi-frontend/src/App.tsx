import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import AboutPage from "@/pages/AboutPage.js";
import HomePage from "@/pages/HomePage.js";
import DashBoardPage from "@/pages/DashBoardPage.js";
import VerifyGoldMembership from "@/pages/VerifyGoldMembership.js";
import TransactionsPage from "@/pages/TransactionsPage.js";
import SideNavbar from "@/components/sideNavBar.js";
import CreatePage from "@/pages/CreatePage";
import "./App.css";
import FaucetPage from "@/pages/FaucetPage";
import SubscriptionPage from "@/pages/SubscriptionPage";

function App() {
  return (
    <div className="flex">
      <div className="fixed left-0 top-0 h-full">
        <SideNavbar />
      </div>
      {/* Main content area with left margin to avoid overlap */}
      <div className="flex justify-center items-start w-full h-full text-black bg-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<DashBoardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/verify-gold-user" element={<VerifyGoldMembership />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/faucet" element={<FaucetPage />} />
          <Route path="/:address/:id" element={<SubscriptionPage />} />
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
