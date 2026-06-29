import clsx from "clsx";

export default function FormWizardNav(props) {
  const dots = [];
  for (let i = 1; i <= props.totalSteps; i += 1) {
    const isActive = props.currentStep === i;
    dots.push(
      <div
        key={i}
        onClick={() => props.goToStep(i)}
        className={clsx({
          "step-active": isActive,
          "cursor-pointer": !isActive,
          "p-2 px-3 pt-0": i !== 1,
          "p-2 px-3 pl-0 pt-0": i === 1
        })}>
        <h5 className={clsx("m-0 mb-1 text-14", { "text-primary": isActive })}>Step {i}</h5>
        <small>This is step description</small>
      </div>
    );
  }

  return <div className="d-flex flex-wrap form-wizard mb-3">{dots}</div>;
}
