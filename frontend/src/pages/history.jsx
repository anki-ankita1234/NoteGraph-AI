
import { useEffect, useState } from "react";

function History({ onBack }) {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5001/history")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load history");
        }
        return response.json();
      })
      .then((data) => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => {
        setError("History load nahi ho paayi. Please backend check karo.");
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        ← Back
      </button>

      <h1 style={styles.heading}>📚 Analysis History</h1>
      <p style={styles.subtitle}>
        View your previously saved notes and knowledge graphs.
      </p>

      {loading && <p>Loading history...</p>}

      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && history.length === 0 && (
        <div style={styles.card}>
          <h3>No History Found</h3>
          <p>Analyze some notes to see your history here.</p>
        </div>
      )}

      <div style={styles.list}>
        {history.map((item) => (
          <div key={item.id} style={styles.card}>
            <h3>{item.title}</h3>

            <p style={styles.date}>
              📅 {item.created_at}
            </p>

            <p>
              🧠 {item.concepts?.length || 0} Concepts
              {" | "}
              🔗 {item.relationships?.length || 0} Relationships
            </p>

            <button
              style={styles.viewButton}
              onClick={() => setSelected(item)}
            >
              View Analysis
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div style={styles.details}>
          <h2>📝 {selected.title}</h2>

          <h3>Original Notes</h3>
          <p style={styles.notes}>{selected.notes}</p>

          <h3>Quick Summary</h3>
          <p>{selected.summary}</p>

          <h3>🧠 Concepts</h3>
          <ul>
            {selected.concepts?.map((concept, index) => (
              <li key={index}>{concept}</li>
            ))}
          </ul>

          <h3>🔗 Relationships</h3>
          <ul>
            {selected.relationships?.map((relationship, index) => (
              <li key={index}>{relationship}</li>
            ))}
          </ul>

          <button
            style={styles.closeButton}
            onClick={() => setSelected(null)}
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "30px auto",
    padding: "25px",
    fontFamily: "Arial, sans-serif",
    color: "#312e45",
  },
  heading: {
    color: "#6d28d9",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#777",
    marginBottom: "25px",
  },
  backButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#ede9fe",
    color: "#5b21b6",
    cursor: "pointer",
    marginBottom: "20px",
  },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "18px",
  },
  card: {
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5ddff",
    background: "#faf9ff",
    marginBottom: "15px",
  },
  date: {
    color: "#777",
    fontSize: "13px",
  },
  viewButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#7c3aed",
    color: "white",
    cursor: "pointer",
    marginTop: "10px",
  },
  details: {
    marginTop: "30px",
    padding: "25px",
    borderRadius: "12px",
    background: "#f5f3ff",
    border: "1px solid #ddd6fe",
    lineHeight: "1.7",
  },
  notes: {
    whiteSpace: "pre-wrap",
    background: "white",
    padding: "15px",
    borderRadius: "8px",
  },
  closeButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#6d28d9",
    color: "white",
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
};

export default History;
