import React, { useState } from "react";
import { zSchema } from "../../lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import ButtonLoading from "./ButtonLoading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { showToast } from "../../lib/showToast";
import axios from "axios";
const OTPVerification = ({ email, onSubmit, loading }) => {
  const formSchema = zSchema.pick({
    otp: true,
    email: true,
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
      email: email,
    },
  });
  const handleOtpVerification = async (values) => {
    onSubmit(values.otp);
  };

  const [isResendingOtp, setIsResendingOtp] = useState(false);

  const resendOTP = async () => {
    try {
      setIsResendingOtp(true);
      const { data: resendOtpResponse } = await axios.post(
        "/api/auth/resend-otp",
        { email }
      );
      if (!resendOtpResponse.success) {
        throw new Error(resendOtpResponse.message);
      }
      showToast("success", resendOtpResponse.message);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleOtpVerification)}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              Please Complete Verification
            </h1>
            <p className="text-md">
              We have sent an One-Time Password to your registered email
              address. The OTP is valid for 10 minutes
            </p>
          </div>
          <div className="flex mb-5 mt-5 justify-center items-center">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot className="text-xl size-10" index={0} />
                        <InputOTPSlot className="text-xl size-10" index={1} />
                        <InputOTPSlot className="text-xl size-10" index={2} />
                        <InputOTPSlot className="text-xl size-10" index={3} />
                        <InputOTPSlot className="text-xl size-10" index={4} />
                        <InputOTPSlot className="text-xl size-10" index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mb-3">
            <ButtonLoading
              loading={loading}
              type="submit"
              text="Verify"
              className="w-full cursor-pointer"
            />
            <div className="text-center mt-5">
              {!isResendingOtp ? (
                <button
                  onClick={resendOTP}
                  type="button"
                  className="text-blue-500 cursor-pointer hover:underline"
                >
                  Resend OTP
                </button>
              ) : (
                <span className="text-md">Resending.....</span>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OTPVerification;
