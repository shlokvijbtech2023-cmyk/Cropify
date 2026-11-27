# Codex Master Build Prompt — Cropify 3D Agricultural Digital Twin & What-If Simulation

**Purpose:** Give Codex a complete product, engineering, scientific and visual brief for extending the existing Cropify application into an interactive 3D agricultural digital twin with meaningful, transparent what-if simulations.

**How to use:** Open the Cropify repository in the Codex workspace. If using PlayCanvas, open the free PlayCanvas Editor project and connect its MCP server to Codex first. Then paste the prompt below into Codex. Codex should inspect the repository and the connected PlayCanvas project before making changes.

---

# MASTER PROMPT — BEGIN

You are the lead 3D web engineer, simulation engineer, frontend architect and technical product designer working on **Cropify**, an existing B.Tech final-year research prototype. Your task is to build a polished, interactive **3D agricultural digital twin and scientifically honest what-if simulation experience** that integrates with the existing Cropify product.

Do not treat this as a generic farming game, a static 3D illustration, or a disconnected demo. It must become a useful visual and analytical layer of Cropify.

## 1. First inspect; do not blindly rebuild

Before writing code:

1. Inspect the entire repository, especially:
   - `README.md` and `AGENTS.md`
   - `package.json`, lockfile, Vite and TanStack Start configuration
   - `src/routes/`
   - `src/components/agri/`
   - `src/lib/agri-data.ts`
   - `src/lib/reasoning-engine.ts`
   - `src/routes/scenarios.tsx`
   - the existing Farm Twin, Reasoning Engine, Disease Doctor, Weather, Knowledge Graph, Validation Lab and History/Logs pages.
2. Identify the current app's routing, design tokens, component conventions, data shapes, state management and build constraints. Preserve them.
3. If PlayCanvas MCP is connected, inspect the open PlayCanvas project, scene hierarchy, assets, scripts and available MCP operations. Use the actual tools exposed by the MCP server. Do not invent tool names or pretend a connection exists.
4. Report a short implementation plan and the current repository/PlayCanvas integration approach before large changes.
5. Keep the existing Cropify app functional. Do not replace the existing application with a new standalone project, rewrite its architecture, or remove working modules.

**Existing frontend facts:** the repository is a React 19 + TanStack Start + Vite + TypeScript application, styled with Tailwind CSS v4 and Radix-based components. It uses Recharts, Leaflet and lucide-react, and is configured for Vercel/Nitro deployment. Follow the actual installed versions in the lockfile. Do not upgrade the stack without a concrete compatibility reason.

## 2. What Cropify is meant to represent

Cropify is a neuro-symbolic agricultural digital twin. Its conceptual decision loop is:

**Farm / sensor / weather / field observations → digital twin state → perception or prediction → agronomic rules and constraints → scenario simulation → explainable decision support.**

The product combines:

- **Sense:** soil and environmental observations, including the planned 7-in-1 Modbus RS485 soil probe (moisture, temperature, pH, EC and N-P-K).
- **See:** crop/leaf observations and disease hypotheses, including early blight, late blight, Septoria and pest/leaf-miner observations where supported.
- **Reason:** explicit agronomic rules, context checks, uncertainty and action constraints.
- **Simulate:** compare a baseline farm state with a proposed intervention or changed weather/management condition.
- **Explain:** show what changed, why it changed, which rules fired, what is uncertain and which actions are blocked.

The 3D farm should make this system understandable at a glance and make simulation changes visible in their correct spatial context.

## 3. Critical scientific and implementation honesty rules

These rules are mandatory. Do not violate them to make the demo look impressive.

