package com.alchemy.aa.client.types;

import com.alchemy.aa.records.NewProjectConfig;
import com.alchemy.aa.records.ProjectConfig;
import com.alchemy.aa.records.UpdatedProjectConfig;
import java.util.List;

public class Config {
  public record GetConfigRequest(){}

  public record GetConfigResponse(
      List<ProjectConfig> config
  ){}

  public record PostConfigRequest(NewProjectConfig projectConfig) {}

  public record PostConfigResponse(ProjectConfig projectConfig) {}

  public record PutConfigRequest(UpdatedProjectConfig projectConfig) {}

  public record PutConfigResponse(ProjectConfig projectConfig) {}

}
