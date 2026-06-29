import { useEffect, useState } from "react";
import {
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
  VictoryPolarAxis,
  VictoryBar,
  VictoryStack
} from "victory";
import * as _ from "lodash";

const directions = {
  0: "E",
  45: "NE",
  90: "N",
  135: "NW",
  180: "W",
  225: "SW",
  270: "S",
  315: "SE"
};

const orange = { base: "gold", highlight: "darkOrange" };

const red = { base: "tomato", highlight: "orangeRed" };

const innerRadius = 30;

function CompassCenter({ origin }) {
  const circleStyle = { strokeWidth: 2, stroke: red.base, fill: orange.base };
  return (
    <g>
      <circle cx={origin.x} cy={origin.y} r={innerRadius} style={circleStyle} />
    </g>
  );
}

function CenterLabel({ datum, active, color }) {
  const text = [`${directions[datum._x]}`, `${Math.round(datum._y1)} mph`];
  const baseStyle = { fill: color.highlight, textAnchor: "middle" };
  const style = [
    { ...baseStyle, fontSize: 12 },
    { ...baseStyle, fontSize: 18, fontWeight: "bold" }
  ];

  return active ? <VictoryLabel text={text} style={style} x={175} y={175} renderInPortal /> : null;
}

export default function StackedPolarBar() {
  const getWindData = () => {
    return _.keys(directions).map((d) => {
      const speed = Math.floor(_.random() * 17) + 4;
      return { windSpeed: speed, windGust: speed + _.random(2, 10), windBearing: +d };
    });
  };

  const [state, setState] = useState({ wind: getWindData() });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState({ wind: getWindData() });
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <VictoryChart
      polar
      innerRadius={innerRadius}
      domainPadding={{ y: 10 }}
      theme={VictoryTheme.material}
      style={{ parent: { maxWidth: "320px" } }}
      animate={{ duration: 500, onLoad: { duration: 500 } }}
      events={[
        {
          childName: "all",
          target: "data",
          eventHandlers: {
            onMouseOver: () => {
              return [
                { target: "labels", mutation: () => ({ active: true }) },
                { target: "data", mutation: () => ({ active: true }) }
              ];
            },
            onMouseOut: () => {
              return [
                { target: "labels", mutation: () => ({ active: false }) },
                { target: "data", mutation: () => ({ active: false }) }
              ];
            }
          }
        }
      ]}>
      <VictoryPolarAxis
        dependentAxis
        labelPlacement="vertical"
        style={{ axis: { stroke: "none" } }}
        tickFormat={() => ""}
      />
      <VictoryPolarAxis
        labelPlacement="parallel"
        tickValues={_.keys(directions).map((k) => +k)}
        tickFormat={_.values(directions)}
      />
      <VictoryStack>
        <VictoryBar
          style={{
            data: { fill: ({ active }) => (active ? orange.highlight : orange.base), width: 40 }
          }}
          data={state.wind}
          x="windBearing"
          y="windSpeed"
          labels={() => ""}
          labelComponent={<CenterLabel color={orange} />}
        />
        <VictoryBar
          style={{
            data: { fill: (d, a) => (a ? red.highlight : red.base), width: 40 }
          }}
          x="windBearing"
          data={state.wind}
          y={(d) => d.windGust - d.windSpeed}
          labels={() => ""}
          labelComponent={<CenterLabel color={red} />}
        />
      </VictoryStack>
      <CompassCenter />
    </VictoryChart>
  );
}
