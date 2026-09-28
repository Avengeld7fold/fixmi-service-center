import assert from "node:assert/strict";

// Run with a cua_repl tab after opening the first accordion on a fresh pricelist page.
export async function checkPriceTable(tab) {
  const table = tab.playwright.locator("table");
  assert.equal(await table.count(), 1, "Header and prices must share one table");
  const measure = () => table.evaluate((el) => {
    const scroller = el.parentElement;
    const headers = [...el.querySelectorAll("th")];
    const cells = [...el.querySelector("tbody tr").cells];
    const rect = scroller.getBoundingClientRect();
    return {
      left: scroller.scrollLeft,
      top: scroller.scrollTop,
      maxLeft: scroller.scrollWidth - scroller.clientWidth,
      overscrollY: getComputedStyle(scroller).overscrollBehaviorY,
      headerOffset: headers[0].getBoundingClientRect().y - rect.y,
      modelOffset: cells[0].getBoundingClientRect().x - rect.x,
      misalignment: Math.max(...headers.map((header, i) =>
        Math.abs(header.getBoundingClientRect().x - cells[i].getBoundingClientRect().x))),
      point: [rect.x + rect.width * 0.75,
        Math.min(rect.y + rect.height / 2, el.ownerDocument.documentElement.clientHeight - 80)],
    };
  });
  const results = [];
  for (const direction of ["right", "right", "left", "left"]) {
    const before = await measure();
    await tab.scroll(before.point, direction, 0.3);
    await tab.getAXState({ emit: false });
    const after = await measure();
    assert.equal(after.overscrollY, "auto", "Lenis CSS must not trap vertical scrolling");
    assert.ok(after.misalignment < 1, "Header and price columns must align");
    assert.ok(Math.abs(after.modelOffset) < 1, "Model column must stay pinned");
    if (after.top > 0) assert.ok(Math.abs(after.headerOffset) < 1, "Header must stay pinned");
    if (direction === "right" && before.maxLeft > before.left + 1) {
      assert.ok(after.left > before.left, "Horizontal scrolling must respond");
    }
    results.push(after);
  }
  return results;
}

// Run on a fresh ID/EN iPhone pricelist page using the real browser controls.
export async function checkPricelistControls(tab, english = false) {
  const service = tab.playwright.locator('main button[id^="svc-btn-"]').first();
  await service.press("Enter");
  await tab.getAXState({ emit: false });
  const search = tab.playwright.getByRole("searchbox");
  await search.fill("");
  await tab.getAXState({ emit: false });
  const originalRows = await tab.playwright.locator("tbody tr").count();
  assert.ok(originalRows > 0);
  for (const query of [english ? "warranty" : "garansi", "garansi"]) {
    await search.fill(query);
    await tab.getAXState({ emit: false });
    assert.equal(await tab.playwright.locator("tbody tr").count(), originalRows);
  }
  const missing = "z".repeat(120);
  await search.fill(missing);
  await tab.getAXState({ emit: false });
  assert.equal(await tab.playwright.locator("tbody tr").count(), 0);
  const empty = await tab.playwright.getByRole("status").evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      insideScroller: !!el.closest("[data-lenis-prevent-horizontal]"),
      fits: rect.left >= 0 && rect.right <= el.ownerDocument.documentElement.clientWidth,
      wraps: el.scrollWidth <= el.clientWidth,
    };
  });
  assert.equal(empty.insideScroller, false);
  assert.ok(empty.fits && empty.wraps, "Empty state must fit even for an unbroken query");
  await service.press("Enter");
  await tab.getAXState({ emit: false });
  assert.equal(await tab.playwright.locator("main input").evaluate((el) => !!el.closest("[inert]")), true);
  await service.press("Tab");
  await tab.getAXState({ emit: false });
  assert.equal(await tab.playwright.evaluate(() => !!document.activeElement.closest("[inert]")), false);
  await service.press("Enter");
  await tab.getAXState({ emit: false });
  assert.equal(await search.getAttribute("value"), missing, "Closing must retain search state");
  await search.fill("");
  await tab.getAXState({ emit: false });
  assert.equal(await tab.playwright.locator("tbody tr").count(), originalRows);
  const warranty = tab.playwright.getByRole("button", { name: /Warranty Terms & Policy|Ketentuan Garansi Service/ });
  await warranty.press("Enter");
  await tab.getAXState({ emit: false });
  assert.equal(await tab.playwright.getByRole("dialog").count(), 1);
  for (const key of ["Tab", "Tab", "Shift+Tab", "Shift+Tab"]) {
    await tab.pressKey(null, key);
    await tab.getAXState({ emit: false });
    assert.equal(await tab.playwright.evaluate(() => !!document.activeElement.closest("dialog")), true,
      "Modal keyboard focus must stay inside");
  }
  await tab.pressKey(null, "Escape");
  await tab.getAXState({ emit: false });
  assert.equal(await tab.playwright.getByRole("dialog").count(), 0);
  assert.equal(await tab.playwright.evaluate(() => document.activeElement.textContent.includes("→")), true,
    "Closing must restore the trigger focus");
  assert.equal(await tab.playwright.evaluate(() => document.body.style.overflow), "");
  return { originalRows, empty, searchRetention: true, modalFocus: true };
}
