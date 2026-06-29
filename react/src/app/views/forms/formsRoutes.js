import { lazy } from "react";

const TagInput = lazy(() => import("./TagInput"));
const FormBasic = lazy(() => import("./FormBasic"));
const LayoutForm = lazy(() => import("./LayoutForm"));
const FormEditor = lazy(() => import("./FormEditor"));
const FormsWizard = lazy(() => import("./FormsWizard"));
const ActionBarForm = lazy(() => import("./ActionBarForm"));
const InputGroupForm = lazy(() => import("./InputGroupForm"));
const FormValidation = lazy(() => import("./FormValidation"));
const MultiColumnForms = lazy(() => import("./MultiColumnForms"));

const formsRoutes = [
  { path: "/forms/basic", element: <FormBasic /> },
  { path: "/forms/action-bar", element: <ActionBarForm /> },
  { path: "/forms/layouts", element: <LayoutForm /> },
  { path: "/forms/multi-column-forms", element: <MultiColumnForms /> },
  { path: "/forms/input-group", element: <InputGroupForm /> },
  { path: "/forms/form-validation", element: <FormValidation /> },
  { path: "/forms/forms-wizard", element: <FormsWizard /> },
  { path: "/forms/form-editor", element: <FormEditor /> },
  { path: "/forms/tag-input", element: <TagInput /> }
];

export default formsRoutes;
