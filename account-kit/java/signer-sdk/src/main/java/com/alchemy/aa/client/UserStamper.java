package com.alchemy.aa.client;

import com.alchemy.aa.client.SignerClient.User;
import com.alchemy.aa.core.Stamper;

/**
 * A packet of user and stamper
 * @param user Authed user
 * @param stamper stamper of the user
 */
public record UserStamper(User user, Stamper stamper) {}
