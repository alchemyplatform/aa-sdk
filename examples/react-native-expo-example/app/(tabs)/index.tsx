/* eslint-disable import/extensions */
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import {useSignerStatus, useAuthenticate, useUser, useSigner, useLogout, useSmartAccountClient} from "@account-kit/react-native"
import { AlchemySignerStatus } from "@account-kit/signer";

export default function OTPAuthScreen() {
	const { status } = useSignerStatus();
	const [email, setEmail] = useState<string>("");
	const user = useUser()
	const { authenticate } = useAuthenticate()
	const [signerAddress, setSignerAddress] = useState<string | null>(null);
	const { logout } = useLogout();
	const { address } = useSmartAccountClient({})
	const [awaitingOtp, setAwaitingOtp] = useState<boolean>(false);
	const signer = useSigner();
	const [otpCode, setOtpCode] = useState<string>("");
	const [mfaCode, setMfaCode] = useState<string>("");

	const handleUserAuth = async ({ code }: { code: string }) => {
		setAwaitingOtp(false);
		
		authenticate({
			otpCode: code,
			type: "otp",
		})

		// Clear the OTP code after authentication
		setOtpCode("");
	};

	const handleMfaSubmit = async () => {
		setAwaitingOtp(false);
		
		await signer?.validateMultiFactors({
			multiFactorCode: mfaCode,
		});
	}

	useEffect(() => {
		if (user) {
			signer?.getAddress().then((address: string) => {
				setSignerAddress(address);
			});
		}
	}, [user, signer]);


	return (
		<View style={styles.container}>
			{status === AlchemySignerStatus.AWAITING_MFA_AUTH ? (
				<>
					<Text style={styles.title}>Multi-Factor Authentication</Text>
					<Text style={styles.subtitle}>
						Enter the 6-digit code from your authenticator app
					</Text>
					<TextInput
						style={styles.textInput}
						placeholderTextColor="gray"
						placeholder="Enter authenticator code"
						onChangeText={setMfaCode}
						value={mfaCode}
						keyboardType="number-pad"
						maxLength={6}
					/>
					<TouchableOpacity
						style={styles.button}
						onPress={handleMfaSubmit}
						disabled={mfaCode.length !== 6}
					>
						<Text style={styles.buttonText}>Verify</Text>
					</TouchableOpacity>
				</>
			) : awaitingOtp ? (
				<>
					<TextInput
						style={styles.textInput}
						placeholderTextColor="gray"
						placeholder="enter your OTP code"
						onChangeText={setOtpCode}
						value={otpCode}
					/>
					<TouchableOpacity
						style={styles.button}
						onPress={() => handleUserAuth({ code: otpCode })}
					>
						<Text style={styles.buttonText}>Sign in</Text>
					</TouchableOpacity>
				</>
			) : !user ? (
				<>
					<TextInput
						style={styles.textInput}
						placeholderTextColor="gray"
						placeholder="enter your email"
						onChangeText={setEmail}
						value={email}
					/>
					<TouchableOpacity
						style={styles.button}
						onPress={() => {
							authenticate({
									email,
									type: "email"
								})
					
							setAwaitingOtp(true);
						}}
					>
						<Text style={styles.buttonText}>Sign in</Text>
					</TouchableOpacity>
				</>
			) : (
				<>
					<Text style={styles.userText}>
						Currently logged in as: {user.email}
					</Text>
					<Text style={styles.userText}>OrgId: {user.orgId}</Text>
					<Text style={styles.userText}>Address: {user.address}</Text>
					<Text style={styles.userText}>
						Light Account Address: {address}
					</Text>
					<Text style={styles.userText}>
						Signer Address: {signerAddress}
					</Text>

					<TouchableOpacity
						style={styles.button}
						onPress={() => logout()}
					>
						<Text style={styles.buttonText}>Sign out</Text>
					</TouchableOpacity>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFF",
		paddingHorizontal: 20,
	},
	textInput: {
		width: "100%",
		height: 40,
		borderColor: "gray",
		borderWidth: 1,
		paddingHorizontal: 10,
		backgroundColor: "rgba(0,0,0,0.05)",
		marginTop: 20,
		marginBottom: 10,
	},
	box: {
		width: 60,
		height: 60,
		marginVertical: 20,
	},
	button: {
		width: 200,
		padding: 10,
		height: 50,
		backgroundColor: "rgb(147, 197, 253)",
		borderRadius: 5,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 20,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	userText: {
		marginBottom: 10,
		fontSize: 18,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		marginBottom: 15,
		textAlign: "center",
	},
});
