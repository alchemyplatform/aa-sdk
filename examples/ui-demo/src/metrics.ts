import { createLogger } from "@account-kit/logging";

type DemoEvents = [
  {
    EventName: "logged_in";
  },
  {
    EventName: "authentication_toggled";
    EventData: {
      auth_type: string;
      enabled: boolean;
    };
  },
  {
    EventName: "clicked_custom_oauth_link";
  },
  {
    EventName: "branding_color_changed";
    EventData: {
      theme: "light" | "dark";
    };
  },
  {
    EventName: "branding_logo_changed";
  },
  {
    EventName: "branding_corner_radius_changed";
    EventData: {
      corner_radius: "none" | "sm" | "md" | "lg";
    };
  },
  {
    EventName: "branding_illustration_style_changed";
    EventData: {
      variant: string;
    };
  },
  {
    EventName: "branding_support_url_added";
  },
  {
    EventName: "customize_css_clicked";
  },
  {
    EventName: "codepreview_viewed";
  },
  {
    EventName: "codepreview_config_copied";
  },
  {
    EventName: "codepreview_style_copied";
  },
  {
    EventName: "codepreview_theme_customization_clicked";
  },
  {
    EventName: "codepreview_tailwind_setup_clicked";
  },
  {
    EventName: "quickstart_clicked";
  },
  {
    EventName: "github_clicked";
  },
  {
    EventName: "get_api_key_clicked";
  }
];

export const Metrics = createLogger<DemoEvents>({
  package: "account-kit-demo",
  version: "0.0.0",
});
