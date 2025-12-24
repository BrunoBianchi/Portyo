import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
    {path:'/',file:"routes/home.tsx"},
    {path:'/login',file:"routes/login.tsx"},
    {path:'/signup',file:"routes/signup.tsx"},
    {path:'/verify-email',file:"routes/verify-email.tsx"},
    {
        path:'/dashboard',
        file:"routes/dashboard.tsx",
        children: [
            { index: true, file: "routes/dashboard-home.tsx" },
            { path: "editor", file: "routes/dashboard-editor.tsx" },
        ]
    }
] satisfies RouteConfig;
