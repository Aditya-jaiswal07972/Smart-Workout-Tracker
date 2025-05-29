import path from "path";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
const port = process.env.PORT || 5123;
import userRoutes from "./routes/userRoutes.js";
import userStatusRoutes from "./routes/userStatusRoutes.js";
import UserMealPlanRoutes from "./routes/UserMealPlanRoutes.js";
import passport from 'passport';
import bodyParser from 'body-parser';
import session from "express-session";
import cors from "cors"
import mongoose from "mongoose";
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';


import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';


connectDB();

const app = express();

app.use(
  cors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
  })
)



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(express.static("public"))
app.use(cookieParser())


app.use("/api/users", userRoutes);
app.use("/api/user", userStatusRoutes);
app.use("/api/user", UserMealPlanRoutes);


const MODEL_NAME = "gemini-2.0-flash";
const API_KEY = process.env.GEMINI_API_KEY;
// Middleware to handle HTTP post requests
app.use(bodyParser.json()); // To handle JSON body

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret:"This is the secret key",
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

async function runChat(userInput) {
	const genAI = new GoogleGenerativeAI(API_KEY);
	const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
	const generationConfig = {
	  temperature: 0.9,
	  topK: 1,
	  topP: 1,
	  maxOutputTokens: 1000,
	};
  
	const safetySettings = [
	  {
		category: HarmCategory.HARM_CATEGORY_HARASSMENT,
		threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
	  },
	  // ... other safety settings
	];
  
	const chat = model.startChat({
	  generationConfig,
	  safetySettings,
	  history: [
		{
		  role: "user",
		  parts: [
			{text: "Hi\n"},
		  ],
		},

    {
		  role: "model",
		  parts: [
			{text: "Hi, Welcome to SmartRep, how may i help you??\n"},
		  ],
		},

        {
            role: "user",
            parts: [
              {text: "what is SmartRep \n"},
            ],
          },

    {
		  role: "model",
		  parts: [
			{text: "SmartRep is a comprehensive fitness solution designed to help users achieve their health goals efficiently.\nIt offers a Personal Account feature, allowing users to create and manage their profiles, track progress, and receive personalized recommendations.\nThe Diet Profile enables users to input their dietary preferences, restrictions, and fitness objectives to generate customized meal plans.\n With Goal Settings, users can set specific fitness goals, whether it's weight loss, muscle gain, or maintaining a healthy lifestyle. \n The Meal Planner provides daily and weekly meal suggestions based on the user’s dietary needs, ensuring balanced nutrition.To promote hydration, the Water Intake Log helps users monitor their daily water consumption and sends reminders to stay hydrated.\n Our Workout Database includes a vast collection of exercises categorized by muscle groups, difficulty levels, and fitness goals.\n The Nutrition Checker allows users to scan or manually enter food items to receive detailed nutritional insights, including calorie count, macronutrient distribution, and health benefits. \n Additionally, the Supplement Recommendation feature suggests vitamins, proteins, and other supplements based on the user's fitness requirements and deficiencies.\nA key highlight of our system is the AI Chatbot, which acts as a virtual fitness assistant, answering user queries, providing workout guidance, and offering diet suggestions based on real-time user data.\n The Exercise Tracking with Pose Estimation feature, powered by MediaPipe, ensures users perform exercises with the correct form by analyzing body posture and providing real-time feedback.\n The BMR (Basal Metabolic Rate) Calculator helps users determine their daily calorie needs based on age, gender, weight, and activity level, providing essential insights into energy expenditure.By integrating AI-powered recommendations with real-time tracking and monitoring, our system creates a holistic and personalized fitness experience, ensuring users stay on track with their health and fitness journey.\n"},
		  ],
		},

      {
        role: "user",
        parts: [
          { text: "does SmartRep recommends diets to users" },
        ],
        },
  
        {
          role: "model",
          parts: [
          {text: "Yes, SmartRep provides a diet recommendation system that provides users diets according to their goals\n"},
          ],
        },

        {
            role: "user",
            parts: [
              { text: "does SmartRep has any features which provides detailed nutritional informations of food items" },
            ],
            },
      
            {
              role: "model",
              parts: [
              {text: "Yes the SmartRep has provides a features from where user can get a detailed nutritional information of food items searched \n"},
              ],
            },

		{
            role: "user",
            parts: [
              { text: "can i access exercise/workout feature without login? " },
            ],
            },
      
            {
              role: "model",
              parts: [
              {text: "No, only logged in users have access to exercise/workout feature and persnalised dashboard. but you can use BRM, Nutrition check of food items and features offered without login. \n"},
              ],
            },
	
	
	  ],
	});
	const result = await chat.sendMessage(userInput);
	const response = result.response;
	return response.text();
  }

  app.post('/chat', async (req, res) => {
	try {
	  const userInput = req.body?.userInput;
	  console.log('incoming /chat req', userInput)
	  if (!userInput) {
		return res.status(400).json({ error: 'Invalid request body' });
	  }
  
	  const response = await runChat(userInput);
	  res.json({ response });
	} catch (error) {
	  console.error('Error in chat endpoint:', error);
	  res.status(500).json({ error: 'Internal Server Error' });
	}
  });
  

  const otpSchema = new mongoose.Schema({
	email: String,
	otp: String,
	createdAt: { type: Date, expires: '5m', default: Date.now }
});

const OTP = mongoose.model('OTP', otpSchema);

// Generate OTP and send email
app.post('/generate-otp', async (req, res) => {
	const { email } = req.body;

	const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

	try {
		await OTP.create({ email, otp });

		// Send OTP via email (replace with your email sending logic)
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'adityarudra1409@gmail.com',
				pass: 'vmux qsks hnoz uhmz',
			}
		});

		await transporter.sendMail({
			from: 'adityarudra1409@gmail.com',
			to: email,
			subject: 'OTP Verification',
			text: `Your OTP for verification is: ${otp}`
		});

		res.status(200).send('OTP sent successfully');
	} catch (error) {
		console.error(error);
		res.status(500).send('Error sending OTP');
	}
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
	const { email, otp } = req.body;

	try {
		const otpRecord = await OTP.findOne({ email, otp }).exec();

		if (otpRecord) {
			res.status(200).send('OTP verified successfully');
		} else {
			res.status(400).send('Invalid OTP');
		}
	} catch (error) {
		console.error(error);
		res.status(500).send('Error verifying OTP');
	}
});


app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret:"This is the secret key",
	resave:false,
	saveUninitialized:false
}));


if (process.env.NODE_ENV === "production") {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, "frontend/build")));
  
    app.get("*", (req, res) =>
      res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
    );
  } else {
    app.get("/", (req, res) => res.send("Server is ready"));
  }

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));

export default app;