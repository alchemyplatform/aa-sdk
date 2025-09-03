type DemoEvents = [
  {
    name: "logged_in";
  },
  {
    name: "authentication_toggled";
    data: {
      auth_type: string;
      enabled: boolean;
    };
  },
  {
    name: "clicked_custom_oauth_link";
  },
  {
    name: "branding_color_changed";
    data: {
      theme: "light" | "dark";
    };
  },
  {
    name: "branding_logo_changed";
  },
  {
    name: "branding_corner_radius_changed";
    data: {
      corner_radius: "none" | "sm" | "md" | "lg";
    };
  },
  {
    name: "branding_illustration_style_changed";
    data: {
      variant: string;
    };
  },
  {
    name: "branding_support_url_added";
  },
  {
    name: "customize_css_clicked";
  },
  {
    name: "codepreview_viewed";
  },
  {
    name: "codepreview_config_copied";
  },
  {
    name: "codepreview_style_copied";
  },
  {
    name: "codepreview_theme_customization_clicked";
  },
  {
    name: "codepreview_tailwind_setup_clicked";
  },
  {
    name: "quickstart_clicked";
  },
  {
    name: "github_clicked";
  },
  {
    name: "get_api_key_clicked";
  },
];

interface Heap {
  track(eventName: string, properties?: Record<string, unknown>): void;
  userId: string;
}

declare global {
  interface Window {
    heap?: Heap;
  }
}

export const Metrics = {
  trackEvent: (event: DemoEvents[number]) => {
    if (typeof window === "undefined") {
      return;
    }
    window.heap?.track(event.name, "data" in event ? event.data : undefined);
  },
  getUserId: () => {
    if (typeof window === "undefined") {
      return undefined;
    }
    return window.heap?.userId;
  },
};
