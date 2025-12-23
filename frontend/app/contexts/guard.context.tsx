import { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import AuthContext from "./auth.context";

type Plan = 'free' | 'standard' | 'pro';

interface AuthorizationGuardProps {
    children: React.ReactNode;
    minPlan?: Plan;
    requiredPlan?: Plan;
    requiredRole?: number;
    redirectTo?: string;
    fallback?: React.ReactNode;
}

const PLAN_LEVELS: Record<Plan, number> = {
    free: 0,
    standard: 1,
    pro: 2
};

export function AuthorizationGuard({ 
    children, 
    minPlan,
    requiredPlan,
    requiredRole,
    redirectTo = "/login",
    fallback
}: AuthorizationGuardProps) {
    const { user, signed, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const userPlan = user?.plan || 'free';
    const userRole = user?.role || 0;
    
    const isAuthorized = () => {
        if (loading) return true; 
        if (!signed) return false;
        if (requiredPlan && userPlan !== requiredPlan) return false;
        
        if (minPlan) {
            if (PLAN_LEVELS[userPlan] < PLAN_LEVELS[minPlan]) return false;
        }

        if (requiredRole !== undefined) {
            if (userRole < requiredRole) return false;
        }
        
        return true;
    };

    const authorized = isAuthorized();

    useEffect(() => {
        if (!loading && !authorized && !fallback) {
            if (!signed) {
                navigate(redirectTo, { state: { from: location } });
            }  else {
                navigate("/"); 
            }
        }
        if(!user?.verified){
                navigate("/verify-email")
            }
    }, [authorized, loading, fallback, navigate, redirectTo, signed, location]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }

    if (!authorized) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
}

export function GuestGuard({ children, redirectTo = "/" }: { children: React.ReactNode, redirectTo?: string }) {
    const { signed, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && signed) {
            navigate(redirectTo);
        }
    }, [signed, loading, navigate, redirectTo]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }

    if (signed) return null;

    return <>{children}</>;
}

export default AuthorizationGuard;