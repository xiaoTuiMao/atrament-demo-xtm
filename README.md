### 前言
今天给大家介绍一个工具 -- [Atrament](https://github.com/jakubfiala/atrament)。 [Atrament](https://github.com/jakubfiala/atrament)是一个用于在 HTML 画布上进行美丽绘制和手写的小型 JS 库。适用场景如：网上签约时用户签名、需要手绘动画。阅读完本文你会有以下收获：
- 了解[Atrament](https://github.com/jakubfiala/atrament) 的基本使用
- 从实践出发，手把手教你实现一个简易画布编辑器

###  [Atrament](https://github.com/jakubfiala/atrament) 介绍
Atrament 是一个用于在 HTML 画布上绘制和手写的库。它的目标是让绘图感觉自然舒适，结果平滑愉悦。Atrament 不会存储笔画路径本身 - 相反，它会直接绘制到画布位图上，就像一支墨水笔在一张纸上一样（“atrament”在斯洛伐克语和波兰语中意为墨水）。这使得它适用于某些应用程序，但对其他应用程序来说并不完全理想。它具备以下特点：
1. **丰富的编辑能力**：支持绘制/填充/擦除模式
2. **自适应平滑**：可调自适应平滑，让画笔更像手绘
3. **丰富的事件系统**：支持跟踪绘图的事件
4. **画笔调节**：支持画笔粗细与颜色调整。

> ⚠️  注意：从版本 4 开始，Atrament 支持常青浏览器（Firefox、Chrome 和基于 Chromium 的浏览器）以及 Safari 15 或更高版本。如果您的应用程序必须支持旧版浏览器，请使用版本 3。您可以在这里查看 [v3 的文档](https://github.com/jakubfiala/atrament/blob/ded0a8289c7b1ff7a79dbad36893986da09f37fc/README.md)。



###  [Atrament](https://github.com/jakubfiala/atrament) 实践
接下来将以 `React` + `Atrament` 实现一个画画面板。该画板具备以下功能：
1. 背景设置
2. 编辑面板：支持设置画笔粗细、颜色、平滑度、橡皮擦。
3. 操作面板：上一步、下一步、下载图片。

#### 画布创建
创建一个 `Atrament` 画布非常简单，只需要创建一个 `canvas` 标签，并实例化 `Atrament` 即可。

``` html
<canvas id="sketchpad"></canvas>
```
获取节点，并实例化 `Atrament`，以 react 工程示例
```javaScript
import Atrament from 'atrament';

const App = () => {
	const canvasRef = useRef(null);
	const sketchpadRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		sketchpadRef.current = new Atrament(canvas, {
			width: canvas.offsetWidth,
			height: canvas.offsetHeight,
		});
	});
	return <canvas ref={canvasRef}></canvas>
}
```
到这里，画布初始化就完成了！

> 需要注意的是，为了使绘图在高 DPI 屏幕上显示清晰，自 v4.0.0 版本起，Atrament 通过 `window.devicePixelRatio` 来调整其绘图上下文的大小。这意味着当您设置自定义 `width` 或 `height` 时，还要将 CSS 像素值乘以 `devicePixelRatio` 。 `draw()` 接受和包含的描边事件的值始终为 CSS 像素。如上述例子，在 DPI 为 2 的机器里，实际渲染出来的 canvas 会是 `1000*1000`。**在初始化画布的宽高的时候，最好根据 `canvas` 的宽高设置 width 与 height，否则可能会出现鼠标绘制的起始点与画布渲染的起始点不一致**，代码示例
>
>
```javaScript
const canvas = document.querySelector('#sketchpad');
const sketchpad = new Atrament(canvas, {
	width: canvas.offsetWidth,
	height: canvas.offsetHeight,
});
```

接着给画布加上一点点样式，预留出编辑区与画布区。加完样式后，表现如下：

![Pasted image 20240528095403.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a5731731e1094f7bbd9f334d1b3fe296~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3200&h=870&s=105916&e=png&b=f1f1f1)

#### 背景功能增加
`Atrament` 的绘画共有四种模式
- MODE_DRAW（默认）：绘画模式
- MODE_ERASE：擦拭模式
- MODE_FILL：填充模式
- MODE_DISABLED：不对画布做修改，但仍然触发`stroke`事件

实现背景填充，可以使用 `MODE_FILL`模式。首先通过 input 实现一个颜色选择器（color-picker），它将作为背景颜色的选择工具。通过选择不同的颜色，可以实现背景的填充效果。

由于 `Atrament` 并没有提供填充背景的 API 调用，这里使用的是记录上次 mode 与 color，在用户选择完成背景色后，点击画布，切换背景，再次操作切换为上次的 mode 与 color。
```javaScript
// 背景色设置
const onBgColorPick = (event) => {
    const ctx = sketchpadRef.current;
    const color = event.target.value;
    prevModeInfoRef.current.mode = ctx.mode;
    prevModeInfoRef.current.color = ctx.color;
    ctx.mode = MODE_FILL;
    ctx.color = color;
};

// 填充完成后，复位，可在初始化实例那里监听
sketchpadRef.current.addEventListener('fillend', () => {
	sketchpadRef.current.mode = prevModeInfoRef.current.mode;
	sketchpadRef.current.color = prevModeInfoRef.current.color;
});

```
实现效果如下：

![draw-bg.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f5e25b833de04d9e8072a5a777617dac~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1374&h=536&s=367983&e=gif&f=197&b=efefef)

#### 编辑功能增加
实现画笔粗细、颜色、平滑度、橡皮擦这些功能都比较简单。其中粗细、颜色、平滑度都是使用`Atrament` 实例上的属性：
- weight：设置画笔粗细，默认值为 `2px`。
- color：设置画笔颜色，默认值为 `#000`
- smoothing: 设置画笔的丝滑度，默认为 `0.85`
通过 `input` 控件来控制画笔的各种属性变化：
```javaScript
const onPenBaseInfoChange = (type, isNumber) => (event) => {
	const targetVal = event.target.value
	sketchpadRef.current[type] = isNumber ? +targetVal : targetVal;
}
```

```html
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
```
编辑功能设置的功能添加后，效果如下：
![pen-editor.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8817b023dc5f4604b680ec0eeb422b3f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1374&h=536&s=421747&e=gif&f=285&b=efefef)

橡皮擦需要将 `Atrament` 的`mode`设置为`MODE_ERASE`。这里涉及到画笔模式切换，在切换成橡皮擦之前，先缓存一下画笔粗细，同时将橡皮擦的粗度调大，方便擦拭。代码如下：

```javaScript
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

```

```html
<div onClick={chooseErase} className='editItem'>
	橡皮擦🧽
</div>
<div onClick={choosePen} className='editItem'>
	画笔✏️
</div>
```
橡皮擦实现效果如下：

![erase.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/adf289e756e44ab49899a6522d26b8c2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1374&h=536&s=209435&e=gif&f=153&b=efefef)

#### 操作面板
接下来通过缓存用户操作记录，实现上一步与下一步。首先通过启动recordStrokes与监听strokerecorded 事件来缓存用户操作。同时建立一个索引来标记用户的最新操作。

> 注意 `strokerecorded`事件会在短时间内重复触发两次，所以这里简单采用了一个节流处理

```javaScript
const recordDate = useRef(Date.now());
const recordRef = useRef([]);
const editIndex = useRef(0);

useEffect(() => {
	...
	sketchpadRef.current.recordStrokes = true;
	sketchpadRef.current.addEventListener('strokerecorded', ({ stroke }) => {
		// 防止重复
		if (Date.now() - recordDate.current < 100) {
			return;
		}
		// 用户有可能回撤后重新操作，所以这里要在用户操作完后重新初始化记录
		recordRef.current = recordRef.current.slice(0, editIndex.current)
		recordDate.current = Date.now();
		recordRef.current.push(stroke);
		editIndex.current += 1;
	});
}, [])
```

记录好用户的操作路径后，我只需要对画布进行重新绘制即可。
1. 关闭画布内容
2. 关闭录制，防止重复记录
3. 根据用户操作索引与记录数组，筛选出本次绘制的数据
4. 重新执行绘制内容
5. 执行完毕开启录制
按照上述五步，先抽离一个公共方法，根据操作数据进行绘制处理，代码如下：
```javaScript
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
```
针对回撤，需要做到以下几步
1. 根据用户操作记录与操作index，筛选出需要绘制的记录。
2. 将操作索引减一。
3. 清空当前画布，根据筛选的内容重新绘制
```javaScript
const handleUndo = () => {
	if (editIndex.current <= 0) {
		return;
	}

	editIndex.current -= 1;
	const reDrawData = recordRef.current.slice(0, editIndex.current);
	handleReDraw(reDrawData)
}
```
针对下一步，操作会相对简单
1. 根据索引获取到下一步的操作数据
2. 操作索引加一
3. 根据下一步的数据进行绘制，这里仅需绘制一步，无需情况画布
```javaScript
const handleNext = () => {
	if (recordRef.current.length === editIndex.current) {
		return;
	}
    const reDrawData = recordRef.current.slice(editIndex.current, editIndex.current + 1);
    editIndex.current += 1;
    handleReDraw(reDrawData, false)
}
```
操作面板的效果如下：

![edit-record.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f6fbeb32e6274f45b3ebda37cc70eb1e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1374&h=536&s=271914&e=gif&f=198&b=efefef)

最后，实现导出图片功能，可以直接使用 canvas 的导出能力：
```javaScript
const handleExport = () => {
	const dataURL = canvasRef.current.toDataURL('image/png');
	const link = document.createElement('a');
	link.href = dataURL;
	link.download = 'canvas_image.png';
	link.click();
}
```
至此，完整的画板功能实现完毕。

### 总结
通过本文的介绍，相信大家已经对 Atrament 这个用于 HTML 画布绘制和手写的小型 JS 库有了全面的了解。我们从基本的库介绍、创建画布开始，逐步讲解了如何在 React 项目中实现丰富的编辑功能，包括设置背景、调整画笔属性、使用橡皮擦以及记录用户操作进行撤销和重做。此外，还介绍了如何导出绘制的图片。

通过实例代码和图示，读者可以轻松跟随步骤实现一个功能丰富的画板应用。Atrament 的简单集成和强大功能使其成为处理在线绘图和签名等场景的理想选择。


> 最后附上笔者的作品

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e49f002eb81a457f931be3303eb8801b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1376&h=1116&s=173225&e=png&b=f0f0f0)


