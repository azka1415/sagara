import React, { useState } from "react";
import { api } from "~/utils/api";

const ForgotPasswordPage = () => {
	const generatePass = api.user.generatePassword.useMutation();
	const [email, setEmail] = useState("");
	const [notif, setNotif] = useState("");
	const handleClick = () => {
		generatePass.mutate(
			{ email },
			{
				onError() {
					setNotif("User does not exist");
				},
				onSuccess() {
					setNotif("Password has been sucessfully reset!");
					setEmail("");
				},
			}
		);
	};
	return (
		<div className="container">
			<h1>Forgot Password</h1>
			<p>
				enter yout email and click button below to send link to generate a new
				password
			</p>
			<p>it will be sent to your email</p>
			<input
				type="text"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>

			{notif !== "" && (
				<div>
					<h2>{notif}</h2>
					<button onClick={() => setNotif("")}>close</button>
				</div>
			)}
			<button
				disabled={email === "" || notif !== ""}
				onClick={handleClick}
			>
				Click here
			</button>
		</div>
	);
};

export default ForgotPasswordPage;
