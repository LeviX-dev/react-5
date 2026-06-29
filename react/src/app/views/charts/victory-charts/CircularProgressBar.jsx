import { useEffect, useState } from "react";
import { VictoryPie, VictoryAnimation, VictoryLabel } from "victory";

export default function CircularProgressBar() {
  const [state, setState] = useState({
    percent: 0,
    data: [
      { x: 1, y: 0 },
      { x: 2, y: 100 }
    ]
  });

  useEffect(() => {
    let percent = 25;

    const interval = window.setInterval(() => {
      percent += 25;
      percent = percent > 100 ? 0 : percent;
      setState({
        percent,
        data: [
          { x: 1, y: percent },
          { x: 2, y: 100 - percent }
        ]
      });
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "320px" }}>
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <VictoryPie
          standalone={false}
          animate={{ duration: 1000 }}
          width={400}
          height={400}
          data={state.data}
          innerRadius={120}
          cornerRadius={25}
          labels={() => null}
          style={{
            data: {
              fill: ({ datum }) => {
                const color = datum.y > 30 ? "green" : "red";
                return datum.x === 1 ? color : "transparent";
              }
            }
          }}
        />

        <VictoryAnimation duration={1000} data={state}>
          {(newProps) => (
            <VictoryLabel
              x={200}
              y={200}
              textAnchor="middle"
              verticalAnchor="middle"
              text={`${Math.round(newProps.percent)}%`}
              style={{ fontSize: 45 }}
            />
          )}
        </VictoryAnimation>
      </svg>
    </div>
  );
}
