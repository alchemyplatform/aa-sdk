type NotificationProps = {
  type: "success" | "warning" | "error";
  message: string;
  className?: string;
};

// this isn't used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export function Notification({ className, type, message }: NotificationProps) {
  const bgColor = (() => {
    switch (type) {
      case "success":
        return "bg-bg-surface-success";
      case "warning":
        return "bg-bg-surface-warning";
      case "error":
        return "bg-bg-surface-error";
    }
  })();
  return (
    <div
      className={`${bgColor} text-sm py-1 px-2 radius text-white ${
        className ?? ""
      }`}
    >
      {message}
    </div>
  );
}
