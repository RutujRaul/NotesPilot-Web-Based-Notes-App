import React from 'react';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">NotesPilot - Web Based Notes App</h1>
        <p className="home-caption">Navigate Your Notes</p>
      </div>
      <footer className="home-footer">© {new Date().getFullYear()} All Rights Reserved</footer>
    </div>
  );
}

export default Home;
