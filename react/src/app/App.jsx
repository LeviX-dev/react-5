import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// ALL PAGE ROUTES
import routes from "./routes";
// REDUX STORE
import { store } from "./redux/Store";
// FAKE DB
import "../fake-db";

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={routes} />
      <ToastContainer />
    </Provider>
  );
}
