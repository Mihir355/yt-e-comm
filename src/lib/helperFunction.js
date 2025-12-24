import { NextResponse } from "next/server";
export const response = (success, statusCode, message, data = {}) => {
  return NextResponse.json({
    success,
    statusCode,
    message,
    data,
  });
};

export const catchError = (error, customMessage = "Something went wrong") => {
  if (error.code === 11000) {
    const keys = Object.keys(error.keyPattern).join(",");
    error.message = `Duplicate fields: ${keys}. These fields value must be unique.`;
  }

  if (process.env.NODE_ENV === "development") {
    return response(false, error.code || 500, error.message, { error });
  }

  return response(false, error.code || 500, customMessage);
};

export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 90000).toString();
  return otp;
};
