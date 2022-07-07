// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.2.0 */

import type {
  CSSProperties,
  MouseEvent,
  PropsWithChildren,
  ReactElement,
} from "react";
import {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePortal } from "utils/hooks.ts";

type DropdownProps = PropsWithChildren<{
  trigger: "hover" | "click";
  position?: "left" | "right" | "center";
  offset?: number;
  render: (props: { width: number; height: number }) => ReactElement | null;
  onTrigger?: (event: MouseEvent) => void;
}>;

/** Dropdown component, which can be used to show a dropdown menu. */
export default function Dropdown(props: DropdownProps) {
  const { trigger, onTrigger, children } = props;
  const [dropdown, setDropdown] = useState<{ rect: DOMRect } | null>(null);
  const triggerRef = useRef<HTMLElement>();
  const clone = useMemo(() => {
    if (typeof globalThis.document !== "undefined") {
      const child = Children.only(children) as ReactElement;
      const props: Record<string, unknown> = {};
      const triggerEvent = trigger === "hover" ? "onMouseEnter" : "onClick";
      props[triggerEvent] = (e: MouseEvent<HTMLElement>) => {
        onTrigger?.(e);
        if (e.defaultPrevented) {
          return;
        }

        if (trigger === "click") {
          triggerRef.current = e.target as HTMLElement;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        setDropdown((prev) => {
          if (!prev) {
            return { rect };
          }
          return null;
        });
      };
      if (trigger === "hover") {
        props.onMouseLeave = () => {
          setDropdown(null);
        };
      }
      return cloneElement(child, props);
    }
    return children;
  }, [children, trigger, onTrigger]);

  useEffect(() => {
    if (trigger === "click" && dropdown) {
      const onclick = (e: Event) => {
        e.target !== triggerRef.current && setDropdown(null);
      };
      document.addEventListener("click", onclick);
      return () => {
        document.removeEventListener("click", onclick);
      };
    }
  }, [trigger, dropdown]);

  return (
    <>
      {clone}
      {dropdown && <DropdownModal {...props} {...dropdown} />}
    </>
  );
}

function DropdownModal({
  offset = 8,
  position,
  rect,
  render,
  trigger,
}: DropdownProps & {
  rect: DOMRect;
}) {
  const portal = usePortal({ className: "modal-overlay" });
  const el = useMemo(() => render(rect), [render, rect]);
  const [style, setStyle] = useState<CSSProperties>(() => {
    const init = {
      top: rect.bottom + offset + window.scrollY,
      opacity: 0,
      transition: "0.2s opacity ease-in-out",
    };
    if (trigger === "click") {
      init.top += 8;
      init.transition += ", 0.2s top ease-in-out";
    }
    switch (position) {
      case "center":
        return {
          left: rect.left,
          width: rect.width,
          display: "flex",
          justifyContent: "center",
          ...init,
        };
      case "right":
        return {
          right: window.innerWidth - rect.right,
          ...init,
        };
      default:
        return {
          left: rect.left,
          ...init,
        };
    }
  });

  useEffect(() => {
    // set a timeout to trigger the css transition
    setTimeout(() => {
      setStyle((s) => ({
        ...s,
        opacity: 1,
        top: rect.bottom + offset + window.scrollY,
      }));
    }, 1000 / 60);
  }, []);

  return portal(<div className="absolute z-50" style={style}>{el}</div>);
}
