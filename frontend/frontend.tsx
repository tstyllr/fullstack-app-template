import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

function App() {
   const [message, setMessage] = useState<string>('');

   useEffect(() => {
      // Fetch data from backend API
      fetch('/api/hello')
         .then((res) => res.json())
         .then((data) => setMessage(data.message))
         .catch((err) => console.error('Failed to fetch:', err));
   }, []);

   return (
      <div className="app">
         <h1>Fullstack App Template</h1>
         <p>{message || 'Loading...'}</p>
      </div>
   );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
