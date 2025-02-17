import React from "react"
import Signup from "./components/Signup"
import Login from "./components/Login"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CreateAccForm } from "./components/CreateAccForm"
import Home from "./components/Home";
import './index.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/createAccount" element={<CreateAccForm />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
