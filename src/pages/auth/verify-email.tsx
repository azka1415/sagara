import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { api } from "~/utils/api";

const VerifyEmailPage = () => {
	const { data: sessionData } = useSession();
	const user = api.user.getUser.useQuery();
	const getCode = api.user.getCode.useMutation();
	const verifyEmail = api.user.verifyEmail.useMutation();
	const [notif, setNotif] = useState("");
	const [authCode, setAuthCode] = useState("");
	const [openForm, setOpenForm] = useState(false);
	const handleClick = () => {
		getCode.mutate(
			{ email: sessionData?.user.email },
			{
				onSuccess() {
					setNotif("Auth code sent");
					setOpenForm(true);
				},
			}
		);
	};
	const handleAuthCode = () => {
		verifyEmail.mutate(
			{ authCode },
			{
				onSuccess() {
					setNotif("Email Verified");
					setOpenForm(false);
				},
			}
		);
	};
	return (
		<div className="container">
			<div className="login-card">
				{!sessionData?.user ? (
					<h2>Please Signin first</h2>
				) : user.data?.emailVerified ? (
					<h2>Already Verified</h2>
				) : (
					<>
						<h2>Verify Email</h2>
						<p>click below to send a code to the email address</p>
						<button onClick={handleClick}>click me</button>
						{notif !== "" && (
							<>
								<h2>{notif}</h2>
								<button onClick={() => setNotif("")}>clear</button>
							</>
						)}
						{openForm && (
							<>
								<h3>Enter Auth Code below</h3>
								<input
									type="text"
									onChange={(e) => setAuthCode(e.target.value)}
								/>
								<button onClick={handleAuthCode}>Submit</button>
							</>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default VerifyEmailPage;
