const ColorPicker = ({ onColorPick }) => {
  const handleColorInput = (event) => {
    onColorPick(event.target.value);
  }

  return <input onInput={handleColorInput} type="color" id="colorPicker"></input>
}

export default ColorPicker;