1. The current repository contains demo/sample farm and zone data. The `farm` object describes a 2.5-acre demonstration plot and six zones. Treat these values as **sample/demo data unless a source explicitly identifies them as measured and current**.
2. The existing `src/lib/reasoning-engine.ts` contains a deterministic, hand-configured rule-and-probability reweighting engine. Preserve its traceability and expose its real rule outcomes. Do not describe its multipliers as a calibrated Bayesian posterior or validated probability model.
3. The current `src/routes/scenarios.tsx` contains simple illustrative equations for yield, disease risk, water demand and profit. These are not a validated crop-growth or soil-water model. Replace or clearly isolate them as an **illustrative baseline only**. Never present their outputs as scientifically validated predictions.
4. The model catalogue in `src/lib/agri-data.ts` marks disease detection/classification/segmentation, crop suitability, yield regression and LLM explanation as planned. Do not imply these models are deployed or running unless repository inspection proves otherwise.
5. The README describes a 7-in-1 probe, but the frontend code alone does not prove a live sensor ingestion service. Show sensor locations and sample readings as demo/simulated unless a real telemetry feed is configured and verified.
6. The existing knowledge graph is local predefined node/edge data, not proof of a live Neo4j graph. Do not invent a live database connection.
7. Never fabricate field trials, accuracy, yield improvements, water savings, model calibration, live weather, real-time telemetry, pesticide efficacy or empirical outcomes.
8. Show provenance on every important input and output: `Measured`, `Farmer-reported`, `Weather API`, `Research reference`, `Model output`, `Rule-derived`, `Demo data`, `User scenario input`, or `Illustrative estimate`.
9. Show timestamps, units, spatial zone, source and data-quality/freshness state where relevant.
10. Missing, stale, contradictory or implausible data must not silently become a confident recommendation. Use states such as `Known`, `Unknown`, `Stale`, `Conflicting`, `Estimated` and `Simulated`.
11. Do not make autonomous pesticide prescriptions. Never generate chemical names, doses, mixtures, schedules or application instructions as an operational recommendation. Surface disease risk, non-chemical scouting/monitoring actions and the need for local agronomist / label / local regulatory confirmation. Existing unsafe hard-coded spray text must not be promoted into the new simulation UI.
12. The tool is decision support for a research prototype, not a replacement for agronomists or local extension services.

## 4. Product and visual direction

Create a convincing, high-quality agricultural digital twin that feels like a professional agri-tech instrument, not a cartoon game or a generic AI-generated scene.

### Visual target

- A realistic, clean, moderately detailed farm viewed initially from an elevated isometric / three-quarter aerial camera.
- Natural daylight, believable soil and crop materials, realistic scale and restrained colours.
- Distinct crop rows, paths, field boundaries, irrigation lines, water source/pump, sensor stations and zone boundaries.
- Visible soil cutaway option with layered soil profile and roots. It should be possible to switch between surface view and below-ground view.
- Realistic plant geometry: use efficient procedural meshes, instancing, LOD and/or low-poly-but-believable models. Avoid hundreds of unique heavy meshes.
- A visually coherent scene, not a collection of unrelated stock assets.
- Subtle animation only where it communicates something: water moving through irrigation lines, wind response in leaves, rain, or a selected sensor pulse. Respect performance and reduced-motion preferences.
- Use a restrained palette consistent with Cropify: forest/leaf greens, soil browns, muted stone/linen neutrals, water blue and restrained warning colours. Maintain both existing light and dark themes.
- Keep labels, overlays and UI crisp and readable. Do not bake UI text into textures.

### Interaction

- Orbit, pan, zoom and reset camera.
- Select a zone, plant group, sensor, irrigation line or field feature.
- Hover/focus states and clear selected state.
- Zone selection opens a detail panel with current state, crop, growth stage, moisture, relevant readings, observations, risks, provenance and scenario changes.
- Toggle layers: crop health, soil moisture, disease/environmental risk, irrigation, sensor locations, soil profile, nutrient status and weather context.
- Provide a minimap or compact zone navigator if it improves orientation.
- Include accessible controls outside the canvas; do not make 3D the only way to access important information.
- Ensure the app remains usable on laptop-sized screens and degrades gracefully on smaller screens.

## 5. Architecture decision: PlayCanvas + existing Cropify app

The intended workflow is **Codex as the coding agent + PlayCanvas as the 3D scene/editor/engine**, with no paid AI generation service required.

- If PlayCanvas MCP is available, use it to inspect and modify the actual PlayCanvas project. Confirm each operation and verify the result in the editor.
- Do not assume PlayCanvas is already connected. If it is not connected, give the user exact setup instructions and continue with a local implementation that does not depend on a fictional connection.
- The PlayCanvas engine/editor may be used for the 3D scene, while the existing React app owns the product UI, controls, data, simulation orchestration and results.
- Choose the lowest-complexity integration that works with the existing deployment. Options include embedding a hosted PlayCanvas scene in a controlled React component or integrating a PlayCanvas engine runtime in the app. Inspect feasibility first and document trade-offs.
- Do not make the main Cropify experience depend on an externally hosted editor session or private preview URL. Define a repeatable export/build/deployment path.
- Avoid paid assets, paid plugins, paid AI credits, paid APIs and subscriptions. Use procedural geometry, open-source packages and assets with compatible licenses. If an optional service costs money, make it explicitly optional and do not require it.
- If a PlayCanvas export or MCP capability is unavailable in the current account/plan, do not fake it. Explain the limitation and use a free local fallback such as Three.js / React Three Fiber only after checking compatibility with React 19 and the existing project.
- Keep simulation logic independent of the 3D engine. The 3D scene visualizes state; it must not be the source of scientific calculations.

