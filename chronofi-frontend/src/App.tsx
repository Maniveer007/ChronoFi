import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import SideNavbar from "@/components/sideNavBar";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <SideNavbar />
    </>
  );
}

export default App;
