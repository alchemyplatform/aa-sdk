package com.alchemy.aa.client;

import com.alchemy.aa.Stamper;
import com.alchemy.aa.Stamper.Stamp;
import com.alchemy.aa.client.api.AuthUser;
import com.alchemy.aa.client.api.AuthUser.WhoAmIRequest;
import com.alchemy.aa.client.api.GetUser;
import com.alchemy.aa.client.api.SignRawMessage.SignParamter;
import com.alchemy.aa.client.api.SignRawMessage.SignedRequest;
import com.alchemy.aa.client.api.SignRawMessage.SignedResponse;
import com.alchemy.aa.client.api.SignRawMessage.SigningBody;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.crypto.tink.util.Bytes;
import com.google.protobuf.InvalidProtocolBufferException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.GeneralSecurityException;
import java.time.Instant;
import java.util.Optional;
import lombok.Builder;
import lombok.Getter;
import org.bouncycastle.util.encoders.Hex;

public class SginerClient {

  public class HttpConfig {

    public HttpConfig(String api_key){
      this.api_key = api_key;
    };

    @Getter
    private String api_key;
    @Getter
    private static String ALCHEMY_URL = "https://api.alchemy.com/v1/";
  }

  @Builder
  public record User(
      String email,
      String userId,
      String orgId,
      String address,
      String solanaAddress
  ){}

  @Getter
  public enum ServiceHandlerName {
    LOOKUP("lookup"),
    AUTH("auth"),
    AUTH_GET_MULTI_FACTOR("auth-get-multi-factor"),
    AUTH_LIST_MULTI_FACTORS("auth-list-multi-factors"),
    AUTH_DELETE_MULTI_FACTORS("auth-delete-multi-factors"),
    AUTH_REQUEST_MULTI_FACTOR("auth-request-multi-factor"),
    AUTH_VERIFY_MULTI_FACTOR("auth-verify-multi-factor"),
    SIGNUP("signup"),
    WHOAMI("whoami"),
    SIGN_PAYLOAD("sign-payload"),
    PREPARE_OAUTH("prepare-oauth"),
    OTP("otp");

    private final String name;

    ServiceHandlerName(String name) {
      this.name = name;
    }
  }

  public enum SigningMode{
    ETHEREUM,
    SOLANA
  }

  private String apiKey;

  class AlchemyHttpClient{

    public AlchemyHttpClient(Stamper stamper, HttpConfig httpConfig){
      this.httpConfig = httpConfig;
      this.stamper = stamper;
      this.mapper = new ObjectMapper();
    }

    public User authenticateWithBundle(String orgId, String bundle ){
      // TODO: impl this
      return User.builder().build();
    }
    public User authenticateWithJWT(String jwt, int expirationInSeconds){
      // TODO: impl this
      return User.builder().build();
    }

    /**
     * Sign a raw message
     * @param msg message to sign
     * @param mode Signing mode, SOLANA or ETHEREUM[
     * @param hashFunction Name of Hashfunction.
     * @param address signer's address.
     * @return signed data in bytes.
     * @throws Exception
     */
    public Bytes signRawMessage(
        Bytes msg,
        SigningMode mode,
        String hashFunction,
        String address
    ) throws Exception {
      ObjectWriter writer = this.mapper.writerWithDefaultPrettyPrinter();

      SignParamter signParamter = SignParamter.builder()
          .encoding("PAYLOAD_ENCODING_HEXADECIMAL")
          .hashfunction(hashFunction)
          .payload(msg.toString())
          .signWith(address)
          .build();

      SigningBody body = SigningBody.builder()
          .organizationId(this.user.get().orgId)
          .type("ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2")
          .timestampMs(String.valueOf(Instant.now().toEpochMilli()))
          .parameters(signParamter)
          .build();

      String json_body = writer.writeValueAsString(body);

      Stamp stamp = this.stamper.stamp(json_body);
      SignedRequest request = SignedRequest.builder()
          .url("https://api.turnkey.com/public/v1/submit/sign_raw_payload")
          .body(json_body)
          .stamp(stamp)
          .build();

      SignedResponse response = this.request(request, "POST", SignedResponse.class);
      return Bytes.copyFrom(Hex.decode(response.signature()));
    }

    /**
     * Sign a Solana transcation.
     * @param txBytes transaction bytes
     * @return
     * @throws Exception
     */
    public Bytes signSolanaTx(
        Bytes txBytes
    ) throws Exception {
      if (this.user.isEmpty()){
        throw new IllegalStateException("user is empty");
      }
      return this.signRawMessage(txBytes, SigningMode.SOLANA, "HASH_FUNCTION_NOT_APPLICABLE", this.user.get().solanaAddress);
    }

    /**
     * Sign an Eth transcation.
     * @param txBytes keccack256 hashed transaction bytes
     * @return
     * @throws Exception
     */
    public Bytes signEthTx(
        Bytes txBytes
    ) throws Exception {
      if (this.user.isEmpty()){
        throw new IllegalStateException("user is empty");
      }
      return this.signRawMessage(txBytes, SigningMode.ETHEREUM, "HASH_FUNCTION_NO_OP", this.user.get().address);
    }

    public String targetPublicKeyHex()
        throws GeneralSecurityException, InvalidProtocolBufferException {
      return this.stamper.publicKey();
    }

    public String targetPublicKeyJwtNonce()
        throws GeneralSecurityException, InvalidProtocolBufferException {
      return this.stamper.publicKey();
    }

    private String GetUserOrgId(String email) throws Exception {
      GetUser.Request getUserRequest = new GetUser.Request(email);
      GetUser.Response getUserResponse = this.request(getUserRequest, "POST", GetUser.Response.class);
      return getUserResponse.orgId();
    }

    /**
     * Auth user with Stamp.
     * @param orgId
     * @return
     * @throws Exception
     */
    private User AuthUser(String orgId) throws Exception {
      if(!this.user.isEmpty()){
        return this.user.get();
      }

      WhoAmIRequest whoAmIRequest = new WhoAmIRequest(orgId);
      ObjectWriter writer = this.mapper.writerWithDefaultPrettyPrinter();
      String json_body = writer.writeValueAsString(whoAmIRequest);
      Stamp stamped_body = this.stamper.stamp(json_body);
      AuthUser.Request request = AuthUser.Request.builder()
          .url("https://api.whoami.com/v1/users/")
          .body(json_body)
          .stamp(stamped_body)
          .build();
      AuthUser.Response response = this.request(request, "POST", AuthUser.Response.class);
      this.user = Optional.ofNullable(User.builder()
          .address(response.address())
          .orgId(response.orgId())
          .userId(response.userId())
          .email(response.email())
          .solanaAddress(response.solanaAddress())
          .build());
      return this.user.get();
    }


    private<Request, Response> Response request(Request request, String verb, Class<Response> clazz) throws Exception{

      HttpRequest http_request = HttpRequest.newBuilder()
          .uri(URI.create(this.httpConfig.getALCHEMY_URL()))
          .header("accept", "application/json")
          .header("content-type", "application/json")
          .header("Authorization", "Bearer " + this.httpConfig.api_key)
          .method(verb, HttpRequest.BodyPublishers.ofString(this.mapper.writeValueAsString(request))).build();
      JacksonBodyHandlers jsonBodyHandler = new JacksonBodyHandlers(this.mapper);

      HttpResponse<Response> response = HttpClient.newHttpClient().send(http_request,jsonBodyHandler.handlerFor( clazz));
      return response.body();
    }


    private HttpConfig httpConfig;
    private Stamper stamper;
    private Optional<User> user;
    private ObjectMapper mapper;

  }
}
