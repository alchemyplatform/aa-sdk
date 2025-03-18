package com.alchemy.aa.client;

import com.alchemy.aa.Stamper;
import com.alchemy.aa.Stamper.Stamp;
import com.alchemy.aa.client.api.AuthJWT.Request;
import com.alchemy.aa.client.api.AuthJWT.Response;
import com.alchemy.aa.client.api.AuthUser;
import com.alchemy.aa.client.api.AuthUser.TurnKeyWhoAmIRequest;
import com.alchemy.aa.client.api.AuthUser.WhoAmIRequest;
import com.alchemy.aa.client.api.SignRawMessage.SignParameters;
import com.alchemy.aa.client.api.SignRawMessage.SignRawMessageRequest;
import com.alchemy.aa.client.api.SignRawMessage.SignedResponse;
import com.alchemy.aa.client.api.SignRawMessage.SigningBody;
import com.alchemy.aa.client.api.StampedRequest;
import com.alchemy.aa.core.CredentialBundle;
import com.alchemy.aa.core.TekManager;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.crypto.tink.util.Bytes;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.logging.Level;
import java.util.logging.Logger;
import lombok.Builder;
import lombok.Getter;
import org.bouncycastle.util.encoders.Hex;

public class SignerClient {

    @Builder
    public record User(String email, String userId, String orgId, String address, String solanaAddress) {
    }

    @Getter
    private enum PathName {
        LOOKUP("lookup"), AUTH("auth"), AUTH_JWT("auth-jwt"), WHOAMI("whoami"), SIGN_PAYLOAD("sign-payload");

        private final String name;

        PathName(String name) {
            this.name = name;
        }
    }

    private final HttpConfig httpConfig;
    private final ObjectMapper mapper;
    private final Logger logger;

    public SignerClient(HttpConfig httpConfig) {
        this.httpConfig = httpConfig;
        this.logger = Logger.getLogger(getClass().getName());
        this.mapper = new ObjectMapper();
    }

    /**
     * Inject a bundle to stamper and authenticate with orgId.
     *
     * @param tekManager
     *            client's tek keys.
     * @param orgId
     * @param bundle
     *            bundle from alchemy signer service.
     *
     * @return authenticated user
     *
     * @throws Exception
     */
    public Stamper authenticateWithBundle(TekManager tekManager, String orgId, String bundle) throws Exception {
        // inject bundle
        CredentialBundle credentialBundle = CredentialBundle.fromEncryptedBundle(bundle, tekManager);

        Stamper stamper = new Stamper(credentialBundle);
        User user = authUser(stamper, orgId);
        stamper.setUser(user);
        return stamper;
    }

    public Stamper authenticateWithJWT(TekManager tekManager, String jwt, String authProviderName,
            int expirationInSeconds) throws Exception {
        Request request = Request.builder().jwt(jwt).authProvider(authProviderName)
                .targetPublicKey(tekManager.publicKey()).build();

        Response response = request(PathName.AUTH_JWT.getName(), request, Response.class);

        return authenticateWithBundle(tekManager, response.orgId(), response.credentialBundle());
    }

    /**
     * Sign a raw message
     *
     * @param msg
     *            message to sign
     * @param hashFunction
     *            Name of Hashfunction.
     * @param address
     *            signer's address.
     *
     * @return signed data in bytes.
     *
     * @throws Exception
     */
    public String signRawMessage(Stamper stamper, Bytes msg, String hashFunction, String address)
            throws Exception {

        SignParameters signParameters = SignParameters.builder().encoding("PAYLOAD_ENCODING_HEXADECIMAL")
                .hashFunction(hashFunction).payload(Hex.toHexString(msg.toByteArray())).signWith(address).build();

        SigningBody body = SigningBody.builder().organizationId(stamper.getUser().orgId)
                .type("ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2").timestampMs(String.valueOf(Instant.now().toEpochMilli()))
                .parameters(signParameters).build();

        String jsonBody = mapper.writeValueAsString(body);

        Stamp stamp = stamper.stamp(jsonBody);
        StampedRequest stampedRequest = StampedRequest.builder()
                .url("https://api.turnkey.com/public/v1/submit/sign_raw_payload").body(jsonBody).stamp(stamp).build();
        SignRawMessageRequest request = new SignRawMessageRequest(stampedRequest);
        SignedResponse response = request(PathName.SIGN_PAYLOAD.getName(), request, SignedResponse.class);
        return response.signature();
    }

    /**
     * Sign a Solana transcation.
     *
     * @param txBytes
     *            transaction bytes
     *
     * @return signature
     *
     * @throws Exception
     */
    public String signSolanaTx(Stamper stamper, Bytes txBytes) throws Exception {
        return signRawMessage(stamper, txBytes, "HASH_FUNCTION_NOT_APPLICABLE",
                stamper.getUser().solanaAddress);
    }

    /**
     * Sign an Eth transaction.
     *
     * @param stamper
     *            stamper to stamp transaction
     * @param txBytes
     *            keccack256 hashed transaction byte
     *
     * @return signature
     *
     * @throws Exception
     */
    public String signEthTx(Stamper stamper, Bytes txBytes) throws Exception {
        return signRawMessage(stamper, txBytes, "HASH_FUNCTION_NO_OP", stamper.getUser().address);
    }

    /**
     * Auth user with Stamp.
     *
     * @param orgId
     *
     * @return
     *
     * @throws Exception
     */
    private User authUser(Stamper stamper, String orgId) throws Exception {

        WhoAmIRequest whoAmIRequest = new WhoAmIRequest(orgId);
        ObjectWriter writer = mapper.writerWithDefaultPrettyPrinter();
        String json_body = writer.writeValueAsString(whoAmIRequest);
        Stamp stampedBody = stamper.stamp(json_body);
        StampedRequest stampedRequestrequest = StampedRequest.builder().url("https://api.whoami.com/v1/users/")
                .body(json_body).stamp(stampedBody).build();
        TurnKeyWhoAmIRequest request = new TurnKeyWhoAmIRequest(stampedRequestrequest);
        AuthUser.Response response = request(PathName.WHOAMI.getName(), request, AuthUser.Response.class);
        return User.builder().address(response.address()).orgId(response.orgId()).userId(response.userId())
                .email(response.email()).solanaAddress(response.solanaAddress()).build();

    }

    private <Request, Response> Response request(String path, Request request, Class<Response> clazz) throws Exception {
        URI uri = URI.create(httpConfig.url()).resolve(path);

        HttpRequest http_request = HttpRequest.newBuilder().uri(uri).header("accept", "application/json")
                .header("content-type", "application/json").header("Authorization", "Bearer " + httpConfig.apiKey())
                .method("POST", HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(request))).build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(http_request,
                HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            logger.log(Level.WARNING, "Unexpected response code from server: {0}", response.statusCode());
            logger.log(Level.INFO, "Response body from server: {0}", response.body());
            logger.log(Level.INFO, "Request body from server: {0}", request);
        }
        return mapper.readValue(response.body(), clazz);
    }
}
