import {createBrowserRouter} from "react-router-dom";
import Register from "./components/User/Register";
import Login from "./components/User/Login";
import ProtectedRoute from "./components/Protectedroute";
import { Dashboard } from "./components/pages/Dashboard";
import ConnectStripe from "./components/pages/Connectstripe";


export const router=createBrowserRouter(
    [
        {
            path:"/register",
            element:<Register/>
        },
        {
            path:"/",
            element:<Login/>
        },
        {
            element:<ProtectedRoute/>,
            children:[
                {
                    path:"/dashboard",
                    element:<Dashboard/>
                },
                { path: "/connect-stripe", 
                    element: <ConnectStripe /> 
                }
            ]
        }

      

        
    ]
)