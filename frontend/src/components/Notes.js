import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Notes.css'; // ✅ Import the CSS

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchNotes = async () => {
      try {
        const res = await fetch('http://localhost:5000/notes', {
          headers: { Authorization: token }
        });
        const data = await res.json();
        setNotes(data);
      } catch (err) {
        console.error('Error fetching notes:', err);
      }
    };

    fetchNotes();
  }, [token, navigate]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        setContent('');
        // Fetch updated notes after adding
        const updated = await fetch('http://localhost:5000/notes', {
          headers: { Authorization: token }
        });
        const data = await updated.json();
        setNotes(data);
      }
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="notes-container">
      <button onClick={handleLogout} className="logout-btn">Logout</button>
      <h2>My Notes</h2>
      <form onSubmit={handleAddNote} className="notes-form">
        <input
          type="text"
          placeholder="Write your note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit">Add Note</button>
      </form>
      <ul className="notes-list">
        {notes.map(note => (
          <li key={note.id}>
            {note.content}
            <br />
            <small>{new Date(note.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notes;
