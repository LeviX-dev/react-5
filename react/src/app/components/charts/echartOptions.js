const echartOptions = {
  get smoothLine() {
    return { type: "line", smooth: true };
  },

  get lineShadow() {
    return {
      shadowBlur: 10,
      shadowOffsetY: 8,
      shadowOffsetX: -1,
      shadowColor: "rgba(0, 0, 0, .2)"
    };
  },

  get gridNoAxis() {
    return { show: false, top: 5, left: 0, right: 0, bottom: 0 };
  },

  get pieRing() {
    return {
      radius: ["50%", "60%"],
      selectedMode: true,
      selectedOffset: 0,
      avoidLabelOverlap: false
    };
  },

  get pieLabelOff() {
    return {
      label: { show: false },
      labelLine: { show: false, emphasis: { show: false } }
    };
  },

  get pieLabelCenterHover() {
    return {
      normal: { show: false, position: "center" },
      emphasis: { show: true, label: { fontWeight: "bold" } }
    };
  },

  get pieLineStyle() {
    return { color: "rgba(0,0,0,0)", borderWidth: 2, ...this.lineShadow };
  },

  get pieThikLineStyle() {
    return { color: "rgba(0,0,0,0)", borderWidth: 12, ...this.lineShadow };
  },

  get gridAlignLeft() {
    return { show: false, top: 6, right: 0, left: "-6%", bottom: 0 };
  },

  get defaultOptions() {
    return {
      yAxis: { type: "value", show: false },
      grid: { show: false, top: 6, right: 0, left: 0, bottom: 0 },
      tooltip: { ...this.lineNoAxis.tooltip },
      xAxis: {
        show: true,
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      }
    };
  },

  get lineFullWidth() {
    return {
      grid: { show: false, top: 0, right: "-9%", left: "-8.5%", bottom: 0 },
      tooltip: { show: true, backgroundColor: "rgba(0, 0, 0, .8)" },
      xAxis: { type: "category", show: true },
      yAxis: { type: "value", show: false }
    };
  },

  get lineNoAxis() {
    return {
      grid: this.gridNoAxis,
      tooltip: {
        show: true,
        borderWidth: 0,
        className: "rounded",
        backgroundColor: "rgba(0, 0, 0, .6)",
        textStyle: { color: "#fff" }
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        axisLine: { show: false },
        axisLabel: { show: false, color: "#ccc" }
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false, color: "#ccc" },
        splitLine: { show: false, lineStyle: { color: "rgba(0, 0, 0, .1)" } }
      }
    };
  },

  get lineSplitNoAxis() {
    return {
      ...this.lineNoAxis,
      yAxis: {
        ...this.lineNoAxis.yAxis,
        splitLine: { show: true, lineStyle: { color: "rgba(0, 0, 0, .1)" } }
      }
    };
  }
};

export default echartOptions;
