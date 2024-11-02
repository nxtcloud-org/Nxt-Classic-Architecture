import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [username, setUsername] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [displayedAuthor, setDisplayedAuthor] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_EC2_IP}/api/text`)
      .then(res => res.json())
      .then(data => {
        let text = data.text.split("by")[0]
        let author = data.text.split("by")[1]
        setDisplayedText(text);
        setDisplayedAuthor(author)
      });
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    fetch(`${process.env.REACT_APP_EC2_IP}/api/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, username }),
    });
    setText('');
    setUsername('');
  };

  return (
    <div className="App">
      <h1>확신없는 랜덤 명언</h1>
      <h2>{displayedText ? displayedText : "아직 저장된 명언이 없거나 서버와 연결되지 않았습니다."}</h2>
      <h2>by {displayedAuthor}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter text"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <button type="submit">명언 저장</button>
      </form>
    </div>
  );
}

export default App;
