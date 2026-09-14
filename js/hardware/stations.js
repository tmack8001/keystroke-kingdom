// THE HARDWARE — the station registry
// ---------------------------------------------------------------------------
// docs/specs/hardware-wing.md. This wing is a SUBJECT, not a room (§0.1): the
// room name kept failing because the room kept CHANGING — the C64 lived in the
// living room because it plugged into the television, and the tower moved to a
// home office the moment dial-up needed the phone line. No single room holds
// forty years, so the wing is named for what it teaches instead.
//
// THE SPINE (§0.2): the wall is ordered by the room the machine MIGRATED INTO —
// living room → den → home office → bedroom → pocket. The failed room name
// becomes the content: the machine came closer to you every decade.
//
// THE VERB (§0.5): you do not read a plaque, you TYPE THE BOOT LINE and the
// machine wakes. That is what actually happened, and it keeps the wing a typing
// room rather than a museum.
//
// Adding a station = one row here + its art in HOME_MACHINES (js/ui/cabinet-art.js)
// + its id in the wing's `cabinets` list in BACK_WALL_DOORS.
//
// ⚠️ Phase 1 ships the two machines whose art is ALREADY sourced from
// photographs (research/wiki/tech/console-hardware-silhouettes.md + its media
// vault). The remaining five stations in the spec's §5.1 table wait on their own
// drawing reference — DRAW A REAL THING means having the real thing to look at.

export const STATIONS = [
  {
    id: 'apple-iie',
    room: 'THE DEN',
    year: '1983',
    machine: 'APPLE IIe',
    maker: 'APPLE COMPUTER',
    // Why this machine is in a den and not a living room: it had no television
    // out. It needed its own monitor, so it needed its own desk, so it needed a
    // room where a desk could live.
    why: 'IT NEEDED ITS OWN DESK,\nSO IT NEEDED ITS OWN ROOM.',
    running: 'STICKYBEAR TYPING',
    runningYear: '1985',
    prompt: ']',
    // The machine's own words, typed one line at a time. A disk does not tell
    // you what is on it — you ASK.
    boot: [
      { type: 'CATALOG', says: ['DISK VOLUME 254', '', ' A 012 STICKYBEAR TYPING', ' A 034 HELLO', ' B 008 TYPING.DATA'] },
      { type: 'RUN STICKYBEAR', says: ['LOADING...'] },
    ],
  },
  {
    id: 'msdos-pc',
    room: 'THE DEN',
    year: '1993',
    machine: 'MS-DOS PC',
    maker: 'THE BEIGE TOWER',
    why: 'THE SAME DESK, TEN YEARS ON.\nNOW IT HAD A CD DRIVE.',
    running: 'GIZMOS & GADGETS!',
    runningYear: '1993',
    prompt: 'C:\\>',
    boot: [
      { type: 'DIR', says: ['Volume in drive C is DOS', '', 'GIZMOS   EXE    412,672', 'STICKY   EXE     88,104', '        2 file(s)'] },
      { type: 'GIZMOS', says: ['Starting...'] },
    ],
  },
];

export function stationById(id) {
  return STATIONS.find(s => s.id === id) || null;
}
