import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PRINT_ASSETS_TIMEOUT_MS, usePostPrint } from "./use-post-print";

const viewWithImage = (decode: () => Promise<void>) => {
  const view = document.createElement("div");
  const image = document.createElement("img");
  image.decode = decode;
  view.append(image);
  return view;
};

describe("usePostPrint", () => {
  let print: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    print = vi.fn();
    vi.stubGlobal("print", print);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("does not mount the print view until printing is requested", () => {
    const { result } = renderHook(() => usePostPrint(1));
    expect(result.current.isMounted).toBe(false);
    expect(print).not.toHaveBeenCalled();
  });

  it("prints only after the images have loaded", async () => {
    let finishDecoding = () => {};
    const decode = () => new Promise<void>((resolve) => {
      finishDecoding = resolve;
    });
    const { result } = renderHook(() => usePostPrint(1));
    result.current.viewRef.current = viewWithImage(decode) as HTMLDivElement;

    act(() => result.current.startPrint());
    expect(result.current.isMounted).toBe(true);
    expect(result.current.isPreparing).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(print).not.toHaveBeenCalled();

    await act(async () => {
      finishDecoding();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(print).toHaveBeenCalledTimes(1);
    expect(result.current.isPreparing).toBe(false);
  });

  it("still prints when an image never finishes loading", async () => {
    const { result } = renderHook(() => usePostPrint(1));
    result.current.viewRef.current = viewWithImage(() => new Promise(() => {})) as HTMLDivElement;

    act(() => result.current.startPrint());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRINT_ASSETS_TIMEOUT_MS);
    });
    expect(print).toHaveBeenCalledTimes(1);
  });

  it("still prints when an image is broken", async () => {
    const { result } = renderHook(() => usePostPrint(1));
    result.current.viewRef.current = viewWithImage(() => Promise.reject(new Error("broken"))) as HTMLDivElement;

    act(() => result.current.startPrint());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(print).toHaveBeenCalledTimes(1);
  });

  it("routes Ctrl+P through the same flow and mounts the view for menu printing", async () => {
    const { result } = renderHook(() => usePostPrint(1));

    const shortcut = new KeyboardEvent("keydown", { key: "p", ctrlKey: true, cancelable: true });
    act(() => {
      window.dispatchEvent(shortcut);
    });
    expect(shortcut.defaultPrevented).toBe(true);
    expect(result.current.isPreparing).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(print).toHaveBeenCalledTimes(1);

    const menu = renderHook(() => usePostPrint(2));
    act(() => {
      window.dispatchEvent(new Event("beforeprint"));
    });
    expect(menu.result.current.isMounted).toBe(true);
  });

  it("leaves the browser shortcut alone before the article has loaded", () => {
    renderHook(() => usePostPrint(undefined));
    const shortcut = new KeyboardEvent("keydown", { key: "p", ctrlKey: true, cancelable: true });
    window.dispatchEvent(shortcut);
    expect(shortcut.defaultPrevented).toBe(false);
  });

  it("does not print a previous article after navigating away while preparing", async () => {
    const { result, rerender } = renderHook(({ id }) => usePostPrint(id), { initialProps: { id: 1 } });
    result.current.viewRef.current = viewWithImage(() => new Promise(() => {})) as HTMLDivElement;

    act(() => result.current.startPrint());
    rerender({ id: 2 });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRINT_ASSETS_TIMEOUT_MS);
    });
    expect(print).not.toHaveBeenCalled();

    rerender({ id: 1 });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRINT_ASSETS_TIMEOUT_MS);
    });
    expect(print).not.toHaveBeenCalled();
  });
});
