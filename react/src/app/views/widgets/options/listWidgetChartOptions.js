export const options1 = {
  chart: {
    type: "bar",
    width: "20%",
    height: 30,
    sparkline: { enabled: true }
  },
  colors: ["#c43235"],
  xaxis: { crosshairs: { width: 1 } },
  plotOptions: { bar: { columnWidth: "40%" } },
  labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  series: [{ data: [25, 15, 35, 35, 55, -75, -100, 75, 55, 35, 25, 15, 15] }],
  tooltip: {
    x: { show: false },
    marker: { show: false },
    fixed: { enabled: false },
    y: { title: { formatter: () => "" } }
  }
};

export const options2 = {
  chart: {
    type: "bar",
    width: "20%",
    height: 30,
    sparkline: { enabled: true }
  },
  plotOptions: { bar: { columnWidth: "40%" } },
  colors: ["#c43235"],

  labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  series: [{ data: [-25, 15, -35, 35, 55, -75, 100, 75, 55, -35, -25, -15, 15] }],
  xaxis: { crosshairs: { width: 1 } },
  tooltip: {
    x: { show: false },
    marker: { show: false },
    fixed: { enabled: false },
    y: { title: { formatter: () => "" } }
  }
};

export const options3 = {
  chart: {
    type: "bar",
    width: "20%",
    height: 30,
    sparkline: { enabled: true }
  },
  plotOptions: { bar: { columnWidth: "40%" } },
  colors: ["#c43235"],
  series: [{ data: [25, 15, -35, -35, -55, -75, -100, -75, -55, -35, -25, -15, -15] }],
  labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  xaxis: { crosshairs: { width: 1 } },
  tooltip: {
    x: { show: false },
    marker: { show: false },
    fixed: { enabled: false },
    y: { title: { formatter: () => "" } }
  }
};

export const options4 = {
  chart: {
    type: "bar",
    width: "20%",
    height: 30,
    sparkline: { enabled: true }
  },
  plotOptions: {
    bar: { columnWidth: "40%" }
  },
  colors: ["#c43235"],
  series: [{ data: [25, 15, 35, 35, 55, 75, 90, 75, 55, 35, 25, 15, 15] }],
  labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  xaxis: { crosshairs: { width: 1 } },
  tooltip: {
    x: { show: false },
    marker: { show: false },
    fixed: { enabled: false },
    y: { title: { formatter: (seriesName) => "" } }
  }
};

export const options5 = {
  chart: {
    type: "bar",
    width: "20%",
    height: 30,
    sparkline: { enabled: true }
  },
  plotOptions: {
    bar: { columnWidth: "40%" }
  },
  colors: ["#c43235"],

  series: [{ data: [95, 75, 35, 35, 55, 25, 30, 75, 55, 55, 25, 65, 80] }],
  labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  xaxis: { crosshairs: { width: 1 } },
  tooltip: {
    x: { show: false },
    marker: { show: false },
    fixed: { enabled: false },
    y: { title: { formatter: () => "" } }
  }
};

export const options6 = {
  chart: {
    type: "bar",
    width: "20%",
    height: 30,
    sparkline: { enabled: true }
  },
  colors: ["#c43235"],
  plotOptions: { bar: { columnWidth: "40%" } },

  series: [{ data: [25, 15, 35, 35, 55, 75, 90, 75, 55, 35, 25, 15, 15] }],
  labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  xaxis: { crosshairs: { width: 1 } },
  tooltip: {
    x: { show: false },
    marker: { show: false },
    fixed: { enabled: false },
    y: { title: { formatter: () => "" } }
  }
};

export const options7 = {
  chart: {
    type: "bar",
    width: "20%",
    height: 30,
    sparkline: { enabled: true }
  },
  colors: ["#c43235"],
  plotOptions: { bar: { columnWidth: "40%" } },
  labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  series: [{ data: [25, 15, -35, -35, -55, -75, -100, -75, -55, -35, -25, -15, -15] }],
  xaxis: { crosshairs: { width: 1 } },
  tooltip: {
    x: { show: false },
    marker: { show: false },
    fixed: { enabled: false },
    y: { title: { formatter: () => "" } }
  }
};

export const options8 = {
  chart: {
    height: 20,
    type: "bar",
    width: "20%",
    sparkline: { enabled: true }
  },
  series: [{ data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54] }],
  tooltip: {
    x: { show: false },
    marker: { show: false },
    fixed: { enabled: false },
    y: { title: { formatter: () => "" } }
  }
};