### Separation of concerns

Create clear boundaries:

1. **3D presentation layer:** scene, camera, materials, models, selection, visual overlays and animation.
2. **Farm domain layer:** farm, field, zone, crop, soil, sensor, weather and observation types.
3. **Simulation layer:** deterministic model functions, scenario inputs, model metadata, assumptions and outputs.
4. **Reasoning layer:** existing rules engine and any explicitly new rules, with trace and constraints.
5. **UI layer:** scenario controls, baseline-vs-scenario comparison, charts, alerts and explanation.

Keep the domain and simulation code testable without WebGL or a browser.

## 6. Farm geometry and spatial model

Start from the existing `farm` and `zones` data in `src/lib/agri-data.ts`. Inspect all six zone objects and preserve their IDs and meanings:

- Z1 — Zone A1: healthy example, moisture 58.
- Z2 — Zone A2: healthy example, moisture 55.
- Z3 — Zone B1: disease example, moisture 79, circular brown lesions / early-blight hypothesis.
- Z4 — Zone B2: water-stress example, moisture 31, wilting without lesion evidence.
- Z5 — Zone C1: irrigation / high-moisture example, moisture 71, recently irrigated.
- Z6 — Zone C2: healthy example, moisture 52.

These are existing sample values, not new sensor readings. Retain zone IDs, labels and associations. Do not invent GPS boundaries from the current abstract `x/y/w/h` diagram values. If precise geometry is absent, create a clearly labelled illustrative rectangular plot layout with six zones, and make it editable later using real polygon boundaries.

Farm scene requirements:

- Overall 2.5-acre sample farm boundary, clearly marked as demonstration geometry.
- Six independently selectable zone meshes/polygons, labels A1/A2/B1/B2/C1/C2.
- Crop rows and plant groups per zone. Make crop type/variety configurable; do not assume all six zones necessarily have identical crop varieties unless the data says so.
- Irrigation mainline, sub-lines and drip emitters. If the actual pipe layout is unknown, mark it as illustrative.
- Sensor markers with sensor type, installation depth, zone and data state. The 7-in-1 sensor is a planned/claimed system component; show simulated sensor markers unless actual installation is confirmed.
- Soil profile with at least topsoil and subsoil layers, moisture visualisation and roots. Do not imply the 3D soil geometry is a measured subsurface survey.
- North arrow, scale reference and legend. Clearly label approximate/illustrative scale if dimensions are not surveyed.
- Optional surrounding environment: access path, small water storage/pump infrastructure and field edge. Keep the scene focused on the plot.

## 7. The simulation system: baseline versus scenario

This is the core of the work. The user should be able to ask **“What if I change this condition or management decision?”** and see the effects in the farm twin and in a transparent comparison.

### Core simulation contract

- A scenario always starts from a saved/immutable baseline snapshot `X0`.
- User edits create a separate scenario input `U`.
- Evaluate the baseline and scenario independently using the same model versions and assumptions:
  - `Y0 = F(X0)`
  - `Yscenario = F(X0 + U)`
  - `delta = Yscenario - Y0` for numeric metrics only.
- Do not mutate baseline farm data when sliders move.
- Show absolute values and deltas, units, model/version, assumptions and uncertainty/limitations.
- For categorical states (e.g. disease hypothesis, rule fired/not fired, stress category), compare state transitions and explanations; never subtract class labels.
- Save, duplicate, rename, reset and delete scenarios. Preserve the baseline.
- Support zone-level scenarios and whole-farm scenarios. A change to one zone must not silently alter every zone.
- Allow multiple scenarios to be compared side by side (baseline + at least three saved scenarios).
- Include a deterministic “reset to baseline” and “restore defaults”.
- Show a simulation run timestamp and an explicit `Demo / illustrative / research model` label where appropriate.

### Scenario controls — environmental and weather inputs

Support editable inputs with explicit units and ranges/validation:

- Air temperature (°C), including short heatwave/cold-spell sequences rather than only one scalar.
- Relative humidity (%).
- Rainfall amount (mm) and timing/duration over a selected horizon.
- Forecast probability of rain (%), kept distinct from measured rainfall.
- Leaf wetness duration (hours), clearly identified as measured, estimated or user-entered.
- Wind speed (m/s or km/h, consistently labelled), relevant to evapotranspiration and canopy drying.
- Solar radiation / reference evapotranspiration (ET0) when available; otherwise use a clearly identified proxy or mark the input unavailable.
- Weather horizon and timestep: e.g. next 24 hours, 3 days, 7 days, 14 days. Do not imply a forecast if the user is only entering a hypothetical sequence.

