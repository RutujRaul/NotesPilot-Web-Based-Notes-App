import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Login from './components/Login';
import Notes from './components/Notes';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import './App.css';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* ✅ Corrected nested route structure for protected notes page */}
        <Route path="/notes" element={<PrivateRoute />}>
          <Route index element={<Notes />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
