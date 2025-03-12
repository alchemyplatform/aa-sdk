import React, { useCallback } from "react";
import { RNAlchemySignerType } from "@account-kit/react-native-signer";
import { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Linking,
	TouchableOpacity,
} from "react-native";
import { useAuthenticate, useLogout, useSigner, useSmartAccountClient, useUser } from "@account-kit/react-native";

export default function MagicLinkAuthScreen() {
	const [email, setEmail] = useState<string>("");
	const user = useUser()
	const { authenticate } = useAuthenticate()
	const { logout } = useLogout()
	const { address } = useSmartAccountClient({})
	const signer = useSigner<RNAlchemySignerType>()
	const [signerAddress, setSignerAddress] = useState<string | null>(null);
	const [authRequestSent, setAuthRequestSent] = useState<boolean>(false);

	const completeUserAuth = ({ bundle }: { bundle: string }) => {
		authenticate({
			bundle,
			type: "email",
		})
	};

	const handleIncomingURL = useCallback((event: { url: string }) => {
		const regex = /[?&]([^=#]+)=([^&#]*)/g;

		setAuthRequestSent(false);

		let params: Record<string, string> = {};
		let match: RegExpExecArray | null;

		while ((match = regex.exec(event.url))) {
			if (match[1] && match[2]) {
				params[match[1]] = match[2];
			}
		}

		if (!params.bundle || !params.orgId) {
			return;
		}

		completeUserAuth({
			bundle: params.bundle,
		});
	}, []);


	// Add listener for incoming links
	useEffect(() => {
		const subscription = Linking.addEventListener("url", handleIncomingURL);

		return () => subscription.remove();
	}, [handleIncomingURL]);

	useEffect(() => {
		if (user) {
			signer?.getAddress().then((address) => {
				setSignerAddress(address);
			});
		}
	}, [user]);

	return (
		<View style={styles.container}>
			{authRequestSent ? (
				<Text>Auth request sent. Please check your email.</Text>
			) : (
				<>
					{!user ? (
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
									setAuthRequestSent(true);
									authenticate({
										email,
										type: "email",
										emailMode: "magicLink",
									})
									
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
							<Text style={styles.userText}>
								OrgId: {user.orgId}
							</Text>
							<Text style={styles.userText}>
								Address: {user.address}
							</Text>
							<Text style={styles.userText}>
								Light Account Address: {address}
							</Text>
							<Text style={styles.userText}>
								Signer Address: {signerAddress}
							</Text>

							<TouchableOpacity
								style={styles.button}
								onPress={() =>	logout()}
							>
								<Text style={styles.buttonText}>Sign out</Text>
							</TouchableOpacity>
						</>
					)}
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
});