### Scenario controls — soil and root-zone conditions

- Initial soil moisture by zone and, if supported, by soil layer/depth.
- Soil texture / water-holding properties (only if known; otherwise selectable illustrative soil profiles).
- Soil temperature where available.
- Soil pH.
- Electrical conductivity (EC) / salinity.
- N, P and K values with units and measurement method. Do not infer unavailable nutrient values.
- Root-zone depth / effective rooting depth, configurable and linked to crop/stage where a validated parameter set exists.
- Soil infiltration, drainage and field capacity / wilting point only when a sourced parameter set or explicit user assumption exists.
- Soil compaction or drainage constraint as qualitative inputs if no measured value exists.

### Scenario controls — crop and phenology

- Crop species and variety (select only among known/configured options; do not silently use tomato-specific thresholds for all crops).
- Sowing/transplanting date and days after sowing/transplanting (DAS/DAT).
- Growth stage: establishment, vegetative, flowering, fruit set/grain formation, maturity/harvest, with crop-specific stage mapping.
- Plant population / spacing if known.
- Canopy cover or LAI if measured/modelled; otherwise mark estimated.
- Crop coefficient (Kc), rooting depth and stage parameters only from a named source or validated crop parameter set.
- Crop-specific water and nutrient requirement assumptions must be traceable to a source and cultivar/region applicability must be disclosed.

### Scenario controls — management interventions

- Irrigation amount (mm or L/zone), duration and timing (morning/evening); make the conversion between runtime and applied water explicit and dependent on known emitter flow, spacing and zone area. If these are unknown, ask for inputs or use a labelled illustrative rate.
- Irrigation frequency / interval and irrigation method (existing farm says drip; preserve this but allow configuration).
- Skip, reduce, increase or reschedule a zone's next irrigation event.
- Fertiliser N/P/K additions, form and timing, with units and nutrient content. Never invent product composition.
- Nitrogen applied this crop stage versus crop-stage requirement; preserve the current R-063 threshold only as a configurable rule until validated for the crop.
- Canopy management / airflow intervention as a qualitative scenario (e.g. improved airflow), not a fabricated quantified effect.
- Scouting frequency and observation updates.
- Planned spray as a boolean scheduling constraint only; the simulator must not calculate pesticide dosage or issue chemical prescriptions.

## 8. Required “What If?” scenarios and presets

Build a library of one-click, editable scenario templates. Each preset must explain what it changes, which zones it affects, the assumed inputs and what the simulator can/cannot infer.

### A. Water and irrigation scenarios

1. **Drought / missed irrigation:** lower initial root-zone moisture or skip the next irrigation; show zone-specific water deficit, stress direction and recovery trajectory if the model supports it.
2. **Increase drip runtime:** increase runtime in one selected zone; convert to water depth only when flow/area data exists. Show moisture response, drainage/runoff risk and water use.
3. **Reduce irrigation in an already wet zone:** apply to C1 / high-moisture demo zone; compare reduced irrigation versus baseline and show potential saturation reduction without promising disease reduction.
4. **Over-irrigation / waterlogging:** increase irrigation and/or rainfall; show saturation, drainage, runoff and root-zone oxygen stress proxies only if modelled. Clearly label simplified proxies.
5. **Irrigation timing:** compare morning vs evening irrigation. Only calculate changes in evaporation/canopy wetness if a suitable model and inputs are available; otherwise show the assumption and mark qualitative.
6. **Zone-specific precision irrigation:** set different irrigation plans for A1–C2; visualise water demand and avoid treating the whole farm as homogeneous.
7. **Rainfall replaces irrigation:** enter a rainfall event and evaluate whether the next irrigation event should be reconsidered based on root-zone storage, not a fixed rule of thumb.

### B. Weather and climate stress scenarios

8. **Heatwave:** multi-day elevated temperature; show ET0 / water demand and crop heat-stress proxy only when parameterised.
9. **High humidity + recent rain:** increase humidity/rain/leaf-wetness conditions and show disease-conducive environmental window separately from confirmed disease.
10. **Cold and prolonged leaf wetness:** evaluate the existing late-blight rule context and show whether its conditions are satisfied.
11. **Heavy rainfall event:** assess storage, drainage, waterlogging potential and the rain-before-spray constraint.
12. **Drying weather window:** reduce humidity/leaf wetness and show how environmental risk indicators change; do not claim existing infection disappears.

### C. Disease and pest risk scenarios

