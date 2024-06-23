import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
import { message } from "antd";

import { resetPassword } from "@/apicalls/auth";

// schema
const formSchem = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(10, "Password must be at most 10 characters long"),
  confirmPassword: z.string(),
  //   }),
});

const ResetPassword = () => {
  const params = useParams();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchem),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = (data: z.infer<typeof formSchem>) => {
    console.log("data: ", data);
    setLoading(true);

    const tokenObj = {
      token: params.id,
      password: data.password,
    };

    resetPassword(tokenObj)
      .then((response) => {
        console.log("response: ", response);
        if (response?.success) {
          // loading message for 0.5 seconds
          message.loading("Wait, your password is getting reset...", 0.5);
          message.success(response?.message);
          setLoading(false);
        } else {
          message.error(response?.message);
          setLoading(false);
        }
      })
      .catch((error: any) => {
        message.error(error.message);
        setLoading(false);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Password</label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <input
                type="password"
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">
            Confirm Password
          </label>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <input
                type="password"
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg text-white font-bold ${
            loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
