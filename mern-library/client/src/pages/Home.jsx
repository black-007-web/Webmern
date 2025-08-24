import React from 'react';

const books = {
  Horror: [
    {
      title: "The Haunting of Hill House",
      author: "Shirley Jackson",
      image: "https://covers.openlibrary.org/b/id/8162601-L.jpg",
    },
    {
      title: "Pet Sematary",
      author: "Stephen King",
      image: "https://covers.openlibrary.org/b/id/8231654-L.jpg",
    },
    {
      title: "The Silent Patient",
      author: "Alex Michaelides",
      image: "https://covers.openlibrary.org/b/id/10543729-L.jpg",
    },
  ],
  Comedy: [
    {
      title: "Yes Please",
      author: "Amy Poehler",
      image: "https://covers.openlibrary.org/b/id/8231601-L.jpg",
    },
    {
      title: "Me Talk Pretty One Day",
      author: "David Sedaris",
      image: "https://covers.openlibrary.org/b/id/8231923-L.jpg",
    },
    {
      title: "Is Everyone Hanging Out Without Me?",
      author: "Mindy Kaling",
      image: "https://covers.openlibrary.org/b/id/10543820-L.jpg",
    },
  ],
  Fiction: [
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      image: "https://covers.openlibrary.org/b/id/8226091-L.jpg",
    },
    {
      title: "The Book Thief",
      author: "Markus Zusak",
      image: "https://covers.openlibrary.org/b/id/8231627-L.jpg",
    },
    {
      title: "The Night Circus",
      author: "Erin Morgenstern",
      image: "https://covers.openlibrary.org/b/id/8231642-L.jpg",
    },
  ],
};

const Home = () => {
  return (
    <div
      className="home-container"
      style={{ background: "linear-gradient(to bottom right, #f0f7ff, #e4f4ea)" }}
    >
      <h2 style={{ fontSize: "2.8rem", color: "#1abc9c", letterSpacing: "1.5px" }}>
        🌲 Welcome to <span style={{ color: "#34495e" }}>Fable Forest</span>
      </h2>
      <p
        style={{
          fontSize: "1.3rem",
          color: "#555",
          maxWidth: "720px",
          margin: "auto",
          marginBottom: "40px",
        }}
      >
        Explore genres, discover hidden gems, and lose yourself in a forest of timeless
        stories. ✨
      </p>

      {Object.entries(books).map(([genre, bookList]) => (
        <section className="genre-section" key={genre}>
          <h2 className="genre-title">{genre} 📚</h2>
          <div className="books-horizontal-scroll">
            {bookList.map((book, index) => (
              <div className="book-card" key={index}>
                <img
                  className="book-image"
                  src={book.image}
                  alt={book.title}
                  loading="lazy"
                />
                <h4>{book.title}</h4>
                <p>{book.author}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* 👇 About Us Section */}
      <section
        className="about-us"
        style={{
          margin: "60px auto",
          padding: "40px 20px",
          maxWidth: "800px",
          textAlign: "center",
          background: "#ffffff",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ fontSize: "2rem", color: "#1abc9c", marginBottom: "15px" }}>
          About Us 🌟
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#444", lineHeight: "1.8" }}>
          At <strong>Fable Forest</strong>, we believe that every book is a doorway to
          another world. Our mission is to cultivate a community of readers where
          imagination thrives and knowledge grows. Whether you love horror, comedy,
          or timeless fiction, you’ll find a story here that speaks to your soul. 📖✨
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>📬 Connect with us:</p>
          <div className="footer-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/145/145802.png"
                alt="Facebook"
                className="footer-icon-img"
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                alt="Instagram"
                className="footer-icon-img"
              />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X Twitter"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/5968/5968830.png"
                alt="X Twitter"
                className="footer-icon-img"
              />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <small>© {new Date().getFullYear()} Fable Forest Library. All rights reserved.</small>
        </div>
      </footer>
    </div>
  );
};

export default Home;
