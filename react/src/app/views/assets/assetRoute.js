import React from "react";

const AssetCategory = React.lazy(() =>
  import("./AssetCategory")
);
const AssetList= React.lazy(()=>
import("./AssetList")
);
const assetRoutes = [
  {
    path: "/asset/category",
    element: <AssetCategory />
  },
  {
    path: "/asset/assets",      
    element: <AssetList />
  }
];

export default assetRoutes;
