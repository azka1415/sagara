import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { api } from "~/utils/api";
const UserPage = () => {
	const { data: sessionData } = useSession();
	const [openName, setOpenName] = useState(false);
	const [openPassword, setOpenPassword] = useState(false);
	const [newName, setNewName] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [notif, setNotif] = useState("");
	const user = api.user.getUser.useQuery(undefined, {});
	const setPassword = api.user.setPassword.useMutation();
	const handleNameSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
	};

	const handlePasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setPassword.mutate(
			{ password: newPassword },
			{
				onSuccess() {
					setOpenPassword(false);
					setNotif("Password sucessfully set!");
				},
			}
		);
	};

	return (
		<div className="container">
			<div className="login-card">
				{sessionData ? (
					<>
						<h1>
							hello!{" "}
							{sessionData.user?.name
								? sessionData.user.name
								: sessionData.user.email}
						</h1>
						<button onClick={() => setOpenName(!openName)}>Edit Name</button>
						{!user.data?.password && (
							<button onClick={() => setOpenPassword(!openPassword)}>
								Set Password
							</button>
						)}
						{!user.data?.emailVerified && (
							<Link href={"/auth/verify-email"}>
								<button>Verify Email</button>
							</Link>
						)}
						{openName && (
							<form
								onSubmit={handleNameSubmit}
								className="name-form"
							>
								<label htmlFor="name">Name</label>
								<input
									type="text"
									placeholder="John Doe"
									onChange={(e) => setNewName(e.target.value)}
									id="name"
								/>
								<button type="submit">Submit</button>
							</form>
						)}
						{!user.data?.password && openPassword && (
							<form onSubmit={handlePasswordSubmit}>
								<label htmlFor="password">Password</label>
								<input
									type="password"
									placeholder="*****"
									onChange={(e) => setNewPassword(e.target.value)}
									id="password"
								/>
								<button type="submit">Submit</button>
							</form>
						)}

						{notif !== "" && (
							<>
								<div>
									<h2>{notif}</h2>
									<button onClick={() => setNotif("")}>Close</button>
								</div>
							</>
						)}
						<button onClick={() => signOut()}>Sign Out</button>
					</>
				) : (
					<div>
						<h1>Please Login First</h1>
						<button onClick={() => signIn()}>Sign In</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default UserPage;
