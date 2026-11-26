
import { useMemo, useState } from "react";
import "./graphpage.css";

function GraphPage({ graphData, onBack }) {
  const [search, setSearch] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);

  const concepts = graphData?.concepts || [];
  const relationships = graphData?.relationships || [];
  const notes = graphData?.notes || "";

  // Parse relationships
  const edges = useMemo(() => {
    return relationships
      .map((item) => {
        const parts = String(item)
          .split("→")
          .map((part) => part.trim());

        if (parts.length >= 3) {
          return {
            source: parts[0],
            relation: parts.slice(1, -1).join(" → "),
            target: parts[parts.length - 1],
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [relationships]);

  // Create graph nodes
  const nodes = useMemo(() => {
    return [
      ...new Set([
        ...concepts,
        ...edges.flatMap((edge) => [
          edge.source,
          edge.target,
        ]),
      ]),
    ];
  }, [concepts, edges]);

  // Arrange nodes in a circle
  const positionedNodes = useMemo(() => {
    const centerX = 450;
    const centerY = 300;
    const radius = nodes.length <= 2 ? 120 : 215;

    return nodes.map((name, index) => {
      const angle =
        -Math.PI / 2 +
        (index * 2 * Math.PI) / Math.max(nodes.length, 1);

      return {
        name,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [nodes]);

  const getPosition = (name) =>
    positionedNodes.find((node) => node.name === name);

  // Quick Summary
  const summary = useMemo(() => {
    const sentences = notes
      .split(/(?<=[.!?])\s+|\n+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    const ranked = sentences
      .map((sentence, index) => ({
        sentence,
        index,
        score: concepts.reduce(
          (count, concept) =>
            count +
            (sentence.toLowerCase().includes(
              concept.toLowerCase()
            ) ? 1 : 0),
          0
        ),
      }))
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score || a.index - b.index
      )
      .slice(0, 4)
      .sort((a, b) => a.index - b.index);

    return ranked.length
      ? ranked.map((item) => item.sentence)
      : sentences.slice(0, 3);
  }, [notes, concepts]);

  // Search
  const filteredConcepts = concepts.filter((concept) =>
    concept.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRelationships = relationships.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  // Selected node connections
  const selectedRelationships = selectedNode
    ? edges.filter(
        (edge) =>
          edge.source === selectedNode ||
          edge.target === selectedNode
      )
    : [];

  // Download text report
  const downloadReport = () => {
    const report = [
      "NOTEGRAPH AI - ANALYSIS REPORT",
      "",
      "QUICK SUMMARY",
      ...summary,
      "",
      "EXTRACTED CONCEPTS",
      ...concepts.map((item) => `- ${item}`),
      "",
      "RELATIONSHIPS",
      ...relationships.map((item) => `- ${item}`),
    ].join("\n");

    const blob = new Blob([report], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "NoteGraph-AI-Report.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Download graph as PNG
  const downloadGraphImage = () => {
    const svg = document.querySelector(".knowledge-svg");

    if (!svg) {
      alert("Knowledge Graph is not available.");
      return;
    }

    const clonedSvg = svg.cloneNode(true);

    clonedSvg.setAttribute(
      "xmlns",
      "http://www.w3.org/2000/svg"
    );
    clonedSvg.setAttribute("width", "1200");
    clonedSvg.setAttribute("height", "800");

    const style = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style"
    );

    style.textContent = `
      .graph-edge {
        stroke: #8b5cf6;
        stroke-width: 2.5;
        opacity: 0.75;
      }
      .edge-label {
        fill: #6d28d9;
        font-size: 12px;
        font-weight: 600;
      }
      .node-circle {
        fill: #ede9fe;
        stroke: #8b5cf6;
        stroke-width: 2.5;
      }
      .selected-node {
        fill: #c4b5fd;
        stroke: #5b21b6;
      }
      .node-label {
        fill: #3b0764;
        font-size: 14px;
        font-weight: 700;
      }
    `;

    clonedSvg.insertBefore(style, clonedSvg.firstChild);

    const svgData = new XMLSerializer().serializeToString(
      clonedSvg
    );

    const blob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;

      const context = canvas.getContext("2d");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, 1200, 800);

      context.drawImage(image, 0, 0, 1200, 800);

      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          alert("Image download failed.");
          return;
        }

        const pngUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement("a");

        link.href = pngUrl;
        link.download =
          "NoteGraph-AI-Knowledge-Graph.png";

        link.click();

        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      alert("Unable to create graph image.");
    };

    image.src = url;
  };

  return (
    <main className="graph-page">

      {/* Navbar */}
      <nav className="graph-navbar">
        <div className="logo">
          🧠 NoteGraph <span>AI</span>
        </div>

        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </nav>

      <section className="graph-container">

        {/* Header */}
        <header className="graph-header">
          <div className="graph-badge">
            🕸️ Knowledge Graph
          </div>

          <h1>
            Your Notes <span>Knowledge Graph</span>
          </h1>

          <p>
            Explore concepts and their connections.
          </p>
        </header>

        {/* Statistics */}
        <div className="graph-summary">

          <div className="summary-box">
            <strong>{nodes.length}</strong>
            <span>Concepts Found</span>
          </div>

          <div className="summary-box">
            <strong>{edges.length}</strong>
            <span>Relationships Found</span>
          </div>

          <div className="summary-box">
            <strong>{notes.length}</strong>
            <span>Characters Analyzed</span>
          </div>

        </div>

        {/* Interactive Graph */}
        <section className="extra-feature-card">

          <h2>🕸️ Interactive Knowledge Graph</h2>

          <p>
            Click on any concept to explore its connections.
          </p>

          <button
            className="report-btn"
            onClick={downloadGraphImage}
          >
            📸 Download Graph as PNG
          </button>

          {nodes.length > 0 ? (

            <div className="graph-visual-wrapper">

              <svg
                className="knowledge-svg"
                viewBox="0 0 900 600"
                role="img"
                aria-label="Visual knowledge graph"
              >

                <defs>
                  <marker
                    id="graph-arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="8"
                    refY="3"
                    orient="auto"
                  >
                    <path
                      d="M0,0 L0,6 L9,3 z"
                      fill="#8b5cf6"
                    />
                  </marker>
                </defs>

                {/* Relationship Lines */}
                {edges.map((edge, index) => {
                  const source = getPosition(edge.source);
                  const target = getPosition(edge.target);

                  if (!source || !target) return null;

                  const midX =
                    (source.x + target.x) / 2;

                  const midY =
                    (source.y + target.y) / 2;

                  return (
                    <g key={index}>

                      <line
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        className="graph-edge"
                        markerEnd="url(#graph-arrow)"
                      />

                      <text
                        x={midX}
                        y={midY - 10}
                        className="edge-label"
                        textAnchor="middle"
                      >
                        {edge.relation.length > 20
                          ? edge.relation.slice(0, 20) + "..."
                          : edge.relation}
                      </text>

                    </g>
                  );
                })}

                {/* Concept Nodes */}
                {positionedNodes.map((node) => (

                  <g
                    key={node.name}
                    className="graph-node"
                    onClick={() =>
                      setSelectedNode(node.name)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        setSelectedNode(node.name);
                      }
                    }}
                  >

                    <circle
                      cx={node.x}
                      cy={node.y}
                      rx="78"
                      ry="34"
                      className={
                        selectedNode === node.name
                          ? "node-circle selected-node"
                          : "node-circle"
                      }
                    />

                    <text
                      x={node.x}
                      y={node.y + 5}
                      className="node-label"
                      textAnchor="middle"
                    >
                      {node.name.length > 17
                        ? node.name.slice(0, 15) + "..."
                        : node.name}
                    </text>

                  </g>

                ))}

              </svg>

            </div>

          ) : (
            <p>
              No concepts available. Please analyze your notes first.
            </p>
          )}

          {/* Selected Node Details */}
          {selectedNode && (

            <div className="node-details">

              <h3>🧠 {selectedNode}</h3>

              <p>
                Connections: {selectedRelationships.length}
              </p>

              {selectedRelationships.length > 0 ? (

                selectedRelationships.map((edge, index) => (
                  <p key={index}>
                    {edge.source} → {edge.relation} → {edge.target}
                  </p>
                ))

              ) : (
                <p>
                  No relationships available for this concept.
                </p>
              )}

              <button
                className="report-btn"
                onClick={() => setSelectedNode(null)}
              >
                Close Details
              </button>

            </div>
          )}

        </section>

        {/* Summary */}
        <section className="extra-feature-card">

          <h2>📝 Quick Notes Summary</h2>

          {summary.length ? (
            <ul>
              {summary.map((sentence, index) => (
                <li key={index}>{sentence}</li>
              ))}
            </ul>
          ) : (
            <p>No note text is available for a summary.</p>
          )}

          <p className="feature-note">
            This quick summary selects sentences from your notes;
            it is not a full generative AI summary.
          </p>

        </section>

        {/* Search */}
        <section className="extra-feature-card">

          <h2>🔍 Search Your Knowledge</h2>

          <input
            className="concept-search"
            type="search"
            placeholder="Search a concept or relationship..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <h3>📚 Concepts ({filteredConcepts.length})</h3>

          <div className="concept-tags">

            {filteredConcepts.map((concept) => (
              <span
                className="concept-tag"
                key={concept}
                onClick={() => setSelectedNode(concept)}
              >
                🧠 {concept}
              </span>
            ))}

            {!filteredConcepts.length && (
              <p>No matching concepts.</p>
            )}

          </div>

          <h3 className="relationship-heading">
            🔗 Relationships ({filteredRelationships.length})
          </h3>

          <div className="relationship-list">

            {filteredRelationships.map((item, index) => (
              <div
                className="relationship"
                key={`${item}-${index}`}
              >
                {item}
              </div>
            ))}

            {!filteredRelationships.length && (
              <p>No matching relationships.</p>
            )}

          </div>

        </section>

        {/* Download Report */}
        <section className="extra-feature-card">

          <h2>📥 Save Your Analysis</h2>

          <p>
            Download your summary, concepts and relationships
            as a text report.
          </p>

          <button
            className="report-btn"
            onClick={downloadReport}
          >
            Download Report
          </button>

        </section>

      </section>
    </main>
  );
}

export default GraphPage;
