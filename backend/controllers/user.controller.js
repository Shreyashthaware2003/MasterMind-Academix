import { User } from "../models/user.model.js";
import config from "../config.js";
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import jwt from "jsonwebtoken";
import { Purchase } from "../models/purchase.model.js";
import { Course } from "../models/course.model.js";

// signup
export const signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const userSchema = z.object({
        firstName: z.string().min(3, { message: "First name must be atleast 3 char long, " }),
        lastName: z.string().min(3, { message: "Last name must be atleast 3 char long, " }),
        email: z.string().email(),
        password: z.string().min(6, { message: "password must be atleast 6 char long " }),
    })

    const validateData = userSchema.safeParse(req.body);
    if (!validateData.success) {
        return res.status(400).json({ errors: validateData.error.issues.map(err => err.message) })
    }

    const hashPassword = await bcrypt.hash(password, 10);

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(409).json({ errors: "User already exists" })
        }

        const newUser = new User({ firstName, lastName, email, password: hashPassword });
        await newUser.save();
        res.status(201).json({ message: "Signup successfully", newUser })
    } catch (error) {
        res.status(500).json({ errors: "Error in signup" })
        console.log("Error in signup", error);
    }
}

// Signin
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(403).json({ errors: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(403).json({ errors: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, config.JWT_USER_PASSWORD, { expiresIn: "1d" });

        console.log("✅ Generated Token:", token);
        console.log("✅ User ID:", user._id);

        res.status(201).json({
            message: "Login successful",
            user: {
                id: user._id.toString(),  // ✅ Convert ObjectId to string
                email: user.email,
            },
            token,
        });

    } catch (error) {
        console.error("❌ Error in login:", error);
        res.status(500).json({ errors: "Error in login" });
    }
};


// logout
export const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({ errors: "No token provided" });
        }

        res.clearCookie("jwt"); // Clear cookie if using cookies
        res.status(200).json({ message: "Logged out successfully" });

    } catch (error) {
        res.status(500).json({ errors: "Error in logout" });
        console.log("Error in logout", error);
    }
};

// purchases
export const purchase = async (req, res) => {
    const userId = req.userId;

    try {
        const purchases = await Purchase.find({ userId })

        let purchasedCourseId = []

        for (let i = 0; i < purchases.length; i++) {
            purchasedCourseId.push(purchases[i].courseId)
        }
        const courseData = await Course.find({
            _id: { $in: purchasedCourseId }
        })

        res.status(200).json({ purchases, courseData });
    } catch (error) {
        res.status(500).json({ errors: "Error in purchases" })
        console.log("Error in purchase", error);
    }
}