13. **Early blight conducive window:** use the current R-018 conditions: concentric-brown lesion pattern, humidity >85%, rain in last 48 h, temperature 20–30°C. Show rule activation and classifier-vs-rule fusion only when a classifier vector is actually supplied. Otherwise show rule conditions only.
14. **Late blight cold-wet window:** use current R-041 conditions: temperature <20°C, leaf wetness >10 h and water-soaked lesion margins. Do not generalise this threshold to every crop/pathogen.
15. **Septoria symptom pattern:** use R-033 small-grey-spot evidence and show competing hypothesis handling.
16. **Saturated canopy fungal-risk context:** use R-027 as currently implemented (HIGH soil moisture and humidity >80%) and show the actual rule trace. Preserve the fact that the current code applies its multiplier to fungal classes and healthy class; don't call it a calibrated risk probability.
17. **Healthy leaf / no lesion evidence:** show that a low disease signal does not prove the entire crop is disease-free; show scouting / observation confidence.
18. **Wilting: water stress or disease?** Use the B2 example: low moisture + wilting without lesions should keep water-stress as a competing explanation. Show alternative hypotheses and missing evidence.
19. **Pest scouting pressure:** visualise a qualitative pest observation or user-entered pest count only if supported; do not invent a pest population model.

### D. Nutrient and soil scenarios

20. **Nitrogen below, at and above stage requirement:** compare input levels. Show the existing R-063 veto if applied N exceeds 1.3 × stage requirement, but label the threshold as current prototype rule pending crop-specific validation.
21. **Excess nitrogen + humid weather:** show that excess N and humid canopy conditions co-occur, explain the risk hypothesis, and avoid claiming a quantified yield penalty unless supported by a validated crop model.
22. **pH shift:** compare acidic, near-neutral and alkaline conditions. Show nutrient-availability context only with crop/soil-specific source references; do not use a universal optimum band for all crops.
23. **High EC / salinity:** show a salinity-stress indicator only if a crop-specific response function is available; otherwise present as a qualitative warning and identify missing calibration.
24. **NPK balance:** compare N/P/K input changes with stage requirement and source traceability; do not infer nutrient deficiencies from a single NPK probe reading without measurement quality checks.

### E. Spray and action-safety scenarios

25. **Rain expected before planned spray:** test R-052, current condition is rain probability in next 6 h >60% with a spray planned. Show `BLOCKED` and explain why. No chemical name or dose.
26. **Minimum spray interval:** test R-058, current prototype blocks a planned repeat spray if days since last spray <7. Label this as the current configured rule, not a universal legal/agronomic interval.
27. **Conflicting conditions:** e.g. disease risk high but rain window or minimum interval blocks spray. Show the risk assessment and blocked action separately; do not suppress the disease warning just because an action is blocked.
28. **Missing spray history:** if last application date is unknown, do not assume the interval is satisfied. Mark `UNKNOWN` and require confirmation before evaluating the constraint.

### F. Economic and operational comparison (only when inputs are supplied)

29. Compare water volume/cost, fertiliser cost, labour/energy cost and estimated gross margin only if user-supplied prices, volumes and conversion factors are available.
30. Show a sensitivity range rather than one exact profit number when key prices, yield and model uncertainty are unknown.
31. Never retain the current hard-coded ₹/tonne, ₹/fertiliser, irrigation cost or 2.8 t/acre assumptions as if they were verified farm economics. Make each cost input editable and provenance-labelled.

## 9. Scientific model hierarchy and implementation roadmap

Do not try to build a complete crop-science simulator in one giant frontend component. Use a layered model strategy.

### Stage 1 — transparent interactive MVP (must work first)

- Farm geometry and six selectable zones.
- Demo sensor markers and provenance states.
- Zone-level scenario inputs.
- A simple, documented soil-water bookkeeping model only if its inputs and parameters are explicit. At minimum, implement a transparent water balance with terms such as initial storage, rainfall, irrigation, crop evapotranspiration, runoff and drainage. If field capacity, wilting point, ET0, Kc, soil depth or infiltration are unknown, do not fabricate them; provide explicit demo parameters and label the run illustrative.
- Keep model code pure and unit-tested.
- Show a water balance ledger so the user can inspect where the change came from.
- Implement existing reasoning rules as a separate evaluation step using actual `reasoning-engine.ts` semantics. Do not silently change thresholds.
- Display scenario vs baseline with deltas and rule trace.
- Provide a small, credible set of what-if presets first: drought/missed irrigation, over-irrigation, rain event, humid disease window, high N, rain-before-spray and zone-specific irrigation.

### Stage 2 — scientific model adapter

