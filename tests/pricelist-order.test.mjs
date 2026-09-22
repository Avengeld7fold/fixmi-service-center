import assert from "node:assert/strict";
import { test } from "node:test";
import { moveBrandServices } from "../lib/pricelist-order.ts";

const service = (Brand, Slug) => ({ Brand, Slug });

test("moves complete brands while preserving service and unbranded positions", () => {
  const services = [
    service("Samsung", "s1"),
    service("ASUS", "a1"),
    service("Samsung", "s2"),
    service(undefined, "other"),
    service("Vivo", "v1"),
  ];

  const reordered = moveBrandServices(services, "Vivo", "Samsung");
  assert.deepEqual(reordered.map(({ Slug }) => Slug), ["v1", "s1", "s2", "other", "a1"]);
  assert.deepEqual(moveBrandServices(reordered, "Samsung", "Vivo").map(({ Slug }) => Slug),
    ["s1", "s2", "v1", "other", "a1"]);
  assert.equal(moveBrandServices(services, "Unknown", "ASUS"), services);
  assert.equal(moveBrandServices(services, "Samsung", "Samsung"), services);
});
