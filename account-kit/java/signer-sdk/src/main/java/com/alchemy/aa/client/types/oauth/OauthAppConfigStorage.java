package com.alchemy.aa.client.types.oauth;

import static alchemy.signer.db.signer.Tables.OAUTH_PROJECT_ALLOWED_ORIGINS;
import static alchemy.signer.db.signer.Tables.OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS;
import static alchemy.signer.db.signer.Tables.OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS;
import static alchemy.signer.db.signer.Tables.OAUTH_PROJECT_DEFAULT_PROVIDERS;

import alchemy.signerservice.oauth.types.AppleConfig;
import alchemy.signerservice.oauth.types.AuthProviderConfig;
import alchemy.signerservice.oauth.types.OauthAppConfig;
import jakarta.inject.Singleton;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.jooq.Configuration;
import org.jooq.DSLContext;
import org.jooq.types.ULong;

@Singleton
@RequiredArgsConstructor
public class OauthAppConfigStorage {

  private final DSLContext context;

  public OauthAppConfig loadConfig(long projectConfigId) {
    List<String> defaultProviders = fetchDefaultProviders(projectConfigId);
    List<AuthProviderConfig> customProviders = fetchCustomProviders(
      projectConfigId
    );
    List<String> allowedOrigins = fetchAllowedOrigins(projectConfigId);
    Optional<AppleConfig> customAppleConfig = fetchCustomAppleConfig(
      projectConfigId
    );

    return new OauthAppConfig(
      defaultProviders,
      customProviders,
      customAppleConfig,
      allowedOrigins
    );
  }

  private List<String> fetchDefaultProviders(long projectConfigId) {
    return context
      .select(OAUTH_PROJECT_DEFAULT_PROVIDERS.AUTH_PROVIDER)
      .from(OAUTH_PROJECT_DEFAULT_PROVIDERS)
      .where(
        OAUTH_PROJECT_DEFAULT_PROVIDERS.PROJECT_CONFIG_ID.eq(
          ULong.valueOf(projectConfigId)
        )
      )
      .fetch()
      .stream()
      .map(record -> record.get(OAUTH_PROJECT_DEFAULT_PROVIDERS.AUTH_PROVIDER))
      .toList();
  }

  private List<AuthProviderConfig> fetchCustomProviders(long projectConfigId) {
    return context
      .select(
        OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.AUTH_PROVIDER,
        OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.ISSUER,
        OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.AUTH_ENDPOINT,
        OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.TOKEN_ENDPOINT,
        OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.JWKS_URI,
        OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.CLIENT_ID,
        OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.CLIENT_SECRET
      )
      .from(OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS)
      .where(
        OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.PROJECT_CONFIG_ID.eq(
          ULong.valueOf(projectConfigId)
        )
      )
      .fetch()
      .stream()
      .map(record ->
        new AuthProviderConfig(
          record.get(OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.AUTH_PROVIDER),
          record.get(OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.ISSUER),
          record.get(OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.AUTH_ENDPOINT),
          record.get(OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.TOKEN_ENDPOINT),
          record.get(OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.JWKS_URI),
          record.get(OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.CLIENT_ID),
          record.get(OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.CLIENT_SECRET)
        )
      )
      .toList();
  }

  private List<String> fetchAllowedOrigins(long projectConfigId) {
    return context
      .select(OAUTH_PROJECT_ALLOWED_ORIGINS.ORIGIN)
      .from(OAUTH_PROJECT_ALLOWED_ORIGINS)
      .where(
        OAUTH_PROJECT_ALLOWED_ORIGINS.PROJECT_CONFIG_ID.eq(
          ULong.valueOf(projectConfigId)
        )
      )
      .fetch()
      .stream()
      .map(record -> record.get(OAUTH_PROJECT_ALLOWED_ORIGINS.ORIGIN))
      .toList();
  }

  private Optional<AppleConfig> fetchCustomAppleConfig(long projectConfigId) {
    var record = context
      .select(
        OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.CLIENT_ID,
        OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.TEAM_ID,
        OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.KEY_ID,
        OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.PRIVATE_KEY
      )
      .from(OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS)
      .where(
        OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.PROJECT_CONFIG_ID.eq(
          ULong.valueOf(projectConfigId)
        )
      )
      .fetchOne();

    if (record != null) {
      String clientId = record.get(
        OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.CLIENT_ID
      );
      String teamId = record.get(OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.TEAM_ID);
      String keyId = record.get(OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.KEY_ID);
      String privateKey = record.get(
        OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.PRIVATE_KEY
      );

      return Optional.of(new AppleConfig(clientId, teamId, keyId, privateKey));
    }
    return Optional.empty();
  }

