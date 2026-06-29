import StepWizard from "react-step-wizard";
import { Button, Col, Row } from "react-bootstrap";

import Breadcrumb from "app/components/Breadcrumb";
import FormWizardNav from "./FormWizardNav";

export default function FormsWizard() {
  return (
    <section>
      <Breadcrumb routeSegments={[{ name: "Forms", path: "/forms" }, { name: "Forms Wizard" }]} />

      <Row>
        <Col md={12}>
          <StepWizard nav={<FormWizardNav />} initialStep={1} isHashEnabled={true}>
            <FirstComponent hashkey="first" />
            <FirstComponent hashkey="second" />
            <FirstComponent hashkey="third" />
            <FirstComponent hashkey="fourth" />
          </StepWizard>
        </Col>
      </Row>
    </section>
  );
}

const FirstComponent = (props) => {
  let { nextStep, previousStep, lastStep, firstStep, currentStep, totalSteps } = props;

  return (
    <div>
      <div>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
        galley of type and scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
        It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
        passages, and more recently with desktop publishing software like Aldus PageMaker including
        versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when
        an unknown printer took a galley of type and scrambled it to make a type specimen book. It
        has survived not only five centuries, but also the leap into electronic typesetting,
        remaining essentially unchanged. It was popularised in the 1960s with the release of
        Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
        software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy
        text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
        dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled
        it to make a type specimen book. It has survived not only five centuries, but also the leap
        into electronic typesetting, remaining essentially unchanged. It was popularised in the
        1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently
        with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
        galley of type and scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
        It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
        passages, and more recently with desktop publishing software like Aldus PageMaker including
        versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when
        an unknown printer took a galley of type and scrambled it to make a type specimen book. It
        has survived not only five centuries, but also the leap into electronic typesetting,
        remaining essentially unchanged. It was popularised in the 1960s with the release of
        Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
        software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy
        text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
        dummy text ever since the
      </div>

      <div className="d-flex justify-content-end mt-4">
        <Button className="mx-2" variant="danger" onClick={firstStep}>
          Cancel
        </Button>

        <Button disabled={currentStep === 1} className="mx-1" variant="info" onClick={previousStep}>
          Previous
        </Button>

        <Button
          disabled={currentStep === totalSteps}
          className="mx-1"
          variant="info"
          onClick={nextStep}>
          Next
        </Button>

        <Button disabled={false} className="mx-1" variant="primary" onClick={lastStep}>
          Finish
        </Button>
      </div>
    </div>
  );
};
