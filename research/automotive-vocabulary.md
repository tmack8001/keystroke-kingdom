# Automotive & EV Vocabulary
## The vetted word pool for Act 7 — Speed / Racing

*Compiled 2026-09-12 for the **Act 7 — Speed / Racing** design work (`docs/ROADMAP.md`;
the bonus act idea recorded in project memory as the physical-mastery counterpart to
[Act 6 — Text Worlds](act6-riddle-bank.md)). Trevor's brief: the act's words should be
about cars — "car parts, functions, brands, etc.", explicitly including "modern references
to electric vehicles (EVs) and related concepts like regenerative braking and Rivian, Tesla,
Scout, Zoox, and other brands entering that specific market."*

*This is a **content proposal**, not shipped data. It is the pool a word-bank designer and
a product spec draw from — every word carries its letter count, a reading-difficulty tier, a
decodability judgement, and a plain-language definition that is true rather than merely
simple. Nothing here has been written into `js/`; the downstream flags at the bottom say
what would need to change and who owns it.*

### How to verify

Every **historical, technical and brand claim** below follows the arcade-historian citation
standard (`.claude/agents/arcade-historian.md`): 2–4 references per claim, institutional/
primary preferred, Wikipedia never alone, and **no URL written from memory** — every link
appeared in a live search or was fetched this session. Fetched links are marked
**[fetched]**; the rest *(search result only, not fetched)*. Three URLs were dropped or
explicitly marked unusable after failing to fetch (see the end of the doc).

**What is deliberately *not* cited:** dictionary-level definitions of ordinary nouns
(`tire`, `wheel`, `door`). Citing a source for "a wheel is the round part that turns" would
be citation theatre. The definitions below were written to be child-true and were sanity-
checked against the technical sources cited in the EV and history sections; anything with a
non-obvious or contested technical claim (regen, one-pedal, kWh, torque, single-speed EV
gearing) carries a reference.

Atomic wiki pages written in this pass carry the deep citations:
[[regenerative-braking]] · [[electric-vehicle-history]] · [[ev-makers-2026]] ·
[[zoox-robotaxi]] · [[benz-patent-motorwagen]] · [[three-point-seatbelt]].

---

## 1. The pedagogical contract (read before picking any word)

Keystroke Kingdom's Word Bank Principle (`CLAUDE.md`, `.claude/rules/product.md`
§"Words Emerge Naturally") is that **typing a real word the child can READ is a double win**.
That makes this list a reading list first and an automotive list second. Related wiki:
[[decodable-word-lists]] (Dolch/Fry, decodability) and [[letter-frequency]].

**Tiers used in every table below** — these map onto the game's existing MIN/MAX WORD LENGTH
levers (`getWordLengthRange()` in `js/settings.js`; `product.md` §Word Length), which is why
the HARD tier is useful rather than wasted: it is the payload that lets the game age with the
player.

| Tier | Shape | Who it's for |
|---|---|---|
| **EASY** | 3–5 letters, phonetically decodable, concrete meaning (`car`, `tire`, `race`, `lap`, `fast`) | the early reader the game was founded for |
| **MEDIUM** | 5–7 letters, or one irregular element — silent-e, soft c/g, `-le`, digraph (`wheel`, `brake`, `motor`, `engine`, `battery`) | a reader with a year or two on them |
| **HARD** | 8+ letters, multi-syllable, usually Latinate (`regenerative`, `aerodynamics`, `transmission`) | the MAX-WORD-LENGTH lever; older kids, parents, showing off |

**Decodable?** column: **Y** = sounds out by normal rules; **partly** = one irregular chunk a
child can be walked through; **N** = must be learned as a sight word (spelling fights the
sound). An **N** word is not banned — it is a word to introduce *after* the child has seen it,
or to put in a parent-facing/HARD pocket.

**The pool at a glance** (175 entries; a handful — `brake`, `battery`, `charge`, `grid`,
`plug`, `belt` — deliberately appear in two groups because they are two things):

| Group | EASY | MEDIUM | HARD | Total |
|---|---|---|---|---|
| Parts (§3) | 21 | 29 | 23 | 73 |
| Functions & verbs (§4) | 17 | 14 | 5 | 36 |
| Race vocabulary (§5) | 14 | 11 | 13 | 38 |
| EV concepts (§6) | 6 | 12 | 10 | 28 |
| **All** | **58** | **66** | **51** | **175** |

Plus §7's brands, which are a separate category: proper nouns, capitals, Shift.

