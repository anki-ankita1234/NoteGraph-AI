
import { useState } from "react";
import "./UploadNotes.css";

// Render Backend URL
const API_URL = "https://notegraph-ai-backend.onrender.com";

// Ready-made Sample Notes for Project Demo
const sampleNotes = {
  "Artificial Intelligence": `Artificial Intelligence (AI) is a branch of computer science that focuses on creating intelligent machines.

AI systems can perform tasks that normally require human intelligence, such as learning, reasoning, problem-solving and decision-making.

Machine Learning is a subset of AI that allows computers to learn from data without being explicitly programmed.

Deep Learning is a subset of Machine Learning that uses artificial neural networks.

Applications of AI include healthcare, education, robotics, self-driving cars and virtual assistants.`,

  "Machine Learning": `Machine Learning is a branch of Artificial Intelligence that enables computers to learn from data and improve their performance.

There are three main types of Machine Learning.

Supervised Learning uses labeled data for training. Examples include classification and regression.

Unsupervised Learning uses unlabeled data to find hidden patterns. Examples include clustering and association.

Reinforcement Learning trains an agent through rewards and penalties.

Applications include recommendation systems, fraud detection, image recognition and prediction.`,

  "Distributed Systems": `A Distributed System is a collection of independent computers that communicate and work together as a single system.

The main goal is to share resources, improve performance and provide reliability.

Important characteristics include scalability, fault tolerance, concurrency and transparency.

Distributed systems use communication protocols such as HTTP and RPC.

Examples include cloud computing, distributed databases, online banking and content delivery networks.`
};

