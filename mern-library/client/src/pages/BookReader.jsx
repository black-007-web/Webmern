import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BookReader = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const token = localStorage.getItem('token');
  const res = await axios.get(`https://api-fable-forest.onrender.com/api/user/read/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBook(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading book');
      }
    };
    fetchBook();
  }, [bookId]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!book) return <p>Loading book...</p>;

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <h2>{book.title}</h2>
      <iframe
        src={book.pdfUrl}
        width="100%"
        height="600px"
        style={{ border: 'none' }}
        title={book.title}
      ></iframe>
    </div>
  );
};

export default BookReader;
