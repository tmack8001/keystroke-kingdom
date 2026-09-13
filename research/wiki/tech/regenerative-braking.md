---
title: Regenerative Braking
type: concept
tags: [automotive, electric-vehicles, physics, act-7, history-card]
sources: 8
verified: 2026-09-12
---

Regenerative braking is the trick that lets an electric vehicle put energy *back* into its
battery while slowing down: the same electric motor that pushes the wheels is run backwards
as a generator, so the car's motion is converted into electricity instead of being thrown
away as heat in the brake pads. It is far older than electric cars are trendy — Frank J.
Sprague's company introduced it on electric railways in 1886, Louis Antoine Krieger's Paris
electric cabs used it in the 1890s, and the 1967 AMC Amitron concept car was the first
*automobile* to do it automatically with electronics.

## In this game

The single best physics idea in [[automotive-vocabulary]] for a child: a motor and a
generator are the same machine running in two directions. It belongs in the **Act 7 —
Speed / Racing** EV word group (`regen`, 5 letters, MEDIUM; `regenerative`, 12 letters,
HARD — a genuine MAX-WORD-LENGTH-lever word) and is the strongest automotive
**history-card** candidate: the card word `brake` becomes typeable at Level 12 (B unlocks),
`regen` likewise at Level 12 (N unlocks). Pairs naturally with [[electric-vehicle-history]]
and with the one-pedal-driving idea below — "you slow down by *letting go*" is a lovely
thing for a kid who is learning that stopping is not failure (the same register as Level
25's "Backspace isn't failure" note in `.claude/rules/levels/act5.md`).

**The child-true explanation, as landed:** *When an electric car slows down, its motor spins
backwards and turns into a tiny power plant. The car's "go" turns back into electricity and
fills up the battery again. Normal brakes just make heat — this one saves the energy.*

## The facts

- **The physics.** An electric motor and an electric generator are the same device operated
  in opposite directions. In regenerative braking, the traction motor is driven as a
  generator by the vehicle's own momentum; producing that current takes work, which is what
  slows the car, and the current is stored in the battery. In a conventional friction brake
  the same kinetic energy is dumped as heat at the pads and rotors and is gone.
  fueleconomy.gov (US DOE/EPA) states it plainly: "when you apply the brakes, the vehicle's
  inertia turns an electric motor-generator, producing electricity that is then stored in a
  battery."
- **How much it actually recovers.** DOE/EPA's "Where the Energy Goes: Electric Cars"
  figures: regenerative braking recovers about **32% in city driving**, **6% on the
  highway**, **22% combined** — because regen only works when you are slowing down, and
  highway driving barely brakes. Same page: an EV electric drive system loses only 15–20% of
  its energy versus 64–75% lost by a gasoline engine.
- **1886 — Sprague, electric railways.** The Sprague Electric Railway & Motor Company,
  founded by Frank J. Sprague, introduced a constant-speed non-sparking motor *and*
  regenerative braking in 1886. The Edison Tech Center describes it as "a method to
  regenerate — or return — power to the main supply systems of electric-motor-driven
  equipment, such as elevators and trains," later used heavily on mountain grades and in
  elevator banks. Sprague's Richmond (VA) Union Passenger Railway, equipped 1887–88, was the
  first large-scale electric trolley system in the world.
- **1890s — Krieger, road vehicles.** Louis Antoine Krieger's front-wheel-drive conversions
  of horse cabs in Paris had a motor in each front wheel with a second set of parallel
  (bifilar) windings specifically for regenerative braking — the earliest regen on a *road*
  vehicle.
- **1903–1911 — Raworth, trams, and a setback.** Leeds engineer John S. Raworth patented and
  installed automatic regenerative control on English tramways (Devonport, Birmingham, the
  Crystal Palace line). After a serious accident at Rawtenstall, an embargo was placed on the
  practice in 1911; it returned about twenty years later.
- **1967 — the AMC Amitron.** The electric concept car built by American Motors with Gulton
  Industries is routinely called "the first car with regenerative braking." The precise claim
  Wikipedia supports is narrower and better: improvements in electronics "allowed this
  process to be fully automated, starting with 1967's AMC Amitron" — its motor controller
  began charging the battery automatically when the brake pedal was pressed. AMC claimed the
  regen extended range to about 150 miles.
- **One-pedal driving** is regen turned up: lifting off the accelerator engages strong
  regeneration, so the car slows firmly without the brake pedal. EVs still have a brake
  pedal; one-pedal mode just means most everyday slowing happens through the motor. Side
  effect: EV friction brake pads wear far more slowly.

## Corrections captured here

- **"The AMC Amitron was the first vehicle with regenerative braking" is wrong** as commonly
  stated. Green Car Reports' trivia piece asserts the Amitron "was also the very first car to
  use regenerative braking" and mentions no earlier history at all; Sprague (1886, rail) and
  Krieger (1890s, road) both precede it by 70–80 years. The defensible framings are "the
  first car with *fully automatic electronic* regenerative braking" or "the first American
  car to use it." This is the popularizer-vs-inventor error class — attribute the right verb.

## References

1. [Where the Energy Goes: Electric Cars — fueleconomy.gov (US DOE / EPA)](https://www.fueleconomy.gov/feg/atv-ev.shtml) — institutional; the motor-generator explanation and the 32% city / 6% highway / 22% combined recovery figures, plus the 15–20% vs 64–75% drivetrain loss comparison. **[fetched]**
2. [Regenerative braking — Wikipedia](https://en.wikipedia.org/wiki/Regenerative_braking) — Sprague 1886, Krieger's bifilar-wound wheel motors, Raworth/Rawtenstall 1903–1911, and the precise Amitron "fully automated" wording. **[fetched]**
3. [Frank Sprague — Edison Tech Center](https://edisontechcenter.org/frank-sprague/) — Sprague's power-regeneration method for elevators and trains; Richmond 1887–88 as the first large-scale electric trolley line. **[fetched]**
4. [Electric-Car Trivia: When Was Regenerative Braking First Used? — Green Car Reports](https://www.greencarreports.com/news/1089510_electric-car-trivia-when-was-regenerative-braking-first-used) — the source of the over-broad "first car" claim corrected above; fetched specifically to confirm it omits the rail/Krieger history. **[fetched]**
5. [Regenerative braking — Energy Education (University of Calgary)](https://energyeducation.ca/encyclopedia/Regenerative_braking) — .edu-class encyclopedia corroborating the motor-as-generator mechanism. *(search result only, not fetched)*
6. [Innovative Braking Tech Helps EVs Go the Extra Mile / One-Pedal Driving — GM Financial](https://www.gmfinancial.com/en-us/financial-resources/articles/ev-regenerative-braking.html) — manufacturer description of one-pedal driving and Regen on Demand. *(search result only, not fetched)*
7. [What is one-pedal driving — RACV](https://www.racv.com.au/royalauto/transport/electric-vehicles/what-is-one-pedal-driving-explained.html) — motoring-club explainer corroborating that EVs retain a brake pedal and that pad wear drops. *(search result only, not fetched)*
8. [AMC Amitron — Wikipedia](https://en.wikipedia.org/wiki/Amitron) — the 1967 AMC/Gulton concept, its "Energy Regeneration Brake," and the ~150-mile range claim. *(search result only, not fetched)*

## See also

[[electric-vehicle-history]] · [[ev-makers-2026]] · [[automotive-vocabulary]]