function UploadNotes({ onViewGraph }) {
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Quiz states
  const [quiz, setQuiz] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Flashcard states
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Gemini AI Chatbot states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const filteredConcepts =
    result?.concepts?.filter((concept) =>
      concept.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const filteredRelationships =
    result?.relationships?.filter((relationship) =>
      relationship.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Reset quiz
  const resetQuiz = () => {
    setQuiz([]);
    setAnswers({});
    setQuizSubmitted(false);
  };

  // Reset flashcards
  const resetFlashcards = () => {
    setFlashcards([]);
    setCurrentCard(0);
    setShowAnswer(false);
  };

  // Reset chatbot
  const resetChat = () => {
    setChatMessages([]);
    setChatQuestion("");
    setChatError("");
  };

  // Load Sample Notes
  const handleSampleNotes = (topic) => {
    setNotes(sampleNotes[topic]);
    setSelectedFile(null);
    setResult(null);
    setSearchTerm("");
    resetQuiz();
    resetFlashcards();
    resetChat();
  };

  // PDF selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);
      setResult(null);
      setSearchTerm("");
      resetQuiz();
      resetFlashcards();
      resetChat();
    }
  };

  // PDF upload
  const handlePDFUpload = async () => {
    if (!selectedFile) {
      alert("Please choose a PDF file first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setSearchTerm("");
    resetQuiz();
    resetFlashcards();
    resetChat();

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_URL}/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setNotes(data.notes);
        setResult(data);
      } else {
        alert(data.message || "PDF analysis failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Backend se connection nahi ho raha. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pasted notes analysis
  const handleGenerate = async () => {
    if (!notes.trim()) {
      alert("Please paste your notes first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setSearchTerm("");
    resetQuiz();
    resetFlashcards();
    resetChat();

    try {
      const response = await fetch(`${API_URL}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        alert(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      alert("Backend se connection nahi ho raha. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate Quiz
  const handleGenerateQuiz = async () => {
    if (!notes.trim()) {
      alert("Please add notes first.");
      return;
    }

    setQuizLoading(true);
    resetQuiz();

    try {
      const response = await fetch(`${API_URL}/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (data.success && data.questions?.length > 0) {
        setQuiz(data.questions);
      } else {
        alert(data.message || "Questions could not be generated from these notes.");
      }
    } catch (error) {
      console.error(error);
      alert("Quiz generate nahi hua. Backend server check karo.");
    } finally {
      setQuizLoading(false);
    }
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (Object.keys(answers).length !== quiz.length) {
      alert("Please attempt all questions before submitting.");
      return;
    }

    setQuizSubmitted(true);
  };

  // Calculate score
  const score = quiz.reduce((total, question, index) => {
    return total + (
      answers[index] === question.answer ? 1 : 0
    );
  }, 0);

  // Generate Flashcards
  const handleGenerateFlashcards = async () => {
    if (!notes.trim()) {
      alert("Please add notes first.");
      return;
    }

    setFlashcardLoading(true);
    resetFlashcards();

    try {
      const response = await fetch(`${API_URL}/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      const cards = data.flashcards || data.cards || [];

      if (data.success && cards.length > 0) {
        const formattedCards = cards
          .map((card) => ({
            question:
              card.question ||
              card.front ||
              card.term ||
              "",
            answer:
              card.answer ||
              card.back ||
              card.definition ||
              "",
          }))
          .filter((card) => card.question && card.answer);

        if (formattedCards.length > 0) {
          setFlashcards(formattedCards);
        } else {
          alert("Flashcards ka format valid nahi hai.");
        }
      } else {
        alert(data.message || "Flashcards could not be generated.");
      }
    } catch (error) {
      console.error(error);
      alert("Flashcards generate nahi hue. Backend server check karo.");
    } finally {
      setFlashcardLoading(false);
    }
  };

  // Ask Your Notes - Gemini AI Chatbot
  const handleAskQuestion = async (event) => {
    event.preventDefault();

    const question = chatQuestion.trim();

    if (!question) return;

    if (!notes.trim()) {
      setChatError("Please add or upload notes first.");
      return;
    }

    setChatMessages((previous) => [
      ...previous,
      { role: "user", text: question },
    ]);

    setChatQuestion("");
    setChatError("");
    setChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          notes: notes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not get an answer.");
      }

      setChatMessages((previous) => [
        ...previous,
        { role: "assistant", text: data.answer },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatError(
        error.message || "Chatbot se connection nahi ho raha."
      );
    } finally {
      setChatLoading(false);
    }
  };

  // Next Flashcard
  const handleNextCard = () => {
    setCurrentCard((previous) =>
      Math.min(previous + 1, flashcards.length - 1)
    );
    setShowAnswer(false);
  };

  // Previous Flashcard
  const handlePreviousCard = () => {
    setCurrentCard((previous) => Math.max(previous - 1, 0));
    setShowAnswer(false);
  };

  // Download All Flashcards
  const handleDownloadFlashcards = () => {
    if (flashcards.length === 0) {
      alert("Please generate flashcards first.");
      return;
    }

    const content = flashcards
      .map(
        (card, index) =>
          `Question ${index + 1}: ${card.question}\nAnswer: ${card.answer}`
      )
      .join("\n\n------------------------------\n\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "NoteGraph_AI_Flashcards.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="upload-page">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          🧠 NoteGraph <span>AI</span>
        </div>

        <button
          className="back-btn"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>
      </nav>

      <div className="upload-container">

        {/* Heading */}
        <div className="upload-heading">
          <div className="upload-badge">
            🤖 AI Note Analyzer
          </div>

          <h1>
            Turn Your Notes Into a
            <span> Knowledge Graph</span>
          </h1>

          <p>
            Upload your notes and identify important concepts,
            topics and relationships automatically.
          </p>
        </div>

        {/* PDF Upload Card */}
        <div className="upload-card">
          <div className="upload-icon">📄</div>

          <h2>Upload Your Notes</h2>

          <p>Choose a PDF file from your computer</p>

          <input
            type="file"
            id="notesFile"
            accept=".pdf"
            hidden
            onChange={handleFileChange}
          />

          <label htmlFor="notesFile" className="choose-btn">
            Choose PDF
          </label>

          {selectedFile && (
            <div style={{ marginTop: "15px" }}>
              <p style={{ fontWeight: "bold" }}>
                📎 {selectedFile.name}
              </p>

              <button
                className="generate-btn"
                onClick={handlePDFUpload}
                disabled={loading}
              >
                {loading ? "🤖 Analyzing PDF..." : "✨ Analyze PDF"}
              </button>
            </div>
          )}

          <div className="supported">
            Supported: PDF
          </div>
        </div>

        <div className="or-section">
          <span>OR</span>
        </div>

        {/* Sample Notes */}
        <div className="text-notes">
          <h2>🚀 Try Sample Notes</h2>

          <p>
            Select a topic to automatically load ready-made demo notes.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "15px",
            }}
          >
            {Object.keys(sampleNotes).map((topic) => (
              <button
                key={topic}
                type="button"
                className="generate-btn"
                onClick={() => handleSampleNotes(topic)}
              >
                📚 {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Paste Notes */}
        <div className="text-notes">
          <h2>📝 Paste Your Notes</h2>

          <textarea
            placeholder="Paste your notes here..."
            rows="8"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setResult(null);
              setSearchTerm("");
              resetQuiz();
              resetFlashcards();
              resetChat();
            }}
          />

          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading
              ? "🤖 Analyzing Notes..."
              : "✨ Generate Knowledge Graph"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="result-card">

            <div className="result-icon">🧠</div>

            <h2>Knowledge Graph Generated!</h2>

            <p>{result.message}</p>

            {/* Ask Your Notes - Gemini AI Chatbot */}
            <div
              className="result-section"
              style={{
                marginTop: "25px",
                padding: "22px",
                borderRadius: "14px",
                background: "#f5f3ff",
                border: "1px solid #ddd6fe",
              }}
            >
              <h3>🤖 Ask Your Notes</h3>

              <p>
                Ask questions about your notes and get answers
                powered by Gemini AI.
              </p>

              <div
                style={{
                  minHeight: "150px",
                  maxHeight: "350px",
                  overflowY: "auto",
                  padding: "15px",
                  background: "#fff",
                  borderRadius: "10px",
                  marginTop: "15px",
                }}
              >
                {chatMessages.length === 0 ? (
                  <p style={{ color: "#777", textAlign: "center" }}>
                    💬 Your conversation will appear here.
                    <br />
                    Ask anything from your notes!
                  </p>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent:
                          message.role === "user"
                            ? "flex-end"
                            : "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "85%",
                          padding: "12px 15px",
                          borderRadius: "12px",
                          background:
                            message.role === "user"
                              ? "#667eea"
                              : "#eeeaff",
                          color:
                            message.role === "user"
                              ? "#fff"
                              : "#222",
                          lineHeight: "1.5",
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        <strong>
                          {message.role === "user"
                            ? "You"
                            : "🤖 Gemini"}
                        </strong>

                        <p style={{ margin: "6px 0 0" }}>
                          {message.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {chatLoading && (
                  <p style={{ color: "#666" }}>
                    🤖 Gemini is thinking...
                  </p>
                )}
              </div>

              {chatError && (
                <p style={{ color: "red", marginTop: "10px" }}>
                  {chatError}
                </p>
              )}

              <form
                onSubmit={handleAskQuestion}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Ask a question about your notes..."
                  disabled={chatLoading}
                  style={{
                    flex: "1",
                    minWidth: "180px",
                    padding: "13px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                />

                <button
                  type="submit"
                  className="generate-btn"
                  disabled={chatLoading || !chatQuestion.trim()}
                >
                  {chatLoading ? "Thinking..." : "➤ Ask AI"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setChatMessages([]);
                  setChatError("");
                }}
                disabled={chatLoading || chatMessages.length === 0}
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "7px",
                  cursor: "pointer",
                }}
              >
                🗑️ Clear Chat
              </button>

              <small
                style={{
                  display: "block",
                  marginTop: "12px",
                  color: "#666",
                }}
              >
                Answers are generated using your provided notes.
              </small>
            </div>

            {/* Summary */}
            <div className="result-section">
              <h3>📝 Quick Notes Summary</h3>

              <p>
                {result.summary || "Summary is not available."}
              </p>

              <p>
                📊 Total Characters:{" "}
                {result.character_count ?? notes.length}
              </p>
            </div>

            {/* Key Points */}
            <div className="result-section">
              <h3>⭐ Important Key Points</h3>

              {result.key_points?.length > 0 ? (
                <ul>
                  {result.key_points.map((point, index) => (
                    <li key={index} style={{ marginBottom: "10px" }}>
                      {point}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No key points available.</p>
              )}
            </div>

            {/* Smart Search */}
            <div className="result-section">
              <h3>🔍 Smart Search</h3>

              <input
                type="text"
                placeholder="Search concepts or relationships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{
                    marginTop: "10px",
                    padding: "7px 14px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    border: "none",
                  }}
                >
                  Clear Search ✖
                </button>
              )}
            </div>

            {/* Concepts */}
            <div className="result-section">
              <h3>📚 Concepts</h3>

              {filteredConcepts.length > 0 ? (
                <div className="concept-list">
                  {filteredConcepts.map((concept, index) => (
                    <span className="graph-tag" key={index}>
                      {concept}
                    </span>
                  ))}
                </div>
              ) : (
                <p>
                  {searchTerm
                    ? "No matching concepts found."
                    : "No concepts detected."}
                </p>
              )}
            </div>

            {/* Relationships */}
            <div className="result-section">
              <h3>🔗 Relationships</h3>

              {filteredRelationships.length > 0 ? (
                <div className="relationship-list">
                  {filteredRelationships.map((relationship, index) => (
                    <div className="relationship" key={index}>
                      🔗 {relationship}
                    </div>
                  ))}
                </div>
              ) : (
                <p>
                  {searchTerm
                    ? "No matching relationships found."
                    : "No relationships detected."}
                </p>
              )}
            </div>

            {/* Quiz Generator */}
            <div className="result-section">
              <h3>🧩 Test Your Knowledge</h3>

              <p>
                Generate multiple-choice questions from your notes
                and test how much you have learned.
              </p>

              <button
                className="generate-btn"
                onClick={handleGenerateQuiz}
                disabled={quizLoading}
              >
                {quizLoading
                  ? "⏳ Generating Quiz..."
                  : "🎯 Generate Quiz"}
              </button>
            </div>

            {/* Quiz Questions */}
            {quiz.length > 0 && (
              <div className="result-section">
                <h3>📋 Your Quiz</h3>

                <p>
                  Total Questions: {quiz.length}
                </p>

                {quiz.map((question, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "18px",
                      marginTop: "18px",
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      background: "#fff",
                    }}
                  >
                    <h4>
                      Q{index + 1}. {question.question}
                    </h4>

                    {question.options.map((option, optionIndex) => {
                      const isCorrect =
                        quizSubmitted && option === question.answer;

                      const isWrong =
                        quizSubmitted &&
                        answers[index] === option &&
                        option !== question.answer;

                      return (
                        <label
                          key={optionIndex}
                          style={{
                            display: "block",
                            padding: "10px",
                            marginTop: "8px",
                            borderRadius: "7px",
                            cursor: quizSubmitted ? "default" : "pointer",
                            background: isCorrect
                              ? "#d9f7df"
                              : isWrong
                              ? "#ffe0e0"
                              : "#f5f5f5",
                          }}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={answers[index] === option}
                            disabled={quizSubmitted}
                            onChange={() =>
                              setAnswers((previous) => ({
                                ...previous,
                                [index]: option,
                              }))
                            }
                            style={{ marginRight: "10px" }}
                          />

                          {option}

                          {isCorrect && " ✅"}
                          {isWrong && " ❌"}
                        </label>
                      );
                    })}

                    {quizSubmitted && (
                      <p style={{ marginTop: "12px" }}>
                        <strong>Correct Answer:</strong> {question.answer}
                        {question.explanation && (
                          <>
                            <br />
                            <strong>Explanation:</strong>{" "}
                            {question.explanation}
                          </>
                        )}
                      </p>
                    )}
                  </div>
                ))}

                {!quizSubmitted ? (
                  <button
                    className="generate-btn"
                    onClick={handleSubmitQuiz}
                    style={{ marginTop: "20px" }}
                  >
                    ✅ Submit Quiz
                  </button>
                ) : (
                  <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <h2>
                      🎉 Your Score: {score} / {quiz.length}
                    </h2>

                    <p>
                      {score === quiz.length
                        ? "Excellent! All answers are correct."
                        : score >= quiz.length / 2
                        ? "Good job! Keep practicing."
                        : "Keep learning and try again!"}
                    </p>

                    <button
                      className="generate-btn"
                      onClick={handleGenerateQuiz}
                      disabled={quizLoading}
                    >
                      🔄 Try Another Quiz
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Flashcards */}
            <div className="result-section">
              <h3>🃏 Interactive Flashcards</h3>

              <p>
                Generate question-answer cards from your notes
                and revise important concepts.
              </p>

              <button
                className="generate-btn"
                onClick={handleGenerateFlashcards}
                disabled={flashcardLoading}
              >
                {flashcardLoading
                  ? "⏳ Generating Flashcards..."
                  : "🃏 Generate Flashcards"}
              </button>

              {flashcards.length > 0 && (
                <div
                  style={{
                    maxWidth: "550px",
                    margin: "25px auto",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontWeight: "bold" }}>
                    Card {currentCard + 1} of {flashcards.length}
                  </p>

                  <div
                    onClick={() => setShowAnswer(!showAnswer)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setShowAnswer((previous) => !previous);
                      }
                    }}
                    style={{
                      minHeight: "220px",
                      padding: "30px",
                      marginTop: "15px",
                      borderRadius: "18px",
                      background: showAnswer
                        ? "linear-gradient(135deg, #dbeafe, #ede9fe)"
                        : "linear-gradient(135deg, #667eea, #764ba2)",
                      color: showAnswer ? "#222" : "#fff",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
                      transition: "0.3s",
                    }}
                  >
                    <h3>
                      {showAnswer ? "💡 Answer" : "❓ Question"}
                    </h3>

                    <p
                      style={{
                        fontSize: "19px",
                        fontWeight: "500",
                        lineHeight: "1.6",
                      }}
                    >
                      {showAnswer
                        ? flashcards[currentCard].answer
                        : flashcards[currentCard].question}
                    </p>

                    <small style={{ marginTop: "15px" }}>
                      Click card to{" "}
                      {showAnswer ? "see question" : "reveal answer"}
                    </small>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginTop: "20px",
                    }}
                  >
                    <button
                      className="generate-btn"
                      onClick={handlePreviousCard}
                      disabled={currentCard === 0}
                    >
                      ← Previous
                    </button>

                    <button
                      className="generate-btn"
                      onClick={handleNextCard}
                      disabled={currentCard === flashcards.length - 1}
                    >
                      Next →
                    </button>
                  </div>

                  <p style={{ marginTop: "15px", color: "#666" }}>
                    {currentCard === flashcards.length - 1
                      ? "🎉 You have reached the last card!"
                      : "Keep revising and move to the next card."}
                  </p>

                  {/* Download Flashcards Button */}
                  <button
                    className="generate-btn"
                    onClick={handleDownloadFlashcards}
                    style={{ marginTop: "15px", width: "100%" }}
                  >
                    📥 Download All Flashcards
                  </button>
                </div>
              )}
            </div>

            {/* AI Status */}
            <div className="ai-status">
              🤖 AI Analysis Completed
            </div>

            {/* View Graph */}
            <button
              className="generate-btn"
              onClick={() => onViewGraph(result)}
            >
              🕸️ View Knowledge Graph
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default UploadNotes;

