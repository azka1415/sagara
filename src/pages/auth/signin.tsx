import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { FormEvent, useState } from "react";

const SignInPage = () => {
	const { data: sessionData } = useSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		signIn("credentials", { email, password, callbackUrl: "/user" });
	};

	return (
		<div className="container">
			<div className="login-card">
				{sessionData ? (
					<>
						<h1>You're Signed in!</h1>
						<button onClick={() => signOut()}>Sign Out</button>
						<Link href={"/user"}>
							<button>user Page</button>
						</Link>
					</>
				) : (
					<>
						<h1>Sign in</h1>
						<button onClick={() => signIn("google")}>
							Sign in with Google
						</button>
						<p>or</p>
						<form onSubmit={handleSubmit}>
							<label htmlFor="email">Email</label>
							<input
								type="text"
								placeholder="JohnDoe1234@somewhere.com"
								onChange={(e) => setEmail(e.target.value)}
								id="email"
							/>
							<label htmlFor="password">Password</label>
							<input
								type="password"
								placeholder="****"
								id="password"
								onChange={(e) => setPassword(e.target.value)}
							/>
							<div className="link-box">
								<Link href="/auth/forgot-password">
									<p className="link">Forgot Password</p>
								</Link>
							</div>
							<button type="submit">Submit</button>
						</form>
						<div className="link-box">
							<Link href="/auth/signup">
								<p className="link">New User?</p>
							</Link>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default SignInPage;
