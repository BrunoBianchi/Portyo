import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
    {path:'/',file:"routes/home.tsx"},
    {path:'/login',file:"routes/login.tsx"},
    {path:'/signup',file:"routes/signup.tsx"}
] satisfies RouteConfig;
