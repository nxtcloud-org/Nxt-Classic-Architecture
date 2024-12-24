import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiRequestInProgress, setAiRequestInProgress] = useState({ id: null, type: null });

  useEffect(() => {
    fetchNotes();
    const interval = setInterval(fetchNotes, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/notes`);
      if (!response.ok) throw new Error('데이터 조회 실패');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('노트 조회 중 오류:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      });

      if (!response.ok) throw new Error('노트 추가 실패');
      await fetchNotes();
      setNewNote('');
    } catch (error) {
      console.error('노트 추가 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/notes/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('노트 삭제 실패');
      await fetchNotes();
    } catch (error) {
      console.error('노트 삭제 중 오류:', error);
    }
  };

  const deleteAllNotes = async () => {
    if (!window.confirm('모든 학습 기록을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/notes`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('전체 노트 삭제 실패');
      await fetchNotes();
    } catch (error) {
      console.error('전체 노트 삭제 중 오류:', error);
    }
  };

  const requestGPTAdvice = async (userNote, noteId) => {
    if (aiRequestInProgress.id) return;
    
    setAiRequestInProgress({ id: noteId, type: 'gpt' });
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/gpt-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            content: userNote,
            noteId: noteId 
        }),
      });

      if (!response.ok) {
        throw new Error('GPT 조언 요청 실패');
      }

      await fetchNotes();
    } catch (error) {
      console.error('GPT 조언 요청 중 오류:', error);
    } finally {
      setAiRequestInProgress({ id: null, type: null });
    }
};

const requestClaudeAdvice = async (userNote, noteId) => {
    if (aiRequestInProgress.id) return;
    
    setAiRequestInProgress({ id: noteId, type: 'claude' });
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/claude-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            content: userNote,
            noteId: noteId 
        }),
      });

      if (!response.ok) {
        throw new Error('Claude 조언 요청 실패');
      }

      await fetchNotes();
    } catch (error) {
      console.error('Claude 조언 요청 중 오류:', error);
    } finally {
      setAiRequestInProgress({ id: null, type: null });
    }
};

  return (
    <div className="App">
      <div className="container">
        <h1>AWS 학습 기록 애플리케이션</h1>
        <h3>오늘 AWS에 대해 학습한 내용을 기록해보세요.</h3>

        <div className="input-section">
          <textarea
            className="note-input"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="AWS 서비스나 기능에 대해 무엇을 공부하셨나요?"
            disabled={isLoading}
          />
          <div className="button-group">
            <button
              className="primary-button"
              onClick={addNote}
              disabled={isLoading || !newNote.trim()}
            >
              {isLoading ? '저장 중...' : '학습 기록 추가'}
            </button>
            <button
              className="danger-button"
              onClick={deleteAllNotes}
              disabled={isLoading || notes.length === 0}
            >
              전체 기록 삭제
            </button>
          </div>
        </div>

        <h2>내 AWS 학습 기록</h2>
        <div className="notes-container">
        {notes.length === 0 ? (
          <p className="no-notes">아직 기록된 학습 내용이 없습니다.</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note">
              <div className="note-content">
                <strong>📝 학습 내용:</strong>
                <p>{note.user_note}</p>
              </div>
              
              {note.ai_note ? (
                <div className="ai-note">
                  <strong>
                    🤖 {note.ai_type === 'gpt' ? 'GPT' : 'Claude'}의 추천 학습 서비스:
                  </strong>
                  <p>{note.ai_note}</p>
                </div>
              ) : null}
              
              <div className="note-actions">
                {!note.ai_note && (
                  <>
                    <button
                      className="secondary-button"
                      onClick={() => requestGPTAdvice(note.user_note, note.id)}
                      disabled={aiRequestInProgress.id === note.id}
                    >
                      {aiRequestInProgress.id === note.id && aiRequestInProgress.type === 'gpt' ? (
                        <>
                          <span className="loading-spinner"></span>
                          GPT 분석 중...
                        </>
                      ) : (
                        'GPT에게 학습 추천받기'
                      )}
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => requestClaudeAdvice(note.user_note, note.id)}
                      disabled={aiRequestInProgress.id === note.id}
                    >
                      {aiRequestInProgress.id === note.id && aiRequestInProgress.type === 'claude' ? (
                        <>
                          <span className="loading-spinner"></span>
                          Claude 분석 중...
                        </>
                      ) : (
                        'Claude에게 학습 추천받기'
                      )}
                    </button>
                  </>
                )}
                <button
                  className="danger-button"
                  onClick={() => deleteNote(note.id)}
                  disabled={aiRequestInProgress.id === note.id}
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
