import { useState } from "react";
import Joyride from "react-joyride";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

import Breadcrumb from "app/components/Breadcrumb";

export default function AppTour() {
  const [run, setRun] = useState(false);
  const [steps] = useState([
    {
      locale: { skip: <strong aria-label="skip">Skip</strong> },
      placement: "center",
      target: "body",
      title: "Let's begin our journey!",
      content: (
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo quas amet itaque voluptate
          odit dolorem, consequatur aspernatur nihil nobis tempore?
        </p>
      )
    },
    {
      floaterProps: { disableAnimation: true },
      spotlightPadding: 15,
      target: "#buy-gull",
      title: "Click here to buy Gull React",
      content: (
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo quas amet itaque voluptate
          odit dolorem, consequatur aspernatur nihil nobis tempore?
        </p>
      )
    },
    {
      content: "Click here to change layout, color etc",
      placement: "left",
      target: ".handle",
      title: "Customizer"
    }
  ]);

  return (
    <div>
      <Breadcrumb
        routeSegments={[
          { name: "Home", path: "/" },
          { name: "Extra Kits", path: "/extra-kits" },
          { name: "User Tour" }
        ]}
      />

      <Card body>
        <Card.Title>User Tour</Card.Title>
        <Button onClick={() => setRun(true)}>Start Tour</Button>

        <Joyride
          continuous
          showProgress
          showSkipButton
          scrollToFirstStep
          run={run}
          steps={steps}
          styles={{
            options: { zIndex: 10000 },
            tooltipContainer: { textAlign: "unset", lineHeight: "unset" },
            tooltipContent: { padding: "1.25rem 0" },
            tooltipTitle: { fontSize: "1.25rem" },
            tooltip: { padding: "1.25rem" }
          }}
        />
      </Card>
    </div>
  );
}
