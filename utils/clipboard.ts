// Copyright 2022 the Deno authors. All rights reserved. MIT license.

/**
 * Copy a string to the clipboard, with support for ios safari.
 * Adapted from https://stackoverflow.com/a/53951634/938822.
 * @param text The text to copy to the cliboard
 * @returns `true` if copying was successful, `false` if not.
 */
export async function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_err) {
      return false;
    }
  }

  const textarea = document.createElement("textarea");
  try {
    textarea.setAttribute("readonly", "readonly");
    textarea.setAttribute("contenteditable", "contenteditable");
    textarea.value = text;
    textarea.style.position = "fixed";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    const range = document.createRange();
    range.selectNodeContents(textarea);

    const selection = window.getSelection();
    if (!selection) {
      return false;
    }
    selection!.removeAllRanges();
    selection!.addRange(range);

    textarea.setSelectionRange(0, textarea.value.length);

    return document.execCommand("copy");
  } catch (err) {
    console.error(err);
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
