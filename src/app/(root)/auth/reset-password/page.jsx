"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "../../../../../public/assets/images/logo-black.png";
import { zodResolver } from "@hookform/resolvers/zod";
import { zSchema } from "../../../../lib/zodSchema";
import { email } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { showToast } from "../../../../lib/showToast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import ButtonLoading from "../../../../components/Application/ButtonLoading";

import { WEBSITE_LOGIN } from "../../../../../routes/WebsiteRoute";
import axios from "axios";
import OTPVerification from "../../../../components/Application/OTPVerification";
import UpdatePassword from "../../../../components/Application/UpdatePassword";

const ResetPassword = () => {
  const [emailVerificationLoading, setEmailVerificationLoading] =
    useState(false);
  const [otpVerificationLoading, setOtpVerificationLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState();
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const formSchema = zSchema.pick({
    email: true,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleOtpVerification = async (otp) => {
    try {
      setOtpVerificationLoading(true);

      const { data } = await axios.post("/api/auth/reset-password/verify-otp", {
        email: otpEmail,
        otp: otp.toString(),
      });

      if (!data.success) {
        throw new Error(data.message);
      }

      showToast("success", data.message);
      setIsOtpVerified(true);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setOtpVerificationLoading(false);
    }
  };

  const handleEmailVerification = async (values) => {
    try {
      setEmailVerificationLoading(true);

      const { data } = await axios.post(
        "/api/auth/reset-password/send-otp",
        values
      );

      if (!data.success) {
        throw new Error(data.message);
      }

      showToast("success", data.message);
      setOtpEmail(values.email);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  return (
    <Card className="w-[400px]">
      <CardContent>
        <div className="flex justify-center">
          <Image
            src={Logo.src}
            width={Logo.width}
            height={Logo.height}
            alt="logo"
            className="max-w-[150px]"
          />
        </div>
        {!otpEmail ? (
          <>
            {" "}
            <div className="text-center">
              <h1 className="text-2xl font-semibold">Reset Password</h1>
              <p>Enter your email for password reset. </p>
            </div>
            <div className="mt-5">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleEmailVerification)}
                  className="space-y-8"
                >
                  <div className="mb-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="example@gmail.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mb-3">
                    <ButtonLoading
                      loading={emailVerificationLoading}
                      type="submit"
                      text="Send OTP"
                      className="w-full cursor-pointer"
                    />
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center items-center gap-1">
                      <Link
                        href={WEBSITE_LOGIN}
                        className="text-primary underline"
                      >
                        Back to Login
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </>
        ) : (
          <>
            {!isOtpVerified ? (
              <OTPVerification
                email={otpEmail}
                onSubmit={handleOtpVerification}
                loading={otpVerificationLoading}
              />
            ) : (
              <>
                <UpdatePassword email={otpEmail} />
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
