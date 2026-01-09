import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home";
import Room from "./components/Room";

export default function App() {
    const routes = createBrowserRouter([
        {
            path: "/",
            element: <Home />
        },
        {
            path: "/room/:roomId",
            element: <Room />
        }
    ]);

    return (
        <>
            <RouterProvider router={routes} />
        </>
    );
}
