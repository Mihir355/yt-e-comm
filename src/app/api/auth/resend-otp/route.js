import { connectDB } from "@/lib/databaseConnection";
import { zSchema } from "../../../../lib/zodSchema";
import {
  catchError,
  generateOTP,
  response,
} from "../../../../lib/helperFunction";
import UserModel from "../../../../models/User.model";
import OTPModel from "../../../../models/Otp.model";
import { sendMail } from "../../../../lib/sendMail";
import { otpEmail } from "../../../../email/otpEmail";

export async function POST(request) {
  try {
    await connectDB();
    const payload = await request.json();
    const validationSchema = zSchema.pick({ email: true });
    const validatedData = validationSchema.safeParse(payload);
    if (!validatedData.success) {
      return response(
        false,
        401,
        "Invalid or missing input field",
        validatedData.error
      );
    }

    const { email } = validatedData.data;

    const getUser = await UserModel.findOne({ email });
    if (!getUser) {
      return response(false, 404, "User not found");
    }

    await OTPModel.deleteMany({ email });
    const otp = generateOTP();
    const newOtpDate = new OTPModel({
      email,
      otp,
    });
    await newOtpDate.save();
    const otpSendStatus = await sendMail(
      "Your login verification code",
      email,
      otpEmail(otp)
    );
    if (!otpSendStatus.success) {
      return response(false, 400, "Fialed to resend otp");
    }
    return response(true, 200, "OTP Sent successfully");
  } catch (error) {
    return catchError(error);
  }
}
