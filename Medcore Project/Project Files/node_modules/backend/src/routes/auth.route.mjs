import {Router} from "express";

const router = Router();

router.get("/", (req, res) => {
    res.send({message: "API is running"});
});

// router.post("/register");
// router.post("/login");

export default router;
