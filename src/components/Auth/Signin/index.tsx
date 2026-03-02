"use client";

import { useSearchParams } from "next/navigation";
import GoogleSigninButton from "../GoogleSigninButton";
import SigninWithPassword from "../SigninWithPassword";

export default function Signin() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <>
      {error === "access_denied" && (
        <div className="mb-6 rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm font-medium text-red">
          ⛔ Access denied. Your email is not authorized to use this admin panel.
        </div>
      )}

      <GoogleSigninButton text="Sign in" />

      <div className="my-6 flex items-center justify-center">
        <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
        <div className="block w-full min-w-fit bg-white px-3 text-center font-medium dark:bg-gray-dark">
          Or sign in with email
        </div>
        <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
      </div>

      <div>
        <SigninWithPassword />
      </div>
    </>
  );
}
