import { describe, expect, it } from "vitest";
import { RelayStore } from "../../src/core/relay.js";
import { CanonicalRelayService } from "../../src/service/canonical-relay-service.js";

class DurableTestStore extends RelayStore {
  flushCalls = 0;
  async flush(): Promise<void> {
    this.flushCalls += 1;
  }
}

describe("relay durability boundary", () => {
  it("awaits an adapter flush when one is available", async () => {
    const store = new DurableTestStore();
    const rpc = {} as ConstructorParameters<typeof CanonicalRelayService>[1];
    const service = new CanonicalRelayService(store, rpc);

    service.initiatePass("mission-1", "holder-a", "holder-b", { requireOpaqueTag: true });
    expect(store.flushCalls).toBe(0);

    await service.flushDurability();
    expect(store.flushCalls).toBe(1);
  });

  it("is a no-op for the ordinary in-memory store", async () => {
    const rpc = {} as ConstructorParameters<typeof CanonicalRelayService>[1];
    const service = new CanonicalRelayService(new RelayStore(), rpc);
    await expect(service.flushDurability()).resolves.toBeUndefined();
  });
});
