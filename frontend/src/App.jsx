
import { useState } from "react";

import Home from "./pages/home";
import UploadNotes from "./pages/uploadnotes";
import GraphPage from "./pages/graphpage";
import History from "./pages/history";

function App() {
  const [page, setPage] = useState("home");
  const [graphData, setGraphData] = useState(null);

  if (page === "home") {
    return (
      <>
        <div style={{ textAlign: "right", padding: "15px 25px" }}>
          <button
            onClick={() => setPage("history")}
            style={{
              padding: "10px 16px",
              background: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            📚 Analysis History
          </button>
        </div>

        <Home onStart={() => setPage("upload")} />
      </>
    );
  }

  if (page === "upload") {
    return (
      <UploadNotes
        onViewGraph={(data) => {
          setGraphData(data);
          setPage("graph");
        }}
      />
    );
  }

  if (page === "graph") {
    return (
      <GraphPage
        graphData={graphData}
        onBack={() => setPage("upload")}
      />
    );
  }

  if (page === "history") {
    return <History onBack={() => setPage("home")} />;
  }

  return null;
}

export default App;
