import { useState } from "react";
import Slider from "rc-slider";

export default function RangeSlider() {
  const [value, setValue] = useState([25, 75]);
  const handleChange = (value) => setValue(value);

  return <Slider range value={value} onChange={handleChange} />;
}
