package com.alchemy.aa.client;

import com.alchemy.aa.Stamper;
import com.alchemy.aa.Stamper.Stamp;
import com.alchemy.aa.client.api.AuthJWT.Request;
import com.alchemy.aa.client.api.AuthJWT.Response;
import com.alchemy.aa.client.api.AuthUser;
import com.alchemy.aa.client.api.AuthUser.WhoAmIRequest;
import com.alchemy.aa.client.api.GetUser;
import com.alchemy.aa.client.api.SignRawMessage.SignParamter;
import com.alchemy.aa.client.api.SignRawMessage.SignedResponse;
import com.alchemy.aa.client.api.SignRawMessage.SigningBody;
import com.alchemy.aa.client.api.StampedRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.crypto.tink.util.Bytes;
import com.google.protobuf.InvalidProtocolBufferException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;
import org.bouncycastle.util.encoders.Hex;

public class SignerClient {

    @Builder
    public record User(String email, String userId, String orgId, String address, String solanaAddress) {
    }

    @Getter
    public enum PathName {
        LOOKUP("lookup"), AUTH("auth"), AUTH_JWT("auth_jwt"), WHOAMI("whoami"), SIGN_PAYLOAD("sign-payload");

        private final String name;

        PathName(String name) {
            this.name = name;
        }
    }

    public enum SigningMode {
        ETHEREUM, SOLANA
    }

    public SignerClient(HttpConfig httpConfig) {
        this.httpConfig = httpConfig;
        this.mapper = new ObjectMapper();
    }

    /**
     * Inject a bunlde to stamper and authenticate the with orgId.
     *
     * @param stamper
     *            stamper to stamp during the session.
     * @param orgId
     * @param bundle
     *            bundle from alchemy signer service.
     *
     * @return
     *
     * @throws Exception
     */
    public User authenticateWithBundle(Stamper stamper, String orgId, String bundle) throws Exception {
        // inject bundle
        stamper.injectCredentialBundle(bundle);

        return this.authUser(stamper, orgId);
    }

    public User authenticateWithJWT(Stamper stamper, String jwt, String authProviderName, int expirationInSeconds)
            throws Exception {
        Request request = Request.builder().jwt(jwt).authProviderName(authProviderName)
                .targetPublicKey(stamper.publicKey()).build();

        Response response = this.request(PathName.AUTH_JWT.getName(), request, Response.class);

        return authenticateWithBundle(stamper, response.orgId(), response.credentialBundle());
    }

    /**
     * Sign a raw message
     *
     * @param msg
     *            message to sign
     * @param mode
     *            Signing mode, SOLANA or ETHEREUM
     * @param hashFunction
     *            Name of Hashfunction.
     * @param address
     *            signer's address.
     *
     * @return signed data in bytes.
     *
     * @throws Exception
     */
    public Bytes signRawMessage(Stamper stamper, User user, Bytes msg, SigningMode mode, String hashFunction,
            String address) throws Exception {
        ObjectWriter writer = this.mapper.writerWithDefaultPrettyPrinter();

        SignParamter signParamter = SignParamter.builder().encoding("PAYLOAD_ENCODING_HEXADECIMAL")
                .hashfunction(hashFunction).payload(msg.toString()).signWith(address).build();

        SigningBody body = SigningBody.builder().organizationId(user.orgId).type("ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2")
                .timestampMs(String.valueOf(Instant.now().toEpochMilli())).parameters(signParamter).build();

        String json_body = writer.writeValueAsString(body);

        Stamp stamp = stamper.stamp(json_body);
        StampedRequest request = StampedRequest.builder()
                .url("https://api.turnkey.com/public/v1/submit/sign_raw_payload").body(json_body).stamp(stamp).build();

        SignedResponse response = this.request(PathName.SIGN_PAYLOAD.getName(), request, SignedResponse.class);
        return Bytes.copyFrom(Hex.decode(response.signature()));
    }

    /**
     * Sign a Solana transcation.
     *
     * @param txBytes
     *            transaction bytes
     *
     * @return
     *
     * @throws Exception
     */
    public Bytes signSolanaTx(Stamper stamper, User user, Bytes txBytes) throws Exception {
        return this.signRawMessage(stamper, user, txBytes, SigningMode.SOLANA, "HASH_FUNCTION_NOT_APPLICABLE",
                user.solanaAddress);
    }

    /**
     * Sign an Eth transaction.
     *
     * @param stamper
     *            stamper to stamp transaction
     * @param user
     *            user info to sign.
     * @param txBytes
     *            keccack256 hashed transaction byte
     *
     * @return
     *
     * @throws Exception
     */
    public Bytes signEthTx(Stamper stamper, User user, Bytes txBytes) throws Exception {
        return this.signRawMessage(stamper, user, txBytes, SigningMode.ETHEREUM, "HASH_FUNCTION_NO_OP", user.address);
    }

    public String targetPublicKeyHex(Stamper stamper) throws GeneralSecurityException, InvalidProtocolBufferException {
        return stamper.publicKey();
    }

    public String targetPublicKeyJwtNonce(Stamper stamper)
            throws GeneralSecurityException, InvalidProtocolBufferException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(stamper.publicKey().getBytes(StandardCharsets.UTF_8));
        String sha256hex = new String(Hex.encode(hash));

        return stamper.publicKey();
    }

    private String getUserOrgId(String email) throws Exception {
        GetUser.Request getUserRequest = new GetUser.Request(email);
        GetUser.Response getUserResponse = this.request(PathName.LOOKUP.getName(), getUserRequest,
                GetUser.Response.class);
        return getUserResponse.orgId();
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
        ObjectWriter writer = this.mapper.writerWithDefaultPrettyPrinter();
        String json_body = writer.writeValueAsString(whoAmIRequest);
        Stamp stamped_body = stamper.stamp(json_body);
        StampedRequest request = StampedRequest.builder().url("https://api.whoami.com/v1/users/").body(json_body)
                .stamp(stamped_body).build();
        AuthUser.Response response = this.request(PathName.WHOAMI.getName(), request, AuthUser.Response.class);
        return User.builder().address(response.address()).orgId(response.orgId()).userId(response.userId())
                .email(response.email()).solanaAddress(response.solanaAddress()).build();

    }

    private <Request, Response> Response request(String path, Request request, Class<Response> clazz) throws Exception {

        URI uri = URI.create(this.httpConfig.getUrl());
        uri.resolve(path);
        HttpRequest http_request = HttpRequest.newBuilder().uri(uri).header("accept", "application/json")
                .header("content-type", "application/json")
                .header("Authorization", "Bearer " + this.httpConfig.getApiKey())
                .method("POST", HttpRequest.BodyPublishers.ofString(this.mapper.writeValueAsString(request))).build();
        JacksonBodyHandlers jsonBodyHandler = new JacksonBodyHandlers(this.mapper);

        HttpResponse<Response> response = HttpClient.newHttpClient().send(http_request,
                jsonBodyHandler.handlerFor(clazz));
        return response.body();
    }

    private HttpConfig httpConfig;
    private ObjectMapper mapper;
}
