import { useState, useEffect } from "react";
import SDLCAnalyzer from './pages/SDLCAnalyzer';
import LoginRegister from "./components/LoginRegister";
import { app } from "./firebase";


function App() {
const [user, setUser] = useState(sessionStorage.getItem("loggedInUser"));

  useEffect(() => {
    const interval = setInterval(() => {
      const loggedUser = sessionStorage.getItem("loggedInUser");
      if (loggedUser !== user) {
        setUser(loggedUser);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [user]);

  // If user is logged in → show dashboard
  if (user) {
    return <SDLCAnalyzer/>
  }

  // Otherwise → show login/register
  return <LoginRegister />;}

export default App;