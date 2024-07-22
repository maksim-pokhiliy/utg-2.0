import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { cartState } from "../recoil/atoms";

const useInitializeCart = () => {
  const setCart = useSetRecoilState(cartState);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");

    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [setCart]);
};

export default useInitializeCart;
