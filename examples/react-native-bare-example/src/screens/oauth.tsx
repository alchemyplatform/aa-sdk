/* eslint-disable import/extensions */
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { useAuthenticate, useUser, useSigner, useLogout, useSmartAccountClient } from "@account-kit/react-native";

export default function OAuthScreen() {
	const user = useUser()
	const { authenticate } = useAuthenticate()
	const { address} = useSmartAccountClient({})
	const { logout } = useLogout();
	const signer = useSigner();
	const [signerAddress, setSignerAddress] = useState<string | null>(null);
	
	useEffect(() => {
		if (user) {
			signer?.getAddress().then((address) => {
				setSignerAddress(address);
			});
		}
	}, [user, signer]);

	return (
		<View style={styles.container}>
			{!user ? (
				<>
					<TouchableOpacity
						style={styles.button}
						onPress={() => {
							try {
								authenticate({
									type: "oauth",
									authProviderId: "google",
									mode: "redirect",
									redirectUrl: "aa-rn-bare-example://oauth",
								})
							} catch (error) {
								console.log(error)
							}
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
});
