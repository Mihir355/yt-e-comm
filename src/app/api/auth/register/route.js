import { connectDB } from "@/lib/databaseConnection";
import { zSchema } from "@/lib/zodSchema";
import { catchError, response } from "../../../../lib/helperFunction";
import { SignJWT } from "jose";
import UserModel from "../../../../models/User.model";
import { sendMail } from "../../../../lib/sendMail";
import { emailVerificationLink } from "../../../../email/emailVerificationLink";
export async function POST(request) {
  try {
    await connectDB();
    const validationSchema = zSchema.pick({
      name: true,
      email: true,
      password: true,
    });
    const payload = await request.json();
    const validatedData = validationSchema.safeParse(payload);
    if (!validatedData.success) {
      return response(
        false,
        401,
        "Invalid or missing input field",
        validatedData.error
      );
    }
    const { name, email, password } = validatedData.data;
    const checkUser = await UserModel.exists({ email });
    if (checkUser) {
      return response(true, 409, "User already registered.");
    }
    const NewRegistration = new UserModel({
      name,
      email,
      password,
    });
    await NewRegistration.save();

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const token = await new SignJWT({
      userId: NewRegistration._id.toString(), // ✅ FIX
    })
      .setIssuedAt()
      .setExpirationTime("1h")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    await sendMail(
      "Email Verification request from the admin",
      email,
      emailVerificationLink(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email/${token}`
      )
    );

    return response(
      true,
      200,
      "Registration success,Please verify your email address."
    );
  } catch (error) {
    return catchError(error, "User registration failed");
  }
}
