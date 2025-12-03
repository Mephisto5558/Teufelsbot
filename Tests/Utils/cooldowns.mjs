import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';

import cooldowns from '#Utils/cooldowns.js';

/* eslint-disable @typescript-eslint/no-unsafe-assignment -- not gonna type all that */
const
  mockClient = () => ({
    cooldowns: new Map()
  }),

  mockThisContext = (client, type, id) => ({
    client,
    [type]: { id }
  });
/* eslint-enable @typescript-eslint/no-unsafe-assignment */

await topLvlTest('cooldowns', { concurrency: false }, async t => Promise.allSettled([
  t.test('should return 0 for the first use', () => {
    const
      client = mockClient(),
      thisContext = mockThisContext(client, 'user', '123'),
      cooldownSettings = { user: 5000 };

    assert.equal(cooldowns.call(thisContext, 'test-cmd', cooldownSettings), 0);
  }),

  t.test('should return remaining cooldown on second use', ({ mock }) => {
    const
      client = mockClient(),
      thisContext = mockThisContext(client, 'user', '123'),
      cooldownSettings = { user: 10_000 }; // 10s

    mock.timers.enable({ apis: ['Date'] });

    cooldowns.call(thisContext, 'test-cmd', cooldownSettings); // First call

    // Second call immediately after
    const result = cooldowns.call(thisContext, 'test-cmd', cooldownSettings);
    assert.ok(result > 9 && result <= 10, `Expected ~10, got ${result}`);
  }),

  t.test('should return remaining cooldown after some time has passed', ({ mock }) => {
    const client = mockClient(),
      thisContext = mockThisContext(client, 'user', '123'),
      cooldownSettings = { user: 10_000 }; // 10s

    mock.timers.enable({ apis: ['Date'], now: 100_000 });

    cooldowns.call(thisContext, 'test-cmd', cooldownSettings); // First call

    mock.timers.tick(3000); // Advance time by 3s

    // Second call
    const result = cooldowns.call(thisContext, 'test-cmd', cooldownSettings);
    assert.ok(result > 6 && result <= 7, `Expected ~7, got ${result}`);
  }),

  t.test('should return 0 after cooldown has expired', ({ mock }) => {
    const
      client = mockClient(),
      thisContext = mockThisContext(client, 'user', '123'),
      cooldownSettings = { user: 5000 }; // 5s

    mock.timers.enable({ apis: ['Date'] });

    cooldowns.call(thisContext, 'test-cmd', cooldownSettings); // First call

    mock.timers.tick(5001); // Advance time beyond the cooldown

    // Second call should have no cooldown
    const result = cooldowns.call(thisContext, 'test-cmd', cooldownSettings);
    assert.equal(result, 0);
  }),

  t.test('should handle multiple cooldown types (user, guild)', ({ mock }) => {
    const
      client = mockClient(),
      userContext = mockThisContext(client, 'user', '123'),
      guildContext = { ...mockThisContext(client, 'guild', 'abc'), user: { id: '456' } },
      cooldownSettings = { user: 5000, guild: 10_000 };

    mock.timers.enable({ apis: ['Date'] });

    // Set user cooldown
    cooldowns.call(userContext, 'test-cmd', cooldownSettings);
    const userCooldown = cooldowns.call(userContext, 'test-cmd', cooldownSettings);
    assert.ok(userCooldown > 4 && userCooldown <= 5, 'User cooldown should be active');

    // Guild cooldown should be separate and not active for this context yet
    const guildCooldown = cooldowns.call(guildContext, 'test-cmd', cooldownSettings);
    assert.equal(guildCooldown, 0, 'Guild cooldown should not be active for a different user/guild context');
  })
]));