import React, { useState } from "react";
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

export default function MultiStyledSlider() {
  const [value, setValue] = useState([10, 20, 60, 80]);
  const handleChange = (value) => setValue(value);

  return (
    <Slider
      range
      count={3}
      value={value}
      pushable
      handle={handle}
      allowCross={false}
      onChange={handleChange}
      trackStyle={[{ backgroundColor: "red" }, { backgroundColor: "green" }]}
      handleStyle={[{ backgroundColor: "yellow" }, { backgroundColor: "white" }]}
      railStyle={{ backgroundColor: "black" }}
    />
  );
}
