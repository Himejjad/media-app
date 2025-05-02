import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [media, setMedia] = useState([]);
  const [file, setFile] = useState(null);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/media')
      .then(res => setMedia(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post('http://localhost:3000/media', formData);
    const res = await axios.get('http://localhost:3000/media');
    setMedia(res.data);
    setFile(null);
  };

  const playSong = (url) => {
    if (playing) playing.pause();
    const audio = new Audio(url);
    audio.play();
    setPlaying(audio);
  };

  return (
    <div>
      <h1>Media App</h1>
      <input type="file" accept="image/*,audio/*" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={!file}>Upload</button>
      <h2>Media List</h2>
      <ul>
        {media.map(item => (
          <li key={item._id}>
            {item.type === 'image' ? (
              <img src={item.url} alt={item.name} width="100" />
            ) : (
              <button onClick={() => playSong(item.url)}>{item.name}</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
