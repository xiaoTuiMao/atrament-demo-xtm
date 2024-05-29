import { useRef, useEffect } from 'react';
import Atrament, { MODE_DRAW, MODE_ERASE, MODE_FILL } from 'atrament';


import './App.css';

function App() {
  const canvasRef = useRef(null);
  const sketchpadRef = useRef(null);
  const recordRef = useRef([]);
  const editIndex = useRef(0);
  const recordDate = useRef(Date.now());
  const prevModeInfoRef = useRef({ mode: MODE_DRAW, color: '#000' });

  useEffect(() => {
    const canvas = canvasRef.current;
    sketchpadRef.current = new Atrament(canvas, {
      width: canvas.offsetWidth,
      height: canvas.offsetHeight,
    });

    sketchpadRef.current.recordStrokes = true;
    sketchpadRef.current.addEventListener('strokerecorded', ({ stroke }) => {
      // 防止重复
      if (Date.now() - recordDate.current < 100) {
        return;
      }
      // 初始化好记录
      recordRef.current = recordRef.current.slice(0, editIndex.current)
      recordDate.current = Date.now();
      recordRef.current.push(stroke);
      editIndex.current += 1;
    });
    sketchpadRef.current.addEventListener('fillend', () => {
      sketchpadRef.current.mode = prevModeInfoRef.current.mode;
      sketchpadRef.current.color = prevModeInfoRef.current.color;
    });
  }, []);

  const onBgColorPick = (event) => {
    const ctx = sketchpadRef.current;
    const color = event.target.value;
    prevModeInfoRef.current.mode = ctx.mode;
    prevModeInfoRef.current.color = ctx.color;
    ctx.mode = MODE_FILL;
    ctx.color = color;
  };

  const chooseErase = () => {
    const ctx = sketchpadRef.current;
    prevModeInfoRef.current.weight = ctx.weight;
    ctx.mode = MODE_ERASE;
    ctx.weight = 40;
  }

  const choosePen = () => {
    sketchpadRef.current.mode = MODE_DRAW;
    sketchpadRef.current.weight = prevModeInfoRef.current.weight || 2;
  }

  const onPenBaseInfoChange = (type, isNumber) => (event) => {
    const targetVal = event.target.value
    console.log('设置属性', type, sketchpadRef.current[type]);
    sketchpadRef.current[type] = isNumber ? +targetVal : targetVal;
  }

  const handleReDraw = (reDrawData, isClear = true) => {
    const ctx = sketchpadRef.current;
    isClear && ctx.clear();
    ctx.recordStrokes = false;

    reDrawData.forEach(stroke => {
      ctx.mode = stroke.mode;
      ctx.weight = stroke.weight;
      ctx.smoothing = stroke.smoothing;
      ctx.color = stroke.color;
      ctx.adaptiveStroke = stroke.adaptiveStroke;
      const points = stroke.segments.slice();
      const firstPoint = points.shift().point;
      ctx.beginStroke(firstPoint.x, firstPoint.y);

      let prevPoint = firstPoint;
      while (points.length > 0) {
        const point = points.shift();
        const { x, y } = ctx.draw(point.point.x, point.point.y, prevPoint.x, prevPoint.y);
        prevPoint = { x, y };
      }
      ctx.endStroke(prevPoint.x, prevPoint.y);
    });
    ctx.recordStrokes = true;
  }
  const handleUndo = () => {
    if (editIndex.current <= 0) {
      return;
    }
    editIndex.current -= 1;
    const reDrawData = recordRef.current.slice(0, editIndex.current);
    handleReDraw(reDrawData)
  }
  const handleNext = () => {
    if (recordRef.current.length === editIndex.current) {
      return;
    }
    const reDrawData = recordRef.current.slice(editIndex.current, editIndex.current + 1);
    editIndex.current += 1;
    handleReDraw(reDrawData, false)
  }

  const handleExport = () => {
    const dataURL = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas_image.png';
    link.click();
  }

  return (
    <div className='container'>
      <div className='editBox'>
        <div className='editItem'>
          <label>背景色选择</label>
          <input onInput={onBgColorPick} type="color" defaultValue='transparent'></input>
        </div>
        <div className='editItem'>
          <label>画笔粗细设置</label>
          <input type='range' min="0" max="100" onInput={onPenBaseInfoChange('weight', true)} step={1} defaultValue={sketchpadRef.current?.weight || 2} />
        </div>
        <div className='editItem'>
          <label>画笔平滑度</label>
          <input type='range' min="0.1" max="2" onInput={onPenBaseInfoChange('smoothing', true)} step={0.05} defaultValue={sketchpadRef.current?.smoothing || 0.85} />
        </div>
        <div className='editItem'>
          <label>画笔颜色</label>
          <input onInput={onPenBaseInfoChange('color')} type="color" defaultValue='#000'></input>
        </div>
        <div onClick={chooseErase} className='editItem'>
          橡皮擦🧽
        </div>
        <div onClick={choosePen} className='editItem'>
          画笔✏️
        </div>
        <div onClick={handleUndo} className='editItem'>
          上一步
        </div>
        <div onClick={handleNext} className='editItem'>
          下一步
        </div>
        <div onClick={handleExport} className='editItem'>
          下载图片
        </div>
      </div>
      <canvas ref={canvasRef} id="sketchpad"></canvas>
    </div>
  );
}

export default App;