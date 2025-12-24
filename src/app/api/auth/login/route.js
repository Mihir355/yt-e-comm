import { connectDB } from "@/lib/databaseConnection";
import { zSchema } from "@/lib/zodSchema";
import { z } from "zod";
import { catchError } from "@/lib/helperFunction";
import UserModel from "../../../../models/User.model";
import OTPModel from "../../../../models/Otp.model";
import { generateOTP, response } from "../../../../lib/helperFunction";
import { SignJWT } from "jose";
import { sendMail } from "../../../../lib/sendMail";
import { emailVerificationLink } from "../../../../email/emailVerificationLink";
import { otpEmail } from "../../../../email/otpEmail";
export async function POST(request) {
  try {
    await connectDB();
    const payload = await request.json();
    const validationSchema = zSchema
      .pick({
        email: true,
      })
      .extend({
        password: z.string(),
      });
    const validatedData = validationSchema.safeParse(payload);
    if (!validatedData.success) {
      return responseCookiesToRequestCookies(
        false,
        401,
        "Invalid or missing input field.",
        validatedData.error
      );
    }
    const { email, password } = validatedData.data;
    const getUser = await UserModel.findOne({ deletedAt: null, email }).select(
      "+password"
    );
    if (!getUser) {
      return response(false, 400, "Invalid login credentials");
    }

    if (!getUser.isEmailVerified) {
      const secret = new TextEncoder().encode(process.env.SECRET_KEY);
      const token = await new SignJWT({ userId: getUser._id })

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
        false,
        401,
        "Your email is not verified. We have sent a verification link to your registered email address"
      );
    }

    const isPasswordVerified = await getUser.comparePassword(password);

    if (!isPasswordVerified) {
      return response(false, 400, "Invalid login credentials");
    }

    await OTPModel.deleteMany({ email });
    const otp = generateOTP();

    const newOtpDate = new OTPModel({
      email,
      otp,
    });
    await newOtpDate.save();
    const otpEmailStatus = await sendMail(
      "Your login verification code",
      email,
      otpEmail(otp)
    );
    if (!otpEmailStatus.success) {
      return response(false, 400, "Failed to send OTP");
    }
    return response(true, 200, "Please verify your device");
  } catch (error) {
    return catchError(error);
  }
}
