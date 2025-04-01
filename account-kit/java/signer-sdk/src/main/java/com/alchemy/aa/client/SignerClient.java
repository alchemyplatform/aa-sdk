package com.alchemy.aa.client;

import com.alchemy.aa.client.api.AuthJWT;
import com.alchemy.aa.client.api.AuthJWT.Response;
import com.alchemy.aa.client.api.SignMessage;
import com.alchemy.aa.client.api.SignMessage.SignBody;
import com.alchemy.aa.client.api.SignMessage.SignParameters;
import com.alchemy.aa.client.api.StampedRequest;
import com.alchemy.aa.client.api.WhoAmI;
import com.alchemy.aa.client.api.WhoAmI.RawWhoAmIRequest;
import com.alchemy.aa.client.api.WhoAmI.Request;
import com.alchemy.aa.core.CredentialBundle;
import com.alchemy.aa.core.Stamper;
import com.alchemy.aa.core.Stamper.Stamp;
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
  public record User(
    String email,
    String userId,
    String orgId,
    String address,
    String solanaAddress
  ) {}

  @Getter
  private enum PathName {
    LOOKUP("lookup"),
    AUTH("auth"),
    AUTH_JWT("auth-JWT"),
    WHOAMI("whoami"),
    SIGN_PAYLOAD("sign-payload");

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
  public UserStamper authenticateWithBundle(
    TekManager tekManager,
    String orgId,
    String bundle
  ) throws Exception {
    // inject bundle
    CredentialBundle credentialBundle = CredentialBundle.fromEncryptedBundle(
      bundle,
      tekManager
    );

    Stamper stamper = new Stamper(credentialBundle);
    User user = authUser(stamper, orgId);
    return new UserStamper(user, stamper);
  }

  /**
   * Authticate user with JWT and get a stamper
   * @param tekManager client's tek keys
   * @param JWT JWT token
   * @param authProviderName auth provider
   * @return authenticated user
   * @throws Exception if JWT and tekManager mis match
   */
  public UserStamper authenticateWithJWT(
    TekManager tekManager,
    String JWT,
    String authProviderName
  ) throws Exception {
    AuthJWT.Request request = AuthJWT.Request.builder()
      .jwt(JWT)
      .authProvider(authProviderName)
      .targetPublicKey(tekManager.publicKey())
      .build();

    Response response = request(
      PathName.AUTH_JWT.getName(),
      request,
      Response.class
    );

    return authenticateWithBundle(
      tekManager,
      response.orgId(),
      response.credentialBundle()
    );
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
   * @return signature in string.
   *
   * @throws Exception
   */
  public String signRawMessage(
    UserStamper userStamper,
    Bytes msg,
    String hashFunction,
    String address
  ) throws Exception {
    SignParameters signParameters = SignParameters.builder()
      .encoding("PAYLOAD_ENCODING_HEXADECIMAL")
      .hashFunction(hashFunction)
      .payload(Hex.toHexString(msg.toByteArray()))
      .signWith(address)
      .build();

    SignBody body = SignBody.builder()
      .organizationId(userStamper.user().orgId)
      .type("ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2")
      .timestampMs(String.valueOf(Instant.now().toEpochMilli()))
      .parameters(signParameters)
      .build();

    String jsonBody = mapper.writeValueAsString(body);

    Stamp stamp = userStamper.stamper().stamp(jsonBody);
    StampedRequest stampedRequest = StampedRequest.builder()
      .url("https://api.turnkey.com/public/v1/submit/sign_raw_payload")
      .body(jsonBody)
      .stamp(stamp)
      .build();
    SignMessage.Request request = new SignMessage.Request(stampedRequest);
    SignMessage.Response response = request(
      PathName.SIGN_PAYLOAD.getName(),
      request,
      SignMessage.Response.class
    );
    return response.signature();
  }

  /**
   * Sign a Solana transcation.
   * @param stamper stamper to sign
   * @param txBytes transaction bytes
   * @return signature in string
   * @throws Exception
   */
  public String signSolanaTx(UserStamper stamper, Bytes txBytes)
    throws Exception {
    return signRawMessage(
      stamper,
      txBytes,
      "HASH_FUNCTION_NOT_APPLICABLE",
      stamper.user().solanaAddress
    );
  }

  /**
   * Sign an Eth transaction.
   *
   * @param userStamper
   *            stamper to stamp transaction
   * @param txBytes
   *            keccack256 hashed transaction byte
   *
   * @return signature
   *
   * @throws Exception
   */
  public String signEthTx(UserStamper userStamper, Bytes txBytes)
    throws Exception {
    return signRawMessage(
      userStamper,
      txBytes,
      "HASH_FUNCTION_NO_OP",
      userStamper.user().address
    );
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
  private User authUser(Stamper Stamper, String orgId) throws Exception {
    RawWhoAmIRequest rawWhoAmIRequest = new RawWhoAmIRequest(orgId);
    ObjectWriter writer = mapper.writerWithDefaultPrettyPrinter();
    String json_body = writer.writeValueAsString(rawWhoAmIRequest);
    Stamp stampedBody = Stamper.stamp(json_body);
    StampedRequest stampedRequestrequest = StampedRequest.builder()
      .url("https://api.whoami.com/v1/users/")
      .body(json_body)
      .stamp(stampedBody)
      .build();
    Request request = new Request(stampedRequestrequest);
    WhoAmI.Response response = request(
      PathName.WHOAMI.getName(),
      request,
      WhoAmI.Response.class
    );
    return User.builder()
      .address(response.address())
      .orgId(response.orgId())
      .userId(response.userId())
      .email(response.email())
      .solanaAddress(response.solanaAddress())
      .build();
  }

  private <Request, Response> Response request(
    String path,
    Request request,
    Class<Response> clazz
  ) throws Exception {
    URI uri = URI.create(httpConfig.url()).resolve(path);

    HttpRequest http_request = HttpRequest.newBuilder()
      .uri(uri)
      .header("accept", "application/json")
      .header("content-type", "application/json")
      .header("Authorization", "Bearer " + httpConfig.apiKey())
      .method(
        "POST",
        HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(request))
      )
      .build();

    HttpResponse<String> response = HttpClient.newHttpClient()
      .send(http_request, HttpResponse.BodyHandlers.ofString());
    if (response.statusCode() != 200) {
      logger.log(
        Level.WARNING,
        "Unexpected response code from server: {0}",
        response.statusCode()
      );
      logger.log(Level.INFO, "Response body from server: {0}", response.body());
      logger.log(Level.INFO, "Request body from server: {0}", request);
    }
    return mapper.readValue(response.body(), clazz);
  }
}
