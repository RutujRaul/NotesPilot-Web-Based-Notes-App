import React from 'react';
import '../styles/AboutUs.css';

function AboutUs() {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About NotesPilot</h1>
        <p>
          NotesPilot is a web-based note-taking application designed to help you capture, manage, and organize your thoughts with ease.
        </p>
        <p>
          Whether you're a student, professional, or a creative mind, NotesPilot gives you a clutter-free, simple, and secure platform to store your notes anytime, anywhere.
        </p>
        <p>
          Built with ❤️ using React, Flask, and MongoDB.
        </p>
      </div>
      <footer className="about-footer">
        © {new Date().getFullYear()} NotesPilot. All Rights Reserved.
      </footer>
    </div>
  );
}

export default AboutUs;
