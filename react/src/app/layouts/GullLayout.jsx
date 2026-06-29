import { Suspense, Fragment, lazy } from "react";
import { useSelector } from "react-redux";

import Customizer from "./shared/Customizer";

const layouts = {
  layout1: lazy(() => import("./layout-1/Layout1")),
  layout2: lazy(() => import("./layout-2/Layout2"))
};

export default function GullLayout({ children }) {
  const { settings } = useSelector((state) => state.layout);

  // SELECTED LAYOUT BASED ON ACTIVE SETTING
  const Layout = layouts[settings.activeLayout];

  return (
    <Suspense>
      <Fragment>
        <Layout>{children}</Layout>
        {settings.customizer.show ? <Customizer /> : null}
      </Fragment>
    </Suspense>
  );
}
