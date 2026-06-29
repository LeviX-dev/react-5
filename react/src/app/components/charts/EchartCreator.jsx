import React from "react";
import echarts from "echarts";
import ReactEcharts from "echarts-for-react";
import PropTypes from "prop-types";
import echartTheme from "./echartTheme";

export default function EchartCreator(props) {
  echarts.registerTheme("echarts-theme", echartTheme(props.theme));

  return (
    <ReactEcharts
      option={props.option}
      lazyUpdate={true}
      theme="echarts-theme"
      style={{ height: props.height, width: "100%" }}
    />
  );
}

EchartCreator.prototype = {
  height: PropTypes.string.isRequired,
  settings: PropTypes.object.isRequired
};
