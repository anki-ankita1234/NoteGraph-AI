import "./Home.css";

function Home({ onStart }) {
  return (
    <div className="home">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          🧠 NoteGraph <span>AI</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>

        <button className="login-btn" onClick={onStart}>
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="badge">
            ✨ AI Powered Learning
          </div>

          <h1>
            Turn Your <span>Messy Notes</span>
            <br />
            Into Smart Knowledge
          </h1>

          <p>
            Upload your handwritten or typed notes and let AI
            understand, organize and connect your knowledge
            automatically.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={onStart}
            >
              🚀 Start Organizing
            </button>

            <button className="secondary-btn">
              ▶ See How It Works
            </button>

          </div>
        </div>

        {/* Knowledge Graph Preview */}
        <div className="graph-preview">

          <div className="graph-title">
            <span>Knowledge Graph</span>

            <span className="live">
              ● AI Generated
            </span>
          </div>

          <div className="graph">

            <div className="node node1">
              Machine Learning
            </div>

            <div className="node node2">
              Python
            </div>

            <div className="node node3">
              Neural Networks
            </div>

            <div className="node node4">
              Deep Learning
            </div>

            <div className="node node5">
              AI
            </div>

            <div className="node node6">
              Data Science
            </div>

            <div className="line line1"></div>
            <div className="line line2"></div>
            <div className="line line3"></div>
            <div className="line line4"></div>
            <div className="line line5"></div>

          </div>
        </div>

      </section>

      {/* Features */}
      <section className="features" id="features">

        <h2>
          Everything Your Notes Need
        </h2>

        <p className="section-text">
          NoteGraph AI transforms unorganized information
          into meaningful connections.
        </p>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="icon">📄</div>

            <h3>
              Upload Notes
            </h3>

            <p>
              Upload handwritten, typed or PDF notes easily.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">🤖</div>

            <h3>
              AI Understanding
            </h3>

            <p>
              AI extracts important concepts and topics
              from your notes.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">🕸️</div>

            <h3>
              Knowledge Graph
            </h3>

            <p>
              Automatically connect related concepts
              visually.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">🔍</div>

            <h3>
              Smart Search
            </h3>

            <p>
              Find any concept from your notes instantly.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;