Design an adapter boundary for integrating a validated crop-water/crop-growth model such as FAO AquaCrop (or another appropriately validated model) later. Do not claim that AquaCrop is integrated merely because the architecture mentions it.

- Verify library availability, licence, runtime compatibility, input requirements and official documentation before adding a dependency.
- Keep any model in a Python service only if the project actually adds and deploys that service; do not pretend a Python package runs inside the browser.
- If a backend is not yet available, keep a typed adapter interface and a clearly named illustrative implementation.
- Capture model version, crop parameter set, soil profile, weather inputs, run configuration and outputs for reproducibility.

Potential outputs when a real model supports them:
- daily soil-water storage by layer/root zone;
- rainfall, irrigation, runoff, drainage, capillary rise if modelled;
- ET0, crop evapotranspiration (ETc), transpiration and soil evaporation;
- water-stress coefficient and crop-stage sensitivity;
- canopy cover / LAI, biomass and phenological stage;
- yield estimate and uncertainty only when the model is configured and calibrated for the relevant crop, cultivar, climate, soil and management.

### Stage 3 — disease and crop growth coupling

Keep distinct:

1. **Observed disease evidence:** photo/lesion data, timestamp, plant/zone and image model status.
2. **Environmental infection-conduciveness:** temperature, humidity, rainfall, leaf wetness, canopy conditions and pathogen-specific model/rule.
3. **Observed severity/progression:** repeat scouting or validated segmentation/field measurements.
4. **Reasoning output:** neural evidence plus explicit symbolic constraints and alternative hypotheses.

Never collapse these into one unsupported “disease probability”. A conducive weather window is not proof of infection; a leaf classifier output is not a field-wide disease prevalence estimate.

If a validated disease model is unavailable, show transparent rule states and qualitative risk bands, not fabricated calibrated probabilities.

### Stage 4 — calibrated crop growth and economics

Only after the required inputs and calibration evidence exist should Cropify present quantitative biomass, LAI, phenology, yield or profit forecasts as model predictions. Until then, label them `illustrative`, `not calibrated` or `not available`.

## 10. Existing reasoning engine integration

Inspect `src/lib/reasoning-engine.ts` and preserve the actual current logic:

- R-018 Early blight weather window: concentric-brown lesions, humidity >85%, rain in last 48h, temperature 20–30°C; early-blight weight ×1.35.
- R-041 Late blight cold-wet window: temperature <20°C, leaf wetness >10h, water-soaked lesion margins; late-blight weight ×1.6.
- R-033 Septoria pattern: small grey-centred spots and no concentric-brown pattern; Septoria weight ×1.4.
- R-027 Saturated canopy fungal risk: soil moisture HIGH and humidity >80%; fungal weights ×1.1 and healthy ×0.85.
- R-052 No spraying before rain: planned spray and rain probability next 6h >60%; block spray.
- R-058 Minimum spray interval: planned spray and last spray <7 days; block repeat spray.
- R-063 Nitrogen upper bound: applied N >1.3 × stage requirement; block additional nitrogen top-dress.

Requirements:

- Display every rule's condition values, pass/fail state, fired state and effect.
- Preserve the current rule IDs and thresholds. Do not silently adjust them.
- If adding rules, give each a unique ID, rationale, source, scope, assumptions, test cases and review status.
- Distinguish `NOT FIRED` from `NOT EVALUABLE` when required inputs are missing. The current engine uses booleans; if you improve its input model, preserve backwards compatibility or migrate all callers deliberately and test thoroughly.
- Keep disease risk and action safety separate. A blocked spray does not mean disease risk is low.
- Do not let an LLM change a rule result, score, safety constraint or action. It may only explain already computed results.
- Ensure that the simulator uses the same scenario input snapshot as the rule engine so the displayed rule trace corresponds to the displayed scenario.
- Do not expose the engine's hand-tuned reweighting as statistically calibrated probability. Label as `rule-adjusted model score` or equivalent.

## 11. User experience: simulation workspace

Create a first-class **3D Digital Twin / Simulation** experience integrated with the existing Cropify navigation. If the current app already has a relevant route, extend it rather than duplicating the feature.

Recommended layout:

- **Main canvas:** interactive 3D farm occupying the main area.
- **Left/top controls:** view/layer selector, farm/zone selector, baseline/scenario selector.
- **Right inspector:** selected zone, current state, provenance, observations and key readings.
- **Scenario drawer/panel:** grouped controls for Weather, Soil, Crop, Irrigation, Nutrients and Disease/Management.
- **Results area:** baseline vs scenario cards, change indicators, water balance, disease-rule trace, crop status, alerts and assumptions.
- **Timeline:** scenario horizon with rainfall/irrigation/management events and modelled state changes. Do not animate time if the model has only a static one-step calculation.

