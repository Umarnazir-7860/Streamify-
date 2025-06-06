import  { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router";
import { useSignup } from "../mutations/useSignup"; // ⬅️ custom hook

const SignupPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
const { mutate: signupMutation, isPending } = useSignup(signupData);

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation();
    // Handle signup logic here, e.g., send data to the server
  };
  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 "
   
    >
      <div
        className=" border border-primary/25 h-[100%] flex flex-col lg:flex-row  w-full max-w-5xl mx-auto 
  bg-base-100  rounded-xl 
  shadow-lg 
  overflow-hidden"
      >
        {/* //signup form left side */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* //logo */}
          <div className=" mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl  font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>
     
          
          {/* singup form */}
          <div>
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div className="ml-3 ">
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Join Streamify & Start Your Journey Now
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text ml-2 ">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Umar Nazir"
                      className="input input-bordered w-full"
                      value={signupData.fullName}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          fullName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text ml-2">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="umarnazir@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text ml-2">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className="input input-bordered w-full"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="text-xs opacity-70 mt-2">
                      Password must be atleast 6 chracters
                    </p>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        required
                      />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">
                          terms of service
                        </span>{" "}
                        and{" "}
                        <span className="text-primary hover:underline">
                          privacy policy
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <button className="btn btn-primary w-full">
                 {isPending ? (
                  <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Loading...
                  </>
                 ) : ( "Create Account" )}
                </button>
                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?
                    <Link
                      to="/login"
                      className="text-primary hover:underline mx-2"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
        {/* //signup form right side */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center ">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/Video call-bro.png"
                alt="languague connection illustration"
                className="w-full h-full`"
              />
            </div>
            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with friends in Streamify
              </h2>
              <p className="opacity-70 text-sm">
                Practice conversations, learn new languages, and make new
                friends from around the world.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
