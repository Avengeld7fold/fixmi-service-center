import assert from "node:assert/strict";

// Run with a fresh cua_repl tab opened on the production homepage.
export async function checkHeroAutoplay(tab) {
  await tab.playwright.waitForTimeout(6000);
  const state = await tab.playwright.evaluate(() => {
    const canvas = document.querySelector("main section canvas");
    const fallback = document.querySelector("main section img")?.parentElement;
    return {
      canvasCount: document.querySelectorAll("main section canvas").length,
      canvasWidth: canvas?.width ?? 0,
      canvasHeight: canvas?.height ?? 0,
      fallbackOpacity: fallback ? getComputedStyle(fallback).opacity : null,
    };
  });

  assert.equal(state.canvasCount, 1, "Hero WebGL must autoplay without input");
  assert.ok(state.canvasWidth > 0 && state.canvasHeight > 0, "Hero canvas must have a backing store");
  assert.equal(state.fallbackOpacity, "0", "Fallback may hide only after WebGL is ready");
  return state;
}
