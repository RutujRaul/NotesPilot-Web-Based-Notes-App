import React, { useState } from 'react';
import '../styles/ContactUs.css';

function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="contact-card">
        <h1>Contact Us</h1>
        <p>We’d love to hear from you. Fill out the form below.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit">Send Message</button>
          {submitted && <p className="success-msg">Thank you! We'll get back to you soon.</p>}
        </form>
      </div>

      <footer className="footer">
        © {new Date().getFullYear()} NotesPilot. All Rights Reserved.
      </footer>
    </div>
  );
}

export default ContactUs;
