import React from "react"
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CreateAccForm } from "./components/CreateAccForm"
import Home from "./components/Home";
import './index.css'
import Transactionform from "./components/Transactionform";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/createAccount" element={<CreateAccForm />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/transaction" element={<Transactionform />} />
      </Routes>
    </Router>
  )
}

export default App