### Essential comparison metrics

Show only what the active model can legitimately calculate. Candidate groups:

**Water:** initial/final soil-water storage, rainfall, irrigation applied, crop ET / ETc if available, drainage, runoff, deficit/surplus, water use by zone.

**Crop:** crop stage, canopy/LAI if measured/modelled, water-stress status, biomass/yield only if a real configured model supports it.

**Disease:** observed symptom evidence, environmental risk window, current rule states, competing hypotheses, blocked actions. Do not show a fake disease probability dial.

**Nutrients:** applied N/P/K, stage requirement, pH/EC, warning/constraint state, provenance.

**Operations/economics:** water volume/cost, input costs, energy/labour and gross margin only with user-entered values and explicit formulas.

### Explainability panel

For every scenario, answer:

- What did the user change?
- Which zones and time window were affected?
- What inputs were used and where did they come from?
- Which model(s) ran and which version?
- What changed relative to baseline?
- Which assumptions dominate the result?
- Which rules fired, did not fire or could not be evaluated?
- What is uncertain or missing?
- What should be monitored or confirmed by a human?

## 12. Scenario data model and reproducibility

Create strongly typed domain models. Suggested conceptual shapes (adapt to repository conventions):

- `FarmState`: farm id, area, crop configuration, zones, soil profiles, sensors, weather context, observations, management history, provenance and timestamp.
- `ZoneState`: zone id, polygon/geometry reference, crop, stage, soil profile, sensor observations, irrigation configuration, disease observations and management history.
- `ScenarioDefinition`: id, name, description, base snapshot id, affected zones, horizon, overrides, createdAt and tags.
- `ModelRun`: run id, scenario id, model id/version, input snapshot/hash, assumptions, startedAt/completedAt, status and warnings.
- `SimulationOutput`: typed metrics with units, values, provenance, uncertainty/interval if justified, and explanatory notes.
- `RuleEvaluation`: rule id, input conditions, state (`FIRED`, `NOT_FIRED`, `NOT_EVALUABLE`), effect, source and rationale.

Persist scenarios using the existing project's supported storage pattern if one exists. If no backend/persistence exists, use local browser storage only for user-created scenarios and label it local to this browser; do not imply cloud synchronisation. Keep demo baseline data read-only.

## 13. Performance and accessibility

- Target smooth interaction on a normal laptop, not just a high-end GPU.
- Use instanced meshes for repeated crops, emitters and similar objects.
- Use LOD and culling; avoid rendering hidden soil layers or distant detail unnecessarily.
- Avoid loading giant GLB assets or unnecessary external libraries.
- Lazy-load the 3D experience so the rest of Cropify still loads quickly.
- Handle WebGL unavailable/context loss with a graceful 2D fallback (existing zone map or a simplified view).
- Provide keyboard-accessible zone selection, visible focus, screen-reader labels for controls, sufficient contrast and reduced-motion behaviour.
- Ensure camera controls do not trap page scrolling or keyboard navigation.
- Add loading, error, empty and unsupported-device states.

## 14. Testing and validation

Write meaningful automated tests for the simulation and reasoning integration.

Minimum tests:

1. Baseline evaluation is deterministic for identical inputs and model versions.
2. Scenario edits do not mutate baseline state.
3. Changing one zone does not affect unrelated zones unless a shared field-level variable explicitly applies.
4. Water-balance terms reconcile within defined numerical tolerance.
5. Rainfall and irrigation are not double-counted.
6. Units are consistent (mm, L, m³, %, °C, hours, kg/acre etc.).
7. Invalid and missing inputs produce validation warnings / `NOT_EVALUABLE`, not confident output.
8. R-018 fires only when all current conditions are met.
9. R-041 fires only when all current conditions are met.
10. R-033, R-027, R-052, R-058 and R-063 preserve their current conditions and effects.
11. A blocked spray is still shown as blocked when disease risk is high.
12. Unknown spray history does not pass the minimum interval check.
13. Disease environmental conduciveness is not reported as confirmed infection.
14. Demo values are clearly labelled as demo.
15. Saved scenarios reproduce the same outputs with the same inputs/model version.
16. 3D scene failure does not break the rest of the app.
17. Existing routes and existing tests/build continue to work.

Add a short model card / methodology note for each simulation model with purpose, equations/logic, units, parameter sources, calibration status, limitations and intended use. Do not claim scientific validation based only on passing software tests.

## 15. Implementation sequence — work in phases

