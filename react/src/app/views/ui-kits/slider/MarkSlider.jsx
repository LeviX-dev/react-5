import { useState } from "react";
import Slider from "rc-slider";
import Tooltip from "rc-tooltip";

const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      key={index}
      placement="top"
      overlay={value}
      visible={dragging}
      prefixCls="rc-slider-tooltip">
      <Slider.Handle value={value} {...restProps} />
    </Tooltip>
  );
};

const marks = {
  "-10": "-10°C",
  0: <strong>0°C</strong>,
  26: "26°C",
  37: "37°C",
  50: "50°C",
  100: { style: { color: "red" }, label: <strong>100°C</strong> }
};

export default function MarkSlider() {
  const [value, setValue] = useState(30);
  const handleChange = (value) => setValue(value);

  return (
    <div className="px-3 pb-3">
      <Slider
        dots
        included
        step={25}
        min={-10}
        marks={marks}
        value={value}
        handle={handle}
        onChange={handleChange}
      />
    </div>
  );
}
