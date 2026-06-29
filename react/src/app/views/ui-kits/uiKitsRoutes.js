import { lazy } from "react";

const AppTab = lazy(() => import("./tabs/AppTab"));
const AppList = lazy(() => import("./lists/AppList"));
const AppCard = lazy(() => import("./cards/AppCards"));
const AppBadge = lazy(() => import("./badges/AppBadge"));
const AppAlert = lazy(() => import("./alerts/AppAlert"));
const AppTable = lazy(() => import("./tables/AppTable"));
const AppModal = lazy(() => import("./modals/AppModal"));
const AppSlider = lazy(() => import("./slider/AppSlider"));
const AppRating = lazy(() => import("./ratings/AppRating"));
const AppButton = lazy(() => import("./buttons/AppButton"));
const AppTooltip = lazy(() => import("./tooltip/AppTooltip"));
const AppPopover = lazy(() => import("./popover/AppPopover"));
const AppCarousel = lazy(() => import("./carousel/AppCarousel"));
const CardMetrics = lazy(() => import("./card-metrics/CardMetrics"));
const AppAccordion = lazy(() => import("./accordions/AppAccordion"));
const AppPagination = lazy(() => import("./pagination/AppPagination"));
const AppProgressbar = lazy(() => import("./progressbar/AppProgressbar"));
const AppCollapsible = lazy(() => import("./collapsibles/AppCollapsibles"));

const uiKitsRoutes = [
  { path: "/uikits/alerts", element: <AppAlert /> },
  { path: "/uikits/accordions", element: <AppAccordion /> },
  { path: "/uikits/badges", element: <AppBadge /> },
  { path: "/uikits/buttons", element: <AppButton /> },
  { path: "/uikits/tabs", element: <AppTab /> },
  { path: "/uikits/cards", element: <AppCard /> },
  { path: "/uikits/cards-metrics", element: <CardMetrics /> },
  { path: "/uikits/carousel", element: <AppCarousel /> },
  { path: "/uikits/collapsibles", element: <AppCollapsible /> },
  { path: "/uikits/lists", element: <AppList /> },
  { path: "/uikits/paginations", element: <AppPagination /> },
  { path: "/uikits/popover", element: <AppPopover /> },
  { path: "/uikits/progressbar", element: <AppProgressbar /> },
  { path: "/uikits/tables", element: <AppTable /> },
  { path: "/uikits/tooltip", element: <AppTooltip /> },
  { path: "/uikits/modals", element: <AppModal /> },
  { path: "/uikits/sliders", element: <AppSlider /> },
  { path: "/uikits/rating", element: <AppRating /> }
];

export default uiKitsRoutes;