Do not attempt the entire roadmap in one unreviewable code dump. Implement in small, working increments and verify each.

### Phase 0 — audit and plan

- Inspect app and PlayCanvas project.
- Identify integration route and dependency compatibility.
- Document missing data and scientific assumptions.
- Provide file-level plan.

### Phase 1 — 3D farm foundation

- Create the plot boundary and six zones.
- Add crop rows, selectable zone meshes, paths, irrigation lines and sensor markers.
- Add camera controls and a restrained professional scene.
- Connect selection to the existing zone data.
- Add WebGL fallback.
- Verify local app build and 3D interaction.

### Phase 2 — soil profile and overlays

- Add soil cutaway, roots and soil-layer visualisation.
- Add moisture, sensor and disease/environmental overlays.
- Bind overlays to the existing zone demo values with demo/provenance labels.
- Add layer toggles and a zone inspector.

### Phase 3 — scenario engine foundation

- Introduce immutable baseline snapshots and scenario overrides.
- Replace the existing simplistic one-off slider equations with a modular, transparent simulation interface.
- Implement and test the water-balance MVP with explicit assumptions.
- Add scenario save/compare and first presets.

### Phase 4 — reasoning integration

- Run the existing rule engine against scenario-specific inputs.
- Show the exact rule trace and blocked actions.
- Preserve the separation of disease evidence, environmental risk and action constraints.

### Phase 5 — timeline and advanced presets

- Add multi-day weather/irrigation event sequences.
- Add heatwave, drought, heavy rain, humid disease window, nutrient and action-safety scenarios.
- Add side-by-side scenario comparisons and exportable results if the existing app supports it.

### Phase 6 — future scientific model integration

- Only after verifying sources, package compatibility, model parameters and calibration requirements, add a scientific crop-water/crop-growth model adapter.
- Add model cards and validation evidence.
- Do not mark a future stage complete merely because a placeholder interface exists.

At the end of each phase:

- Run lint, typecheck if available, unit tests and production build.
- Fix errors introduced by your changes.
- Summarise files changed, features completed, tests run and known limitations.
- Do not proceed to a larger phase if the current one is broken.

## 16. Definition of done for the first usable delivery

The first delivery is complete only when:

- The Cropify app still runs and builds.
- A user can open the 3D twin route and see the six-zone farm.
- Each zone can be selected and displays the existing zone data with clear demo provenance.
- Users can toggle at least moisture, irrigation and disease/environmental context overlays.
- Users can select a zone, change a few scenario inputs and compare the scenario with an immutable baseline.
- At least these presets work: missed irrigation/drought, increase irrigation, over-irrigation/heavy rain, high humidity + recent rain, nitrogen above stage threshold, rain-before-spray and minimum spray interval.
- The water balance is inspectable and explicitly labelled illustrative if not scientifically calibrated.
- The reasoning engine trace reflects the same scenario inputs displayed in the UI.
- Rule blocks are visible and are not overridden by the UI or an LLM.
- No fake live telemetry, fake AI model, fabricated yield improvement or pesticide dose is displayed.
- The 3D scene has a graceful fallback and does not break other routes.
- Tests and production build pass.

## 17. How to work with me

- Be proactive but do not invent facts or APIs.
- Make sensible engineering decisions and explain important trade-offs briefly.
- Ask me only when a decision truly blocks implementation (e.g. actual crop species/variety, sensor installation geometry, irrigation flow rate, field polygon or crop-specific scientific parameter set). Otherwise proceed with labelled demo assumptions.
- Never ask me to buy a paid service or asset to complete the free MVP.
- Do not stop after generating a plan or a static screenshot. Build a functioning scene and working controls.
- Do not change unrelated branding or redesign unrelated Cropify pages.
- Keep code modular, readable, typed and documented.
- Do not mark a feature complete if it is only a placeholder.

**Start now with Phase 0: inspect the repository and the connected PlayCanvas project (if available), report the integration plan, then implement Phase 1.**

# MASTER PROMPT — END

---

## Notes for the project owner

- This prompt is deliberately strict about scientific claims. Cropify's current scenario page uses illustrative equations; it should not be presented as a validated crop model.
- The current six zones, sample farm values and seven rule definitions are taken from the supplied Cropify repository. The prompt instructs Codex to preserve their semantics and label sample data appropriately.
- A 3D scene can visualise simulation outputs, but it does not make the underlying model scientifically valid. Water balance, crop growth, disease risk and yield need their own sourced parameters, calibration and validation.
- The first goal is a usable 3D farm + zone selection + transparent what-if engine. A validated scientific crop model is a later integration, not a visual shortcut.
