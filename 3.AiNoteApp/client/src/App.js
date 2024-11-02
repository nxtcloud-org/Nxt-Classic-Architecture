// App.js
import React, { useState, useEffect } from "react";
import "./App.css";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
    const interval = setInterval(fetchNotes, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/notes`);
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("노트 조회 중 오류 발생:", error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    setIsLoading(true);
    try {
      await fetch(`${SERVER_URL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });
      await fetchNotes();
      setNewNote("");
    } catch (error) {
      console.error("노트 추가 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${SERVER_URL}/notes/${id}`, { method: "DELETE" });
      await fetchNotes();
    } catch (error) {
      console.error("노트 삭제 중 오류 발생:", error);
    }
  };

  const deleteNotes = async () => {
    if (!window.confirm("모든 기록을 삭제하시겠습니까?")) return;
    
    try {
      await fetch(`${SERVER_URL}/notes`, { method: "DELETE" });
      await fetchNotes();
    } catch (error) {
      console.error("전체 노트 삭제 중 오류 발생:", error);
    }
  };

  const requestAIAdvice = async (userNote) => {
    try {
      await fetch(`${SERVER_URL}/ainotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userNote }),
      });
      await fetchNotes();
    } catch (error) {
      console.error("AI 조언 요청 중 오류 발생:", error);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>학습 기록 애플리케이션</h1>
        <h3>오늘 학습한 내용을 기록해보세요.</h3>
        
        <div className="input-section">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="무엇을 공부하셨나요?"
            className="note-input"
          />
          <div className="button-group">
            <button 
              onClick={addNote} 
              disabled={isLoading || !newNote.trim()}
              className="primary-button"
            >
              {isLoading ? "추가 중..." : "학습 기록 추가"}
            </button>
            <button 
              onClick={deleteNotes}
              className="danger-button"
            >
              전체 기록 삭제
            </button>
          </div>
        </div>

        <h2>내 학습 기록</h2>
        <div className="notes-container">
          {notes.length === 0 ? (
            <p className="no-notes">아직 기록된 학습 내용이 없습니다.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="note">
                <div className="note-content">
                  <strong>📝 학습 내용:</strong> 
                  <p>{note.user_note}</p>
                </div>
                {note.ai_note && (
                  <div className="ai-note">
                    <strong>🤖 AI 추천 학습:</strong>
                    <p>{note.ai_note}</p>
                  </div>
                )}
                <div className="note-actions">
                  {!note.ai_note && (
                    <button
                      onClick={() => requestAIAdvice(note.user_note)}
                      className="secondary-button"
                    >
                      AI 조언 요청
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="danger-button"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;