// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.1.0 */

import type { PropsWithChildren } from "react";
import { useRef, useState } from "react";
import icons from "../icons/mod.ts";
import { copyToClipboard } from "utils/clipboard.ts";

type CopyableProps = PropsWithChildren<{
  value?: string;
  className?: string;
  showCopiedText?: boolean;
}>;

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    if (!copied) {
      if (await copyToClipboard(text)) {
        setCopied(true);
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return { copied, copyToClipboard: copy };
}

export default function Copyable(
  { value, className, showCopiedText = false, children }: CopyableProps,
) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { copied, copyToClipboard } = useClipboard();

  return (
    <div
      className={"flex items-center gap-0.5 " + (className || "")}
      ref={parentRef}
    >
      {children}
      <button
        className="flex items-center justify-center text-white bg-tranparent cursor-pointer hover:bg-gray-200/60 rounded-full w-6 h-6 select-none"
        onClick={(e) => {
          e.stopPropagation();
          const text = value ?? parentRef.current?.innerText.trim();
          if (text) {
            copyToClipboard(text);
          }
        }}
        type="button"
        role="button"
        title={copied ? "Copied" : "Copy"}
      >
        {!showCopiedText && copied
          ? <icons.Check size={12} className="text-fresh" />
          : <icons.Copy size={14} />}
      </button>
      {copied && showCopiedText && (
        <span className="text-fresh text-xs">Copied!</span>
      )}
    </div>
  );
}
