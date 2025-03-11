package com.alchemy.aa.client.types.oauth;

import static alchemy.signer.db.signer.Tables.OAUTH_SUB_ORG_IDS;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.inject.Singleton;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.types.ULong;

@RequiredArgsConstructor
@Singleton
public class OauthSuborgStorage {

  private final DSLContext context;

  public Optional<String> loadSubOrgId(
    long projectConfigId,
    DecodedJWT idToken
  ) {
    return context
      .select(OAUTH_SUB_ORG_IDS.SUB_ORG_ID)
      .from(OAUTH_SUB_ORG_IDS)
      .where(
        OAUTH_SUB_ORG_IDS.PROJECT_CONFIG_ID
          .eq(ULong.valueOf(projectConfigId))
          .and(OAUTH_SUB_ORG_IDS.AUD.eq(idToken.getAudience().get(0)))
          .and(OAUTH_SUB_ORG_IDS.ISS.eq(idToken.getIssuer()))
          .and(OAUTH_SUB_ORG_IDS.SUB.eq(idToken.getSubject()))
      )
      .fetchOptional()
      .map(record -> record.get(OAUTH_SUB_ORG_IDS.SUB_ORG_ID));
  }

  public void storeSubOrgId(
    long projectConfigId,
    DecodedJWT idToken,
    String subOrgId
  ) {
    var insertSubOrgQuery = context
      .insertInto(
        OAUTH_SUB_ORG_IDS,
        OAUTH_SUB_ORG_IDS.PROJECT_CONFIG_ID,
        OAUTH_SUB_ORG_IDS.AUD,
        OAUTH_SUB_ORG_IDS.ISS,
        OAUTH_SUB_ORG_IDS.SUB,
        OAUTH_SUB_ORG_IDS.SUB_ORG_ID
      )
      .values(
        ULong.valueOf(projectConfigId),
        idToken.getAudience().get(0),
        idToken.getIssuer(),
        idToken.getSubject(),
        subOrgId
      );

    context.batch(insertSubOrgQuery).execute();
  }
}
