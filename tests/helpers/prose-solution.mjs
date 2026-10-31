// The canonical winning command path through a PROSE text world, derived by
// WALKING THE WORLD DATA ITSELF with a fake api (tracking flags/inventory exactly
// like js/textworld/engine.js's real api, so `when(api)` predicates evaluate the
// way live play would). A change to the world's room graph updates the
// expectation automatically. Copied from tests/integration/textworld.test.mjs.

export function deriveProseSolution(world) {
  const fakeFlags = new Set();
  const fakeInv = new Set();
  const box = { room: world.start };
  const api = {
    say() {}, describe() {},
    take: (i) => fakeInv.add(i), drop: (i) => fakeInv.delete(i), has: (i) => fakeInv.has(i),
    setFlag: (n) => fakeFlags.add(n), clearFlag: (n) => fakeFlags.delete(n), flag: (n) => fakeFlags.has(n),
    visited: () => true,
    go: (id) => { box.room = id; },
  };
  const path = [];
  let guard = 0;
  while (!world.goal(api) && guard++ < 50) {
    const room = world.rooms[box.room];
    const offered = room.commands.filter((c) => !c.when || c.when(api));
    // `ask` commands are BONUS riddles: they never set the goal and stay offered forever.
    const nonMove = offered.find((c) => c.text !== 'look' && !c.text.startsWith('go ') && !c.ask);
    const choice = nonMove || offered.find((c) => c.text.startsWith('go '));
    if (!choice) break;
    path.push(choice.text);
    choice.run(api);
  }
  return path;
}
