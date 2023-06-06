import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { api } from "~/utils/api";

const SignUpPage = () => {
	const { data: sessionData } = useSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [notif, setNotif] = useState("");
	const newUser = api.user.createUser.useMutation();
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		newUser.mutate(
			{ email, password },
			{
				onSuccess() {
					setNotif("Account craeted please click button below to login!");
					setEmail("");
					setPassword("");
				},
				onError() {
					setNotif("Account already exists!");
					setEmail("");
					setPassword("");
				},
			}
		);
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
						<h1>Sign up</h1>
						<button onClick={() => signIn("google")}>
							Sign up with Google
						</button>
						<p>or</p>
						<form onSubmit={handleSubmit}>
							<label htmlFor="email">Email</label>
							<input
								type="text"
								placeholder="JohnDoe1234@somewhere.com"
								onChange={(e) => setEmail(e.target.value)}
								id="email"
								value={email}
							/>
							<label htmlFor="password">Password</label>
							<input
								type="password"
								placeholder="****"
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<button type="submit">Submit</button>
						</form>
						<div>
							<h2>{notif}</h2>
							<Link href="/auth/signin">
								<button>Sign In</button>
							</Link>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default SignUpPage;
