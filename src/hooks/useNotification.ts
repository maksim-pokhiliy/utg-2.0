"use client";

import { useEffect, useRef } from "react";
import { Notyf } from "notyf";

import "notyf/notyf.min.css";

type NotificationHook = {
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
};

const useNotification = (): NotificationHook => {
  const notyf = useRef<Notyf | null>(null);

  useEffect(() => {
    notyf.current = new Notyf({
      duration: 10000,
      dismissible: true,
      ripple: true,
      position: {
        x: "right",
        y: "bottom",
      },
    });
  }, []);

  const notifySuccess = (message: string) => {
    if (notyf.current) {
      notyf.current.success(message);
    }
  };

  const notifyError = (message: string) => {
    if (notyf.current) {
      notyf.current.error(message);
    }
  };

  return { notifySuccess, notifyError };
};

export default useNotification;
