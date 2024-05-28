import { useState, useEffect } from "react";
import { verifyemail } from "../apicalls/auth";
import { useParams } from "react-router-dom";
import { message } from "antd";

const VerifyEmail = () => {
  const [emailVerified, setEmailVerified] = useState<string | null>(null);
  const params = useParams();

  const verifyToken = async () => {
    const tokenObj = {
      token: params.id,
    };
    try {
      message.loading("Wait, your email is getting verified...", 0.5);
      const response = await verifyemail(tokenObj);
      if (response?.success) {
        setTimeout(() => {
          message.success(response?.message);
          setEmailVerified("true");
        }, 500);
      } else {
        setTimeout(() => {
          message.error("Invalid token or token expired.");
          setEmailVerified("false");
        }, 500);
      }
    } catch (error: any) {
      setTimeout(() => {
        message.error(error.message);
        setEmailVerified("false");
      }, 500);
    }
  };

  useEffect(() => {
    verifyToken();
  }, [params.id]);

  return (
    <div className="flex flex-col items-center justify-center -mt-[2rem] h-screen bg-white">
      {emailVerified === "true" && (
        <div className="w-full max-w-md p-6 bg-green-500/10 border border-green-500 text-white text-center rounded-md animate-fadeIn">
          <h2 className="text-xl font-bold text-green-500">Email Verified</h2>
          <p className="mt-2 text-green-500">
            Your email has been successfully verified!
          </p>
          <p className="mt-2 text-green-500">You can now login .</p>
        </div>
      )}
      {emailVerified === "false" && (
        <div className="w-full max-w-md p-6 bg-red-500/10 border border-red-500 text-white text-center rounded-md animate-fadeIn">
          <h2 className="text-xl font-bold text-red-500">
            Verification Failed
          </h2>
          <p className="mt-2 text-red-500">
            Invalid token or token expired. Please try again.
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
