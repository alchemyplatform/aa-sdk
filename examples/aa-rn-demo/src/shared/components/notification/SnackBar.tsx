import { AlertContext } from "@context/alert";
import { colors } from "@theme/color";
import * as React from "react";
import { Snackbar } from "react-native-paper";

const SnackBar = () => {
  const { alertState, dispatchAlert } = React.useContext(AlertContext);
  const [alertSyle, setAlertStyle] = React.useState({
    backgroundColor: colors.info,
  });

  React.useEffect(() => {
    switch (alertState.alertType) {
      case "info":
        setAlertStyle({
          backgroundColor: colors.success,
        });
        break;
      case "error":
        setAlertStyle({
          backgroundColor: colors.error,
        });
        break;
      case "success":
        setAlertStyle({
          backgroundColor: colors.success,
        });
        break;
      default:
        setAlertStyle({
          backgroundColor: colors.info,
        });
    }
  }, [alertState]);

  const close = () => {
    dispatchAlert({ type: "close" });
  };

  return (
    <>
      {typeof alertState.open === "boolean" && (
        <Snackbar
          style={alertSyle}
          visible={alertState.open}
          onDismiss={() => close()}
          action={{
            label: "Close",
          }}
        >
          {alertState.message}
        </Snackbar>
      )}
    </>
  );
};

export default SnackBar;
