export const parseSearchParams = (url: string) => {
  const regex = /[?&]([^=#]+)=([^&#]*)/g;

  let params: Record<string, string> = {};
  let match: RegExpExecArray | null;

  while ((match = regex.exec(url))) {
    if (match[1] !== undefined && match[2] !== undefined) {
      params[match[1]] = match[2];
    }
  }

  return params;
};
