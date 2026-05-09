# Graph Visualizer

A D3.js tool for visualizing a JIT compiler's intermediate representation (IR) graph across optimization phases. This visualizer allows you to step through phases, switch between a static or force directed visualization type, and hover over nodes to see key information about them at each phase. 
1. Use the **phase dropdown** to select an optimization phase and click **Update Visualization**.
2. Use the **Switch View** button to toggle between Static and Force-Directed layouts.
3. **Hover** over any node to see its details (ID, opcode, alive status, creation/kill phase, optimization phases) and highlight its connected edges.

## Running the Visualizer

You can view the visualizer at https://davidson-data-vis-lab.github.io/JIT-compiler-vis/graph-visualizer/

Or use the VS Code Live Server extension and open `index.html`.


## File Overview
**`main.js`**: Loads data, computes phase/edge data structures, builds `vis.circles` and the link formats for each of the visualizations, and dispatches rendering to the proper vis files based on selected 
| `static.js` | Renders a fixed grid layout. All nodes always rendered; dead nodes shown at low opacity. Tooltip and edge highlight use coordinate matching. |
| `forcedirected.js` | Renders a physics-based force-directed layout. Only alive nodes shown. Drag to reposition nodes. |
| `buttons.js` | Populates the phase dropdown and wires up the Update button. |
| `tooltip.js` | Hover tooltip and edge highlighting for force-directed mode. |
| `style.css` | Layout and styling. |

## Architecture

All state lives on the global `vis` object (`window`). The main data structures built during `initVis()` are:

**`vis.nodes`** — array of all nodes from the JSON file.

**`vis.nodeEdges`** — `Map<nodeId, Map<phaseId, edgeList>>`. For every node, stores what its outgoing edges looked like at every phase of optimization, accounting for add/remove/replace instructions.

**`vis.activeNodesByPhase`** — `Map<phaseId, Set<nodeId>>`. Tracks which nodes are alive (created but not yet killed) at each phase.

**`vis.circles`** — fixed grid positions for every node, indexed by node array position. Used exclusively by the static renderer.

When the user selects a phase, `updateVis()` filters to alive nodes and their current edges, then builds two link formats:
- **`vis.links`** — `{ source: {x, y}, target: {x, y} }` — coordinate objects consumed by the static renderer
- **`vis.fdLinks`** — `{ source: nodeId, target: nodeId, type }` — ID references consumed by the force-directed renderer

`renderVis()` then calls either `renderStaticVis()` or `renderForceDirectedVis()` depending on the current view toggle.

## Data Format

The visualizer expects an IR JSON file following the schema in the [JITCIRModeler spec](https://github.com/hlim1/JITCIRModeler/tree/main) (see the updated version on the [`code_fix` branch](https://github.com/hlim1/JITCIRModeler/tree/code_fix)). Key fields used:

- `nodes[].id` — unique node identifier
- `nodes[].initialEdges` — outgoing edges at creation time
- `nodes[].instAccess` — map of instruction ID → `{ phaseFnId, type }` where type `7` = CREATE, `3` = KILL, and `0/1/2/4/6` = optimization
- `nodes[].added`, `nodes[].removed`, `nodes[].replaced` — edge modification instructions per optimization step
- `fnId2Name` — map of phase function IDs to names; entries containing `"Phase::Run"` are the optimization phases

To switch to a different IR file, update the path in `loadData()` in `main.js`:
```js
IR_data = await d3.json("../toy-datasets/IR/your-file.json");
```