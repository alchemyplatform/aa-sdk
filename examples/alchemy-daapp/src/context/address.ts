import {useParams} from "react-router-dom";

type UseAddressReturnType =
  | {
      address: undefined;
      hasAddress: false;
    }
  | {
      address: string;
      hasAddress: true;
    };

export const useAddress = (): UseAddressReturnType => {
  const {address} = useParams();
  if (address !== "0x0" && address !== undefined && address !== null) {
    return {
      address,
      hasAddress: true,
    };
  } else {
    return {
      address: undefined,
      hasAddress: false,
    };
  }
};