**Note on `car` itself:** under the game's key-unlock order the letter **C arrives at Level
13**. The single most on-theme word in the act is not typeable until two-thirds of the way
through the curriculum. Act 7 is a bonus act with the full keyboard available, so this only
matters for history cards (whose word must be typeable at the card's level) — but it is the
kind of thing that surprises people, so it is written down here.

---

## 2. The safety/blocklist collisions (check this before generation, not after)

The kid-safety blocklist is single-source at `js/word-blocklist.json` (floor, exact-word
match, read by both Go and JS). **No automotive word collides with the floor as an exact
word.** The collisions are all with the *second* layer: `wordgenSubstringExtras` in
`main.go`, which applies **substring** matching to single generated words (deliberately
over-blocking, because "guns" must die with "gun"). That layer gates **only the
`/api/wordgen` LLM path** — curated static word banks are not filtered by it.

**Consequence for Act 7: these words can live in a static bank but can never be
LLM-generated.**

| Word (automotive sense) | Blocked by substring | Notes |
|---|---|---|
| **speed**, speeding, speedway, speedometer, "peel out" | `pee` | The most on-theme word in the whole act. Static bank only. |
| **pass**, passing, **passenger**, bypass | `ass` | Racing's core verb. |
| **chassis**, **class** (race class), **assist** (brake/driver assist), **assembly** (assembly line), compass | `ass` | |
| **cockpit** | `cock` | |
| **diesel** | `die` | |
| **warm** / **warm-up lap**, **forward**, rearward, **steward** (race steward), award | `war` | `warm` is already in the Level 11 bank in `.claude/rules/levels.md` — static, so it ships fine today; generation just never produces it. |
| **title** (title sponsor), **titanium**, **competition** | `tit` | Also affects non-automotive vocabulary generally. |
| **scrap**, scrapyard | `crap` | |
| **butterfly** (valve) | `butt` | |
| VW **Passat**, **Shell** (fuel brand) | `ass`, `hell` | Brand words; not recommended anyway. |

**Separate, non-blocklist tone flags** (nothing filters these — they are a design judgement
under the One Rule, "stop the player with joy, never punishment"):

- **crash**, **wreck**, **collision**, **burnout**, **spin out**, **DNF** — not blocked by
  anything, and all wrong for this game. A racing act that never crashes is the same design
  choice as Missile Command's cities that can never be hit (`.claude/rules/levels/act5.md`
  Level 23). Recommend they simply never enter the pool.
- Avoid **`dead`/`die`/`kill`** in Act 7 *prose* (flavour text, sentences, any coda story):
  they are floor words matched exact-word by `hasBlockedWord`, so "the engine died" would be
  silently dropped by the client validator — and it is the wrong register besides.

---

## 3. Parts

