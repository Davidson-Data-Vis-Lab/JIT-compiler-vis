# Graph Visualizer

A D3.js tool for visualizing a JIT compiler's intermediate representation (IR) graph across optimization phases. This visualizer allows you to step through phases, switch between a static or force directed visualization type, and hover over nodes to see key information about them at each phase. 
1. Use the **phase dropdown** to select an optimization phase and click **Update Visualization**.
2. Use the **Switch View** button to toggle between Static and Force-Directed layouts.
3. **Hover** over any node to see its details (ID, opcode, alive status, creation/kill phase, optimization phases) and highlight its connected edges.

## Running the Visualizer

You can view the visualizer at https://davidson-data-vis-lab.github.io/JIT-compiler-vis/graph-visualizer/

Or use the VS Code Live Server extension and open `index.html`.


## File Overview
**`main.js`:** Loads data, computes phase/edge data structures, builds `vis.circles` and the link formats for each of the visualizations, and dispatches rendering to the proper vis files based on selected 
**`static.js`:** Renders a fixed grid layout, where dead nodes are shwon at a lower opacity. The code uses coordinate matching for the edge highlight and tooltip functions. These functions are internal to this vis while force directed outsources to different files (seen below).
**`forcedirected.js`:** Renders a physics-based force-directed layout where only alive nodes are shown and the user can drag to reorient the nodes.
**`buttons.js`:** Populates the phase dropdown menu and the Update button allowing the user to switch between phases. 
**`tooltip.js`:** Hover tooltip and edge highlighting specifically for the force-directed node graph.
**`style.css`:** Layout and styling. 


## Data Format

The visualizer expects an IR JSON file following the schema in the [JITCIRModeler spec](https://github.com/hlim1/JITCIRModeler/tree/main) (see the updated version on the [`code_fix` branch](https://github.com/hlim1/JITCIRModeler/tree/code_fix)).

To switch to a different IR file, update the path in `loadData()` in `main.js`:
```js
IR_data = await d3.json("../toy-datasets/IR/your-file.json");
```