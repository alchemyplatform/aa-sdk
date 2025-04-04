export function MFAModalSuccess({
  resetModalState,
}: {
  resetModalState: () => void;
}) {
  return (
    <>
      <h2 className="text-lg font-semibold mb-5">Setup Complete!</h2>
      <p className="mb-5 text-center text-sm">
        You will now be asked for a verification code when logging in.
      </p>
      <button
        className="akui-btn akui-btn-primary rounded-lg h-10 w-full mb-5"
        onClick={resetModalState}
      >
        Done
      </button>
    </>
  );
}
