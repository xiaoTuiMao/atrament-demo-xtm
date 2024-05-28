import { useRef, useEffect } from 'react';
// @ts-ignore
// eslint-disable-next-line
import Atrament from 'atrament';

import './App.css';

function App() {
  const canvasRef = useRef(null);
  const sketchpadRef = useRef(null);

  useEffect(() => {
    const canvas = document.querySelector('#sketchpad');
    sketchpadRef.current = new Atrament(canvas, {
      width: canvas.offsetWidth,
      height: canvas.offsetHeight,
    });

    sketchpadRef.current.recordStrokes = true;
  }, []);

  return (
    <div className='container'>

      <div className='editBox'>
        <div>编辑区</div>
      </div>
      <canvas ref={canvasRef} id="sketchpad"></canvas>
    </div>
  );
}

export default App;