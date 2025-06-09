export interface DocsYaml {
  instances: Instance[];
  experimental: Experimental;
  navigation: Navigation[];
}

export interface Experimental {
  "mdx-components": string[];
}

export interface Instance {
  url: string;
}

export interface Navigation {
  tab: string;
  layout: Layout[];
}

export interface Layout {
  section: string;
  "skip-slug"?: boolean;
  contents: LayoutContent[];
  slug?: string;
}

export interface LayoutContent {
  page?: string;
  slug?: string;
  path?: string;
  link?: string;
  href?: string;
  section?: string;
  contents?: Content[];
  "skip-slug"?: boolean;
}

export interface Content {
  page?: string;
  path?: string;
  section?: string;
  contents?: Content[];
  slug?: string;
}
