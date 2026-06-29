import { useEffect, useState } from "react";
import { range, random } from "lodash";
import { VictoryChart, VictoryTheme, VictoryStack, VictoryArea, VictoryContainer } from "victory";

const getData = () => {
  return range(7).map(() => {
    return [
      { x: 1, y: random(1, 5) },
      { x: 2, y: random(1, 10) },
      { x: 3, y: random(2, 10) },
      { x: 4, y: random(2, 10) },
      { x: 5, y: random(2, 15) }
    ];
  });
};

export default function VictoryAreaAnimation() {
  const [state, setState] = useState({ data: getData() });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState({ data: getData() });
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="h-320">
      <VictoryChart
        width={700}
        containerComponent={<VictoryContainer responsive={true} />}
        animate={{ duration: 1000 }}
        theme={VictoryTheme.material}
        style={{ label: { fontSize: 45 } }}>
        <VictoryStack colorScale={"blue"}>
          {state.data.map((data, i) => (
            <VictoryArea key={i} data={data} interpolation={"basis"} />
          ))}
        </VictoryStack>
      </VictoryChart>
    </div>
  );
}
