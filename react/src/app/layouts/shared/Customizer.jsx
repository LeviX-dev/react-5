import merge from "lodash/merge";
import { useDispatch, useSelector } from "react-redux";
import ScrollBar from "react-perfect-scrollbar";
import clsx from "clsx";

import { setLayoutSettings } from "app/redux/layout/layoutSlice";

export default function Customizer() {
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.layout);
  let { activeLayout } = settings;

  const sidebarColors = [
    { name: "gradient-purple-indigo" },
    { name: "gradient-black-blue" },
    { name: "gradient-black-gray" },
    { name: "gradient-steel-gray" },
    { name: "dark-purple" },
    { name: "slate-gray" },
    { name: "midnight-blue" },
    { name: "blue" },
    { name: "indigo" },
    { name: "pink" },
    { name: "red" },
    { name: "purple" }
  ];

  const handleLayoutChange = (layoutName) => {
    const merged = merge({}, settings, { activeLayout: layoutName });
    dispatch(setLayoutSettings(merged));
  };

  const handleCustomizerToggle = () => {
    const merged = merge({}, settings, { customizer: { open: !settings.customizer.open } });
    dispatch(setLayoutSettings(merged));
  };

  const handleDirectionChange = () => {
    let dir = settings.dir === "rtl" ? "ltr" : "rtl";
    document.documentElement.setAttribute("dir", dir);

    dispatch(setLayoutSettings(merge({}, settings, { dir: dir })));
  };

  const changeSidebarColor = (colorClass) => {
    const merged = merge({}, settings, { layout2Settings: { leftSidebar: { theme: colorClass } } });
    dispatch(setLayoutSettings(merged));
  };

  return (
    <div id="customizer" className={clsx({ customizer: true, open: settings.customizer.open })}>
      <div className="handle" onClick={handleCustomizerToggle}>
        <i className="i-Gear spin" />
      </div>

      <ScrollBar className="customizer-body" data-perfect-scrollbar data-suppress-scroll-x="true">
        <div className="accordion" id="accordionCustomizer">
          <div className="card">
            <div>
              <div className="card-header">
                <p className="mb-0">Sidebar Layout</p>
              </div>

              <div className="card-body layouts">
                <div
                  className={clsx({ "layout-box": true, active: activeLayout === "layout1" })}
                  onClick={() => handleLayoutChange("layout1")}>
                  <img src="/assets/images/screenshots/04_preview.png" alt="layout" />
                  <i className="i-Eye" />
                </div>

                <div
                  className={clsx({ "layout-box": true, active: activeLayout === "layout2" })}
                  onClick={() => handleLayoutChange("layout2")}>
                  <img src="/assets/images/screenshots/02_preview.png" alt="layout" />
                  <i className="i-Eye" />
                </div>
              </div>
            </div>

            {settings.activeLayout === "layout2" && (
              <div>
                <div className="card-header rounded-0" id="headingOne">
                  <p className="mb-0">Sidebar Colors</p>
                </div>

                <div className="card-body">
                  <div className="colors sidebar-colors">
                    {sidebarColors.map((c, i) => (
                      <span
                        key={i}
                        title={c.name}
                        className={`color ${c.name}`}
                        onClick={() => changeSidebarColor(`sidebar-${c.name}`)}>
                        <i className="i-Eye" />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RTL */}
            <div>
              <div className="card-header rounded-0">
                <p className="mb-0">RTL</p>
              </div>

              <div className="card-body">
                <label className="checkbox checkbox-primary">
                  <input
                    type="checkbox"
                    id="rtl-checkbox"
                    onChange={handleDirectionChange}
                    checked={settings.dir === "rtl" ? true : false}
                  />
                  <span>Enable RTL</span>
                  <span className="checkmark"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </ScrollBar>
    </div>
  );
}
