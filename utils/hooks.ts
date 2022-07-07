// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useEffect } from "react";

// better ensure the `cb` is wrapered by the `useCallback` hook
export function onKeyDown(matches: KBEventFilter, cb: () => void) {
  onKeyPress(matches, (down) => down && cb());
}

// better ensure the `cb` is wrapered by the `useCallback` hook
export function onKeyUp(matches: KBEventFilter, cb: () => void) {
  onKeyPress(matches, (down) => !down && cb());
}

type KBEventFilter = (e: KeyboardEvent) => boolean;
type onPressCallback = (down: boolean) => void;

// better ensure the `onPress` is wrapered by the `useCallback` hook
export function onKeyPress(matches: KBEventFilter, onPress: onPressCallback) {
  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (matches(e)) {
        e.preventDefault();
        onPress(true);
      }
    };
    const upHandler = (e: KeyboardEvent) => {
      if (matches(e)) {
        e.preventDefault();
        onPress(false);
      }
    };

    // Add event listeners
    globalThis.window.addEventListener("keydown", downHandler);
    globalThis.window.addEventListener("keyup", upHandler);

    // Remove event listeners on cleanup
    return () => {
      globalThis.window.removeEventListener("keydown", downHandler);
      globalThis.window.removeEventListener("keyup", upHandler);
    };
  }, [onPress]);
}
