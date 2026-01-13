import { Router } from "express";

const router: Router = Router();

router.post("/logout", (req, res) => {
    // Clear session
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
            }
        });
    }

    // Clear Refresh Token Cookie
    res.clearCookie('refreshToken', {
        httpOnly: true,
        path: '/'
    });

    // Clear Connect.sid Cookie (Session)
    res.clearCookie('connect.sid', {
        path: '/'
    });

    res.status(200).json({ message: "Logged out successfully" });
});

export default router;
