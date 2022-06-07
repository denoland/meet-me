// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import type { PropsWithChildren, ReactElement, ReactNode } from "react";
import {
  Children,
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import events from "utils/events.ts";
import { onKeyDown } from "utils/hooks.ts";
import Modal from "./Modal.tsx";
import Button from "./Button.tsx";
import icons from "../icons/mod.ts";

type DialogProps = PropsWithChildren<{
  title: ReactNode;
  message?: ReactNode;
  danger?: boolean;
  cancelText?: string;
  okText?: string;
  okDisabled?: boolean;
  onCancel?: () => void;
  onOk?: () => Promise<void | boolean> | void | boolean;
  showCloseButton?: boolean;
}>;

export function dialog(props: Omit<DialogProps, "children" | "okDisabled">) {
  events.emit("dash:dialog", props);
}

export function DialogProvider() {
  const [currentDialog, setCurrentDialog] = useState<DialogProps | null>(null);

  useEffect(() => {
    const listener = (e: Record<string, unknown>) => {
      setCurrentDialog(e as DialogProps);
    };

    events.on("dash:dialog", listener);

    return () => {
      events.off("dash:dialog", listener);
    };
  }, []);

  if (currentDialog === null) {
    return null;
  }

  return (
    <DialogModal
      {...currentDialog}
      onESC={() => setCurrentDialog(null)}
    />
  );
}

export default function Dialog({
  children,
  ...rest
}: DialogProps) {
  const [visible, setVisisble] = useState(false);
  const handler = useMemo(
    () =>
      cloneElement(Children.only(children) as ReactElement, {
        onClick: () => {
          setVisisble(true);
        },
      }),
    [children],
  );

  return (
    <>
      {handler}
      {visible && (
        <DialogModal
          {...rest}
          onESC={() => setVisisble(false)}
        />
      )}
    </>
  );
}

export function DialogModal({
  title,
  message,
  danger,
  cancelText = "Cancel",
  okText = "OK",
  okDisabled,
  onCancel,
  onOk,
  onESC,
  showCloseButton,
}: DialogProps & { onESC?: () => void }) {
  const [isWaiting, setIsWaiting] = useState(false);

  const onOkClick = useCallback(async () => {
    if (okDisabled || isWaiting) {
      return;
    }
    try {
      const ret = onOk?.();
      if (ret === false) {
        return;
      }
      if (ret && ret instanceof Promise) {
        setIsWaiting(true);
        const result = await ret;
        setIsWaiting(false);
        if (result === false) {
          return;
        }
      }
      onESC?.();
    } catch {
      setIsWaiting(false);
    }
  }, [onOk, onESC, okDisabled, isWaiting]);

  onKeyDown((e) => e.key.toLowerCase() === "enter", onOkClick);

  return (
    <Modal
      onESC={() => !isWaiting && onESC?.()}
      className="p-6 w-full md:!w-auto md:min-w-140"
      showCloseButton={showCloseButton}
    >
      {title && (
        <header>
          <h2 className="font-medium text-lg">
            {title}
          </h2>
        </header>
      )}
      {message && (
        <div className="mt-3 text-neutral-100">
          {message}
        </div>
      )}
      <footer className="mt-6 flex gap-2 justify-end">
        <Button
          style="alternate"
          disabled={isWaiting}
          onClick={() => {
            setIsWaiting(false);
            onCancel?.();
            onESC?.();
          }}
        >
          {cancelText}
        </Button>
        <Button
          style={danger ? "danger" : "primary"}
          disabled={okDisabled || isWaiting}
          onClick={onOkClick}
        >
          {isWaiting && <icons.Spin size={14} />}
          {okText}
        </Button>
      </footer>
    </Modal>
  );
}
