import { useRef, useEffect, useCallback } from 'react';
import Atrament, { MODE_DRAW, MODE_ERASE, MODE_FILL, MODE_DISABLED } from 'atrament';

import ColorPicker from './components/ColorPicker';

import './App.css';

function App() {
  const canvasRef = useRef(null);
  const sketchpadRef = useRef(null);
  const prevModeInfoRef = useRef({ mode: MODE_DRAW, color: '#000' });

  useEffect(() => {
    const canvas = document.querySelector('#sketchpad');
    sketchpadRef.current = new Atrament(canvas, {
      width: canvas.offsetWidth,
      height: canvas.offsetHeight,
    });

    sketchpadRef.current.recordStrokes = true;

    sketchpadRef.current.addEventListener('fillend', () => {
      sketchpadRef.current.mode = prevModeInfoRef.current.mode;
      sketchpadRef.current.color = prevModeInfoRef.current.color;
    });
  }, []);

  const onBgColorPick = (color) => {
    const ctx = sketchpadRef.current;
    if (ctx) {
      prevModeInfoRef.current.mode = ctx.mode;
      prevModeInfoRef.current.color = ctx.color;
      ctx.mode = MODE_FILL;
      ctx.color = color;
    }
  }

  return (
    <div className='container'>
      <div className='editBox'>
        <div className='editItem'>
          <div>背景色选择</div>
          <ColorPicker onColorPick={onBgColorPick} />
        </div>
      </div>
      <canvas ref={canvasRef} id="sketchpad"></canvas>
    </div>
  );
}

export default App;