| Word | Len | Tier | Decodable? | Child-true definition |
|---|---|---|---|---|
| car | 3 | EASY | Y | The machine you ride in that drives on roads. |
| rim | 3 | EASY | Y | The metal ring the tire wraps around. |
| gas | 3 | EASY | Y | The liquid fuel an engine burns. (An electric car doesn't use any.) |
| cab | 3 | EASY | Y | The part of a truck where the driver sits. |
| van | 3 | EASY | Y | A boxy car with lots of room in the back. |
| key | 3 | EASY | partly | The thing that tells the car it's really you. |
| tire | 4 | EASY | partly (silent e) | The rubber ring around the wheel that touches the road. |
| hood | 4 | EASY | Y | The lid over the front of the car. |
| horn | 4 | EASY | Y | The button that makes the car say *beep*. |
| door | 4 | EASY | Y | How you get in. |
| seat | 4 | EASY | Y | Where you sit. |
| roof | 4 | EASY | Y | The top of the car. |
| tank | 4 | EASY | Y | The container that holds the fuel. |
| gear | 4 | EASY | Y | A toothed wheel. Gears decide how hard the motor pushes. |
| belt | 4 | EASY | Y | A loop that carries turning from one part to another — or the strap that keeps you safe. |
| axle | 4 | MEDIUM | partly (`-le`) | The bar a wheel spins around. |
| vent | 4 | EASY | Y | A slot that lets air in or out. |
| hose | 4 | EASY | partly | A bendy tube for liquid. |
| pipe | 4 | EASY | partly | A stiff tube. |
| plug | 4 | EASY | Y | The end you push in to connect something. |
| wire | 4 | EASY | partly | A thin metal string that carries electricity. |
| lamp | 4 | EASY | Y | A light. |
| tread | 5 | MEDIUM | partly | The grooves in a tire. They push water out of the way so you don't slip. |
| wheel | 5 | MEDIUM | partly (`wh`) | The round part that turns and rolls the car along. |
| brake | 5 | MEDIUM | partly | The part that slows the car down. |
| pedal | 5 | MEDIUM | partly | A lever you push with your foot. |
| motor | 5 | MEDIUM | Y | The machine that spins to make the wheels turn. |
| frame | 5 | MEDIUM | partly | The skeleton the whole car is built on. |
| trunk | 5 | MEDIUM | Y | The storage space, usually at the back. |
| glass | 5 | MEDIUM | Y | The see-through windows. |
| truck | 5 | MEDIUM | Y | A big car built for carrying things. |
| valve | 5 | MEDIUM | partly | A little door that lets air or liquid through — or stops it. |
| rotor | 5 | MEDIUM | Y | The metal disc the brake squeezes to slow the wheel. |
| wiper | 5 | MEDIUM | partly | The arm that sweeps rain off the windshield. |
| turbo | 5 | MEDIUM | Y | A fan spun by exhaust that shoves extra air into the engine so it makes more power. |
| light | 5 | MEDIUM | N (`igh`) | Lamps that let you see and be seen. |
| engine | 6 | MEDIUM | N (soft g) | The machine that burns fuel to make the car go. |
| mirror | 6 | MEDIUM | partly | Glass that shows you what's behind you. |
| bumper | 6 | MEDIUM | Y | The padded ends of a car, front and back. |
| fender | 6 | MEDIUM | Y | The panel curving over a wheel. |
| piston | 6 | MEDIUM | Y | A plug that slides up and down inside the engine, pushed by burning fuel. |
| airbag | 6 | MEDIUM | Y | A cushion that puffs up in a hurry to protect you. |
| hubcap | 6 | MEDIUM | Y | The cover in the middle of a wheel. |
| filter | 6 | MEDIUM | Y | A screen that catches dirt before it gets inside. |
| gasket | 6 | MEDIUM | Y | A squishy ring that stops a join from leaking. |
| grille | 6 | MEDIUM | N | The face of the car, with holes to let air reach the radiator. |
| clutch | 6 | MEDIUM | partly | The pedal that lets go of the engine so you can change gear. |
| spoiler | 7 | HARD | partly | A wing that uses air to press the car down onto the road. |
| muffler | 7 | HARD | Y | The part that makes the exhaust quiet. |
| gearbox | 7 | HARD | Y | The box of gears between the motor and the wheels. |
| exhaust | 7 | HARD | N | The used-up gases leaving the engine, and the pipe they leave by. |
| battery | 7 | MEDIUM | partly | The box that stores electricity. |
| chassis | 7 | HARD | N (French) | The frame everything else bolts onto. |
| bearing | 7 | HARD | Y | Tiny balls that let something spin smoothly. |
| coolant | 7 | HARD | Y | The liquid that carries heat away from the engine. |
| starter | 7 | MEDIUM | Y | The little motor that gets a gas engine spinning. |
| antenna | 7 | HARD | Y | The rod that catches radio. |
| cylinder | 8 | HARD | N | The tube a piston slides inside. |
| ignition | 8 | HARD | N | The spark that lights the fuel — and the switch that starts everything. |
| seatbelt | 8 | MEDIUM | Y | The strap that holds you in your seat. |
| camshaft | 8 | HARD | Y | The spinning rod that opens and closes the engine's valves at exactly the right moment. |
| radiator | 8 | HARD | N | The part that dumps the engine's heat into the air. |
| odometer | 8 | HARD | N | The counter of how far the car has ever gone. |
| headlight | 9 | HARD | partly | The lamps at the front. |
| dashboard | 9 | HARD | Y | The panel of dials and screens in front of the driver. |
| alternator | 10 | HARD | N | A generator spun by the engine that makes electricity while you drive. |
| windshield | 10 | HARD | partly | The big front window. |
| suspension | 10 | HARD | N | The springs that soak up bumps and keep the tires on the road. |
| driveshaft | 10 | HARD | Y | The spinning rod that carries power back to the wheels. |
| crankshaft | 11 | HARD | Y | The bent rod that turns the pistons' up-and-down into round-and-round. |
| speedometer | 11 | HARD | N | The dial that shows how fast you're going. ⚠ blocklist substring |
| transmission | 12 | HARD | N | The gears that decide how hard and how fast the engine turns the wheels. *(Most EVs don't have one — a single fixed gear is enough, because an electric motor pulls from a standstill.)* |
| differential | 12 | HARD | N | The clever gear that lets the outside wheel turn faster than the inside one in a corner. |

---

## 4. Functions & verbs

| Word | Len | Tier | Decodable? | Child-true definition |
|---|---|---|---|---|
| go | 2 | EASY | Y | Start moving. |
| rev | 3 | EASY | Y | Make the motor spin faster while standing still. |
| tow | 3 | EASY | partly | Pull another vehicle along. |
| fix | 3 | EASY | Y | Make it work again. |
| stop | 4 | EASY | Y | Come to a halt. |
| turn | 4 | EASY | Y | Change which way you're pointed. |
| ride | 4 | EASY | partly | Travel in something. |
| park | 4 | EASY | Y | Stop and leave it there. |
| spin | 4 | EASY | Y | Turn round and round. |
| roll | 4 | EASY | Y | Move along on wheels. |
| slow | 4 | EASY | partly | Go less fast. |
| zoom | 4 | EASY | Y | Go fast, noisily. |
| honk | 4 | EASY | Y | Press the horn. |
| haul | 4 | EASY | partly | Carry something heavy. |
| idle | 4 | MEDIUM | partly (`-le`) | Run gently while standing still. |
| tune | 4 | MEDIUM | partly | Adjust a machine until it runs its best. |
| skid | 4 | EASY | Y | Slide instead of grip. |
| drive | 5 | EASY | partly | Make the car go where you want. |
| steer | 5 | EASY | Y | Point the car with the wheel. |
| shift | 5 | MEDIUM | Y | Change gear. |
| brake | 5 | MEDIUM | partly | Slow down on purpose. |
| coast | 5 | MEDIUM | partly | Roll along without pushing the pedal. |
| drift | 5 | MEDIUM | Y | Slide a car sideways through a corner on purpose. |
| climb | 5 | MEDIUM | partly | Drive up a hill. |
| carry | 5 | MEDIUM | Y | Take things with you. |
| charge | 6 | MEDIUM | partly | Fill a battery with electricity. |
| corner | 6 | MEDIUM | Y | Go round a bend — and the bend itself. |
| signal | 6 | MEDIUM | Y | Blink a light to say which way you'll turn. |
| launch | 6 | MEDIUM | partly | Take off hard from a standstill. |
| refuel | 6 | MEDIUM | Y | Put more fuel in. |
| steady | 6 | MEDIUM | partly | Keep it smooth. |
| reverse | 7 | HARD | partly | Go backwards. |
| overtake | 8 | HARD | Y | Go past a car in front. *(Prefer this to `pass` — see §2.)* |
| recharge | 8 | HARD | Y | Fill the battery up again. |
| accelerate | 10 | HARD | N | Get faster and faster. |
| decelerate | 10 | HARD | N | Get slower and slower. |

---

## 5. Race vocabulary

| Word | Len | Tier | Decodable? | Child-true definition |
|---|---|---|---|---|
| lap | 3 | EASY | Y | One whole trip around the track. |
| pit | 3 | EASY | Y | The spot beside the track where your crew works on the car. |
| win | 3 | EASY | Y | Finish first. |
| fast | 4 | EASY | Y | Moving a lot in a little time. |
| race | 4 | EASY | partly | Everyone going at once to see who's quickest. |
| flag | 4 | EASY | Y | A cloth waved to tell drivers something. |
| grid | 4 | EASY | Y | The pattern of starting spots on the track. |
| pole | 4 | EASY | partly | The best starting spot, won by being fastest in practice. |
| apex | 4 | MEDIUM | Y | The inside point of a corner — the spot a racer aims at. |
| lane | 4 | EASY | partly | One strip of road. |
| crew | 4 | EASY | partly | The team who look after the car. |
| team | 4 | EASY | Y | Everyone working together. |
| grip | 4 | EASY | Y | How well the tires hold the road. |
| slick | 5 | MEDIUM | Y | A smooth racing tire with no grooves, for dry days. |
| track | 5 | EASY | Y | The road the race is run on. |
| start | 5 | EASY | Y | The beginning. |
| timer | 5 | MEDIUM | Y | The clock that counts your lap. |
| rally | 5 | MEDIUM | Y | A race on dirt roads, one car at a time. |
| stage | 5 | MEDIUM | partly | One timed section of a rally. |
| draft | 5 | MEDIUM | Y | Tucking in behind another car where the air is calm, so you go faster for free. |
| podium | 6 | MEDIUM | partly | The platform the top three stand on. |
| helmet | 6 | MEDIUM | Y | The hard hat that protects a driver's head. |
| driver | 6 | MEDIUM | partly | The person steering. |
| finish | 6 | MEDIUM | Y | The end of the race. |
| sprint | 6 | MEDIUM | Y | A short, all-out race. |
| circuit | 7 | HARD | N | A track that loops back to where it started. |
| chicane | 7 | HARD | N (French) | A quick left-right wiggle built into a track to slow cars down. |
| hairpin | 7 | HARD | Y | A corner so tight the road almost folds back on itself. |
| qualify | 7 | HARD | partly | Drive fast in practice to earn a good starting spot. |
| formula | 7 | HARD | partly | A rulebook every car in a series must obey. |
| traction | 8 | HARD | N | The grip between tire and road that lets you go, stop and turn. |
| straight | 8 | HARD | N | The long flat-out part of a track. |
| downforce | 9 | HARD | Y | The push-down that shaped wings make from moving air — it presses the car onto the road. |
| telemetry | 9 | HARD | N | The stream of numbers the car radios back to its team while it drives. |
| stopwatch | 9 | HARD | Y | The clock that measures a lap. |
| checkered | 9 | HARD | N | The black-and-white flag waved when the winner crosses the line. *(UK spelling: chequered.)* |
| slipstream | 10 | HARD | partly | The tunnel of calm air behind a fast car. |
| aerodynamics | 12 | HARD | N | How air moves around a moving thing — and how a shape can use it. |

---

## 6. EV concepts

*Deep detail and citations: [[regenerative-braking]], [[electric-vehicle-history]].*

| Word | Len | Tier | Decodable? | Child-true definition |
|---|---|---|---|---|
| amp | 3 | EASY | Y | How much electricity is flowing right now. |
| volt | 4 | EASY | Y | How hard the electricity is pushing. |
| watt | 4 | EASY | Y | How fast energy is being used. |
| plug | 4 | EASY | Y | The end of the cable you push into the car. |
| cord | 4 | EASY | Y | The cable that carries the electricity. |
| grid | 4 | EASY | Y | All the wires that carry power to everybody's houses. *(Same word as the racing grid — a nice pun to use on purpose.)* |
| cable | 5 | MEDIUM | partly | A thick wire. |
| range | 5 | MEDIUM | partly | How far the car can go before the battery runs out. |
| quiet | 5 | MEDIUM | N | Electric cars make almost no engine noise — you hear tires and wind. |
| solar | 5 | MEDIUM | Y | Power made from sunlight. |
| regen | 5 | MEDIUM | Y | Short for regenerative braking: slowing down puts electricity *back* in. |
| hybrid | 6 | MEDIUM | partly | A car with both a motor and an engine, working together. |
| torque | 6 | MEDIUM | N (`-que`) | Twisting force — how hard something is being turned. |
| charge | 6 | MEDIUM | partly | To fill a battery, or how full it is. |
| outlet | 6 | MEDIUM | Y | The socket in the wall. |
| charger | 7 | MEDIUM | partly | The machine that fills the car's battery. |
| lithium | 7 | HARD | partly | The very light metal inside most car batteries. |
| battery | 7 | MEDIUM | partly | A box that stores electricity and gives it back. |
| electric | 8 | MEDIUM | partly | Run by electricity instead of burning fuel. |
| kilowatt | 8 | HARD | Y | A thousand watts. How fast energy moves. |
| emission | 8 | HARD | N | Stuff that comes out of a tailpipe. An electric car has none. |
| robotaxi | 8 | HARD | Y | A taxi that drives itself, with nobody at the wheel. |
| generator | 9 | HARD | partly | A machine that turns spinning into electricity — a motor running backwards. |
| efficiency | 10 | HARD | N | How much of the energy you put in actually does the job. |
| autonomous | 10 | HARD | N | Able to drive itself. |
| kilowatt-hour | 13 (hyphen) | HARD | Y | How much energy a battery holds. A kilowatt is how *fast*; a kilowatt-hour is how *much*. *(Needs the `-` key: Level 21.)* |
| one-pedal | 9 (hyphen) | HARD | Y | Driving where lifting your foot off the go-pedal is what slows you down. *(Level 21.)* |
| regenerative | 12 | HARD | N | Giving something back. In a car: giving energy back to the battery. |

### The four EV ideas worth teaching properly

1. **Regenerative braking** — the headline. *When an electric car slows down, its motor spins
   backwards and becomes a tiny power plant: the car's "go" turns back into electricity and
   fills the battery again. Normal brakes just make heat, and the heat blows away.* A motor
   and a generator are the same machine pointed in two directions — that is the whole idea,
   and it is genuinely beautiful for a child. DOE/EPA figures: regen recovers about **32% in
   city driving**, 6% on the highway, 22% combined. Full history (Sprague 1886 on railways;
   Krieger's Paris electric cabs in the 1890s; the 1967 AMC Amitron as the first *automatic*
   automotive use) and the correction to the common "Amitron was first" claim:
   [[regenerative-braking]].
2. **One-pedal driving** — regen turned up until lifting off the accelerator slows the car
   firmly. EVs still have a brake pedal; most everyday slowing just doesn't need it, and the
   friction brake pads barely wear out.
3. **kW vs kWh** — a kilowatt is *how fast* energy flows; a kilowatt-hour is *how much*
   energy there is. Bucket and tap. EIA defines the kilowatt-hour as 1,000 watts used for one
   hour.
4. **Charging levels** — Level 1 is an ordinary 120 V household plug (slow; roughly 5 miles
   of range per hour, so overnight is enough for most days). Level 2 is 240 V, like a clothes
   dryer outlet (2.9–19.2 kW). DC fast charging is the roadside kind, up to very high power
   (AFDC cites installations up to 500 kW).

**[unverified]** The popular claim that electric motors deliver "instant torque" from zero
rpm, which is why EVs feel quick off the line, was **not** verified with a citable source in
this pass. It is very likely true and universally repeated; do not put it on a child-facing
card until someone sources it.

### References (EV concepts)

1. [Where the Energy Goes: Electric Cars — fueleconomy.gov (DOE/EPA)](https://www.fueleconomy.gov/feg/atv-ev.shtml) — the motor-generator mechanism; 32%/6%/22% regen recovery; EV drivetrain loses 15–20% vs a gas engine's 64–75%. **[fetched]**
2. [Charging Electric Vehicles at Home — Alternative Fuels Data Center (DOE)](https://afdc.energy.gov/fuels/electricity-charging-home) — Level 1 (120 V, ~5 miles of range per hour) and Level 2 (240 V, 2.9–19.2 kW). *(search result only, not fetched)*
3. [Charging Electric Vehicles in Public — Alternative Fuels Data Center (DOE)](https://afdc.energy.gov/fuels/electricity-charging-public) — DC fast charging, power levels up to 500 kW. *(search result only, not fetched)*
4. [Kilowatthour — U.S. Energy Information Administration glossary](https://www.eia.gov/tools/glossary/index.php?id=Kilowatthour) — 1 kW expended for 1 hour; the energy-vs-power distinction. *(search result only, not fetched)*
5. [Torque — Britannica](https://www.britannica.com/science/torque) — torque as the tendency of a force to rotate the body it is applied to. *(search result only, not fetched)*
6. [Innovative Braking Tech / One-Pedal Driving — GM Financial](https://www.gmfinancial.com/en-us/financial-resources/articles/ev-regenerative-braking.html) — one-pedal driving and reduced brake wear. *(search result only, not fetched)*

---

## 7. Brands — and the honest picture

**Every brand word is a proper noun, which means capitals, which means the Shift key —
Level 24 material** (`.claude/rules/levels/act5.md`), or lowercase in Free Play / Act 7's own
pool. Full verified status, founding facts, and the bankruptcy record:
[[ev-makers-2026]] and [[zoox-robotaxi]].

### What Trevor's four named brands actually are

| Named | What it actually is | Shipping? | Verdict on the framing |
|---|---|---|---|
| **Tesla** | American carmaker, founded **2003 by Martin Eberhard and Marc Tarpenning**; Musk invested $30M in 2004 and became chairman. | **Yes** — ~838k deliveries in H1 2026, >95% Model 3 / Model Y. Lost the global BEV crown to **BYD** for 2025. | Correct. Note it was *not* founded by Musk — a very common slip. |
| **Rivian** | American EV maker: **R1T** pickup, **R1S** SUV, commercial vans; new smaller **R2** since 22 April 2026. Normal, Illinois. | **Yes** — 2026 guidance 62,000–67,000 deliveries. | Correct. |
| **Scout** | A **Volkswagen Group-backed revival of the International Harvester Scout** name. Two models announced: **Traveler** SUV, **Terra** pickup. Plant: Blythewood, South Carolina. | **No** — reservations only. Scout's own site: *"Initial production targeted for 2027, subject to change."* | Half-right. Real, funded, and unveiled — but **nobody has ever bought one**. Don't describe it as a brand you can drive. |
| **Zoox** | **Not a car brand.** An **Amazon-owned robotaxi service**. Its own homepage: *"It's not a car. It's a robotaxi designed around you."* The vehicle has no steering wheel, no pedals, no driver's seat; you cannot buy one. Began charging fares in Las Vegas **10 August 2026** under a temporary NHTSA exemption. | **Operating as a service**, in Las Vegas / SF / Austin / Miami / Atlanta / LA. | **The framing is wrong.** Zoox is not "entering the EV market" the way Rivian or Scout is. It is a fantastic word (`zoox`, 4 letters, typeable at Level 15) and a fantastic *idea* for a child — "a car with nobody driving" — but the sentence next to it must be true. |

### Other brands worth considering

- **Shipping EVs today, and short enough to type:** Ford (4), Kia (3), Audi (4), BMW (3),
  Volvo (5), Lucid (5), Honda (5), Mazda (5), Nissan (6), Toyota (6), Hyundai (7),
  Porsche (7), Polestar (8), Chevrolet (9). *(Named from the general market; individual model
  claims were not separately verified here.)*
- **BYD** — as of 2025, the world's largest seller of all-electric vehicles (~2.26M BEVs vs
  Tesla's 1.64M). Not a US consumer brand.
- **Slate Auto** — Bezos-backed, deliberately bare-bones electric pickup; **not shipping**,
  late-2026 production target, Warsaw, Indiana; 150,000+ reservations.
- **Do NOT teach:** Fisker (Chapter 11, June 2024), Canoo (Chapter 7, January 2025), Nikola,
  Lordstown. And note **Ford discontinued the F-150 Lightning on 15 December 2025** — a
  flagship electric truck that simply stopped existing inside four years. This is exactly the
  volatility risk: a child learning to read does not need a word bank full of dead companies.

### Trademark / endorsement — the honest, non-lawyer picture

**I am not a lawyer and this is not legal advice.** What can be said plainly:

- Using a brand name as a *word* in a word list is descriptive use — it refers to the real
  thing rather than branding the game. That is a very different act from putting a logo, a
  wordmark in the company's typeface, a car's silhouette, or a company's colours on screen.
  Recreating a **logo, trade dress, or a recognizable vehicle design** is the thing that
  attracts complaints; the word "Tesla" typed in Press Start 2P generally is not.
- The specific risk is **implied affiliation or endorsement** — anything that reads as
  "brought to you by" or "official." A history card that says a true, sourced fact
  ("Volvo gave the seat-belt patent away") is very different from a cabinet that looks like a
  sponsorship.
- This game is free and non-commercial, which reduces (but does not erase) exposure.
- Practical recommendation, and it's also the *better design*: **prefer concepts to logos.**
  `battery`, `motor`, `charge`, `regen`, `lap`, `apex`, `downforce` never go out of business,
  never need a trademark conversation, and teach more. If brands do ship, keep the set small,
  keep it factual, and skew toward brands with a century of runway (Ford, Volvo, Porsche)
  over startups that may be gone before Oona finishes Act 3.
- If brand names ship at all, a one-line disclaimer somewhere adult-facing ("brand names are
  the property of their owners; this game is not affiliated with any of them") costs nothing.
  Worth a real lawyer's five minutes before any public release, not mine.

---

## 8. History-card candidates (bonus)

Card rules (`js/history-cards.js`, `CLAUDE.md`): each card's **moment word** must be typeable
with exactly the keys unlocked at its level, and `level` is the EARLIEST level where that
becomes true. Levels below were computed against the unlock table in `.claude/rules/levels.md`.
All six are citation-verified in this pass; proposed card copy is ≤160 characters in the
existing warm kid tone. **Flagged, not written — `js/` is outside this lane.**

| Word | Earliest level | The moment | Wiki page |
|---|---|---|---|
| `flag` | **5** (F,L,A,G) | The first Formula 1 World Championship race — Silverstone, 13 May 1950 | §refs below |
| `volt` | **11** (V) | By 1900 about a third of American cars were electric | [[electric-vehicle-history]] |
| `brake` / `regen` | **12** (B / N) | Regenerative braking: the motor runs backwards and refills the battery | [[regenerative-braking]] |
| `bertha` | **12** (B) | Bertha Benz's 1888 drive — the first road trip, fixed with a hatpin | [[benz-patent-motorwagen]] |
| `seatbelt` / `belt` | **12** (B) | Nils Bohlin, 1959 — and Volvo gave the patent away free | [[three-point-seatbelt]] |
| `record` | **13** (C) | 1899: the first car ever to pass 100 km/h was electric | [[electric-vehicle-history]] |
| `zoox` | **15** (Z,X) | A car with no steering wheel at all, driving itself around Las Vegas | [[zoox-robotaxi]] |

**Proposed card copy (draft, for `js/history-cards.js` — do not paste without Trevor's read):**

- `flag` — "The very first Formula 1 race was at Silverstone on 13 May 1950. Giuseppe Farina
  won it, and a king and queen watched from the grandstand." *(134 chars)*
- `volt` — "In 1900, about one car in three in America was electric. Quiet, clean, easy to
  start — then gasoline took over for a hundred years." *(133)*
- `regen` — "Electric cars slow down by running their motor backwards. Your 'go' turns back
  into electricity and fills the battery up again." *(128)*
- `bertha` — "In 1888 Bertha Benz drove 106 km without telling her husband, fixing the car
  with a hatpin along the way. The world's first road trip." *(137)*
- `seatbelt` — "Nils Bohlin drew the seat belt you wear today in 1959 — and Volvo gave the
  patent away free, so every car in the world could have one." *(136)*
- `record` — "In 1899 a rocket-shaped electric car called Never Satisfied became the first
  car ever to reach 100 km/h. Electric was the fastest thing going." *(147)*

**Also considered, not proposed:** a `tesla` card (Level 8). The *good* version of that card
is about **Nikola Tesla**, the inventor the company is named after — which sidesteps the brand
problem entirely and fits the game's existing people cards. But Nikola Tesla was **not
researched in this pass**, and nothing about him should be written from memory. It needs its
own arcade-historian run before it becomes card text.

### References (history cards)

1. [Ten fascinating facts about the very first F1 race — Formula1.com (official)](https://www.formula1.com/en/latest/article/f1-first-race-1950-silverstone.2f2zI6BmGT9bnK4vX10paZ) — 13 May 1950, Silverstone, Giuseppe Farina winning in an Alfa Romeo 158, **up to 120,000** spectators, King George VI attending (the only time a reigning monarch attended a British motor race). **[fetched]**
2. [Formula 1 marks 75th anniversary with new colourised footage of the first Grand Prix at Silverstone — Formula One World Championship Ltd](https://corp.formula1.com/formula-1-marks-75th-anniversary-with-new-colourised-footage-of-first-grand-prix-at-silverstone/) — corporate corroboration of the 13 May 1950 date and Farina's win. *(search result only, not fetched)*
3. [1950 British Grand Prix — Wikipedia](https://en.wikipedia.org/wiki/1950_British_Grand_Prix) — Alfa Romeo's front-row lockout and podium sweep; the race's dual "Grand Prix d'Europe" title. *(search result only, not fetched)*
4. The `volt`, `regen`, `bertha`, `seatbelt`, `record` and `zoox` cards are each fully cited on their wiki pages: [[electric-vehicle-history]], [[regenerative-braking]], [[benz-patent-motorwagen]], [[three-point-seatbelt]], [[zoox-robotaxi]].

---

## 9. Corrections from citation pass (2026-09-12)

1. **"Zoox is an EV brand entering the market"** *(from the task brief)* — **wrong.** Zoox is
   an Amazon-owned **robotaxi service**, not a consumer car brand; its purpose-built vehicle
   has no steering wheel or pedals and is not for sale. Source: zoox.com itself — "It's not a
   car. It's a robotaxi designed around you." **[fetched]**
2. **"Scout is a brand entering the EV market"** — **true but not yet shipping.** Scout's own
   site says "Initial production targeted for 2027, subject to change," and takes reservations
   only. Any game text implying you can drive one today would be false. **[fetched]**
3. **"The 1967 AMC Amitron was the first car with regenerative braking"** — a widely repeated
   claim (Green Car Reports states it flatly) that **omits 80 years of prior art**: Sprague's
   company introduced regen on electric railways in **1886**, and Krieger's Paris electric cabs
   had it in the **1890s**. The defensible claim is "first *automatic electronic* regen in a
   car." Popularizer-vs-inventor error class.
4. **"Tesla was founded by Elon Musk"** — a common slip nobody in this repo has made yet, but
   worth pinning before it gets written: founded **2003 by Martin Eberhard and Marc
   Tarpenning**; Musk invested in 2004 and became chairman.
5. **"Bertha Benz invented the brake lining"** — needs the right verb. On her 1888 drive the
   brake blocks were covered in leather by a **smith in Bruchsal**, at her instigation; that
   leather covering is regarded as the first brake lining, and Carl Benz adopted brake pads as
   standard afterwards. "She had the idea and made it happen on the roadside" is true; "she
   invented it" alone overstates a verifiable fact.
6. **Crowd size at the first F1 race** — secondary sources say 200,000; **Formula 1's own
   article says "up to 120,000."** Use the official figure.
7. **Benz patent number** — the National Motor Museum page renders it both **37345** and
   **37435** on the same page. **DRP 37435** is the number cited nearly everywhere else, but
   Mercedes-Benz's own history page returned HTTP 403 to an automated fetch, so this pass
   could not confirm it from the primary source. Flagged, not asserted.
8. **Tesla is no longer the world's largest EV seller** — **BYD** took the all-electric crown
   for 2025 (~2.26M vs 1.64M). Any "biggest EV maker" superlative in game text should name
   BYD or be avoided.

---

## 10. Unsourceable / weakly-sourced items

- **"Electric motors make instant torque from zero rpm."** Universally repeated, not sourced
  in this pass. Do not put on a card until verified. *(Marked `[unverified]` in §6.)*
- **Robert Anderson's date.** The DOE history gives no year for his electric carriage; the
  1832/1839 dates circulating online are not supported by the institutional source. Write it
  as "the first half of the 1800s."
- **The "car" / EV market brand list in §7** (Ford, Kia, Hyundai, Lucid, Polestar…) is
  orientation, not citation — only Tesla, Rivian, Scout, Zoox, Slate, BYD and the Ford
  Lightning discontinuation were individually verified.
- **The 2026 shipping status of every brand rots fast.** [[ev-makers-2026]] is dated in its
  own title on purpose. Re-verify before shipping brand names to a child.

### URLs dropped as unverifiable in this pass

- `group.mercedes-benz.com/company/tradition/company-history/1885-1886.html` — **HTTP 403**
  to fetch. Listed on [[benz-patent-motorwagen]] explicitly as unusable; no claim relies on it.
- `ethw.org/Frank_J._Sprague` (IEEE Engineering & Technology History Wiki) — **HTTP 403**.
  Would have been the best institutional source for Sprague; replaced with the Edison Tech
  Center page, which fetched cleanly.
- `insideevs.com/news/787190/...` (Rivian R2 volumes) — **HTTP 402 Payment Required**.
  Replaced with the Electrek article, which fetched cleanly.

---

## 11. Downstream flags (this lane may not edit these files)

1. **`main.go` — `wordgenSubstringExtras`.** The substring layer blocks **`speed`** (via
   `pee`), **`pass`/`passenger`** (via `ass`), **`cockpit`** (via `cock`), **`diesel`** (via
   `die`), **`warm`/`forward`** (via `war`), plus `chassis`, `class`, `assist`, `assembly`,
   `title`, `titanium`, `competition`, `scrap`, `butterfly`. An Act 7 racing act cannot get
   `speed` out of the LLM word generator. **Recommendation: change nothing in the blocklist**
   — the over-blocking is deliberate and the safety invariant is more valuable than the word
   — and instead put the affected words in Act 7's **curated static bank**, which the
   substring layer never touches. Whoever writes the Act 7 spec needs to know this before
   they design around generation. *(Verified by reading `main.go` `isBlocked` /
   `wordgenSubstringExtras` and `js/wordgen.js` line 398 this session.)*
2. **`js/history-cards.js`** — no existing card text is wrong; this is an **addition**
   proposal. Seven candidate cards with draft copy are in §8 above (`flag` L5, `volt` L11,
   `regen`/`brake` L12, `bertha` L12, `seatbelt` L12, `record` L13, `zoox` L15). Each is
   citation-verified on its wiki page. Nothing has been written to `js/`.
3. **Act 7 product spec (`docs/specs/**`, `.claude/rules/levels*`)** — three design points
   this research produced: (a) the never-crash rule (§2 tone flags) — a racing act under the
   One Rule needs the Missile Command treatment, where nothing is ever wrecked; (b) brand
   words are Shift/Level-24-shaped proper nouns, and concepts are the safer and better
   content (§7); (c) `car` isn't typeable until Level 13, which matters for any card, not for
   Act 7's own pool.
4. **No `research/` file outside this lane was edited**, and `research/index.md` was **not**
   hand-edited. It needs regenerating — see the note in the report.

---

*Related: [[regenerative-braking]] · [[electric-vehicle-history]] · [[ev-makers-2026]] ·
[[zoox-robotaxi]] · [[benz-patent-motorwagen]] · [[three-point-seatbelt]] ·
[[decodable-word-lists]] · [[letter-frequency]] · [[out-run]] · [[mario-kart]].*
