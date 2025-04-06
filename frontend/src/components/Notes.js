import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchNotes();
  }, [token, navigate]);

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
        fetchNotes();
      }
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token }
      });

      if (res.ok) {
        fetchNotes();
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleEdit = (note) => {
    setEditingId(note._id); // 🛠 use _id instead of id
    setEditContent(note.content);
  };

  const handleUpdate = async (id) => {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ content: editContent })
      });

      if (res.ok) {
        setEditingId(null);
        setEditContent('');
        fetchNotes();
      }
    } catch (err) {
      console.error('Error updating note:', err);
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
          <li key={note._id}> {/* ✅ Fix key warning */}
            {editingId === note._id ? (
              <>
                <input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <br />
                <button className="note-btn save" onClick={() => handleUpdate(note._id)}>Save</button>
                <button className="note-btn cancel" onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {note.content}
                <br />
                <small>{new Date(note.timestamp).toLocaleString()}</small>
                <div>
                  <button className="note-btn edit" onClick={() => handleEdit(note)}>Edit</button>
                  <button className="note-btn delete" onClick={() => handleDelete(note._id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notes;
