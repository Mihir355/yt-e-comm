import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "../../../../lib/helperFunction";
import { zSchema } from "../../../../lib/zodSchema";
import OTPModel from "../../../../models/Otp.model";
import UserModel from "../../../../models/User.model";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

export async function POST(request) {
  try {
    await connectDB();
    const payload = await request.json();
    const validationSchema = zSchema.pick({
      otp: true,
      email: true,
    });
    console.log("OTP received:", payload.otp, typeof payload.otp);
    const validatedData = validationSchema.safeParse(payload);
    if (!validatedData.success) {
      return response(
        false,
        400,
        "Invalid or missing input field",
        validatedData.error
      );
    }
    const { email, otp } = validatedData.data;
    const getOtpData = await OTPModel.findOne({ email, otp });
    if (!getOtpData) {
      return response(false, 404, "Invaid or expired otp");
    }
    const getUser = await UserModel.findOne({ deletedAt: null, email }).lean();
    if (!getUser) {
      return response(false, 404, "User not found");
    }

    const loggedInUserData = {
      _id: getUser._id,
      role: getUser.role,
      name: getUser.name,
      avatar: getUser.avatar,
    };
    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const token = await new SignJWT(loggedInUserData)
      .setIssuedAt()
      .setExpirationTime("24h")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set({
      name: "access_token",
      value: token,
      httpOnly: process.env.NODE_ENV === "production",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    await getOtpData.deleteOne();
    return response(true, 200, "Login successfull", loggedInUserData);
  } catch (error) {
    return catchError(error);
  }
}
