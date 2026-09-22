import type { ServiceType } from "./data";

export function moveBrandServices(services: ServiceType[], fromBrand: string, toBrand: string): ServiceType[] {
  if (fromBrand === toBrand) return services;

  const groups = new Map<string, ServiceType[]>();
  for (const service of services) {
    if (!service.Brand) continue;
    const group = groups.get(service.Brand) ?? [];
    group.push(service);
    groups.set(service.Brand, group);
  }

  const brands = [...groups.keys()];
  const fromIndex = brands.indexOf(fromBrand);
  const toIndex = brands.indexOf(toBrand);
  if (fromIndex < 0 || toIndex < 0) return services;

  brands.splice(fromIndex, 1);
  brands.splice(toIndex, 0, fromBrand);
  const reordered = brands.flatMap((brand) => groups.get(brand)!);
  let nextIndex = 0;
  return services.map((service) => service.Brand ? reordered[nextIndex++] : service);
}