  public void updateConfig(
    Configuration tx,
    long projectConfigId,
    OauthAppConfig config
  ) {
    deleteConfig(tx, projectConfigId);
    storeConfig(tx, projectConfigId, config);
  }

  public void storeConfig(
    Configuration tx,
    long projectConfigId,
    OauthAppConfig config
  ) {
    // Shadow the instance variable `context` to prevent accidentally using it.
    var context = tx.dsl();
    var insertDefaultProviderQueries = config
      .defaultProviderIds()
      .stream()
      .map(providerId ->
        context
          .insertInto(
            OAUTH_PROJECT_DEFAULT_PROVIDERS,
            OAUTH_PROJECT_DEFAULT_PROVIDERS.PROJECT_CONFIG_ID,
            OAUTH_PROJECT_DEFAULT_PROVIDERS.AUTH_PROVIDER
          )
          .values(ULong.valueOf(projectConfigId), providerId)
      )
      .toList();

    var insertCustomProviderQueries = config
      .customProviderConfigs()
      .stream()
      .map(providerConfig ->
        context
          .insertInto(
            OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS,
            OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.PROJECT_CONFIG_ID,
            OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.AUTH_PROVIDER,
            OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.ISSUER,
            OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.AUTH_ENDPOINT,
            OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.TOKEN_ENDPOINT,
            OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.JWKS_URI,
            OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.CLIENT_ID,
            OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.CLIENT_SECRET
          )
          .values(
            ULong.valueOf(projectConfigId),
            providerConfig.id(),
            providerConfig.issuer(),
            providerConfig.authEndpoint(),
            providerConfig.tokenEndpoint(),
            providerConfig.jwksUri(),
            providerConfig.clientId(),
            providerConfig.clientSecret()
          )
      )
      .toList();

    var insertCustomAppleConfigQuery = config
      .appleConfig()
      .map(appleConfig ->
        context
          .insertInto(
            OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS,
            OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.PROJECT_CONFIG_ID,
            OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.CLIENT_ID,
            OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.TEAM_ID,
            OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.KEY_ID,
            OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.PRIVATE_KEY
          )
          .values(
            ULong.valueOf(projectConfigId),
            appleConfig.clientId(),
            appleConfig.teamId(),
            appleConfig.keyId(),
            appleConfig.privateKey()
          )
      )
      .stream()
      .toList();

    var insertAllowedOriginQueries = config
      .allowedOrigins()
      .stream()
      .map(origin ->
        context
          .insertInto(
            OAUTH_PROJECT_ALLOWED_ORIGINS,
            OAUTH_PROJECT_ALLOWED_ORIGINS.PROJECT_CONFIG_ID,
            OAUTH_PROJECT_ALLOWED_ORIGINS.ORIGIN
          )
          .values(ULong.valueOf(projectConfigId), origin)
      )
      .toList();

    var queries = Stream
      .of(
        insertDefaultProviderQueries,
        insertCustomProviderQueries,
        insertCustomAppleConfigQuery,
        insertAllowedOriginQueries
      )
      .flatMap(List::stream)
      .toList();

    context.batch(queries).execute();
  }

  public void deleteConfig(Configuration tx, long projectConfigId) {
    // Shadow the instance variable `context` to prevent accidentally using it.
    var context = tx.dsl();
    context
      .deleteFrom(OAUTH_PROJECT_DEFAULT_PROVIDERS)
      .where(
        OAUTH_PROJECT_DEFAULT_PROVIDERS.PROJECT_CONFIG_ID.eq(
          ULong.valueOf(projectConfigId)
        )
      )
      .execute();

    context
      .deleteFrom(OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS)
      .where(
        OAUTH_PROJECT_CUSTOM_PROVIDER_CONFIGS.PROJECT_CONFIG_ID.eq(
          ULong.valueOf(projectConfigId)
        )
      )
      .execute();

    context
      .deleteFrom(OAUTH_PROJECT_ALLOWED_ORIGINS)
      .where(
        OAUTH_PROJECT_ALLOWED_ORIGINS.PROJECT_CONFIG_ID.eq(
          ULong.valueOf(projectConfigId)
        )
      )
      .execute();

    context
      .deleteFrom(OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS)
      .where(
        OAUTH_PROJECT_CUSTOM_APPLE_CONFIGS.PROJECT_CONFIG_ID.eq(
          ULong.valueOf(projectConfigId)
        )
      )
      .execute();
  }
}
