import * as React from "react";

// Define the type for the alert state
type AlertState = {
  type: "close" | "open";
  open: boolean;
  alertType: "info" | string; // Change the type as needed
  message: string;
};

// Define the types for the context and dispatch function
type AlertContextType = {
  alertState: AlertState;
  dispatchAlert: React.Dispatch<{
    type: string;
    alertType?: string;
    message?: string;
  }>;
};

const initialState: AlertState = {
  type: "close",
  open: false,
  alertType: "info",
  message: "",
};

export const useAlertContext = () => React.useContext(AlertContext);

export const AlertContext = React.createContext<AlertContextType>({
  alertState: initialState,
  dispatchAlert: () => {},
});

const reducer = (
  _state: AlertState,
  action: { type: string; alertType?: string; message?: string },
): AlertState => {
  switch (action.type) {
    case "close":
      return {
        ...initialState,
      };
    case "open":
      return {
        type: "open",
        open: true,
        alertType: action.alertType || "info",
        message: action.message || "",
      };
    default:
      throw new Error();
  }
};

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alertState, dispatchAlert] = React.useReducer(reducer, initialState);
  return (
    <AlertContext.Provider
      value={{
        alertState,
        dispatchAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};
