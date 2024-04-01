const iframeCss = `
iframe {
    box-sizing: border-box;
    width: 100%;
    height: 120px;
    border-radius: 8px;
    border-width: 1px;
    border-style: solid;
    border-color: rgba(216, 219, 227, 1);
    padding: 20px;
}
`;

export const TurnkeyIframe = () => {
  return (
    <div
      className="w-full"
      style={{ display: "none" }}
      id="turnkey-iframe-container-id"
    >
      <style>{iframeCss}</style>
    </div>
  );
};
