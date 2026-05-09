---

## Repository Structure

```
JIT-compiler-vis/
├── graph-visualizer/       # D3.js visualization of the IR graph (see README inside)
│   ├── index.html
│   ├── main.js             # Data loading, phase logic, view toggle
│   ├── static.js           # Static grid renderer
│   ├── forcedirected.js    # Force-directed renderer
│   ├── buttons.js          # Phase dropdown UI
│   ├── tooltip.js          # Node hover tooltips (force-directed mode)
│   └── style.css
├── toy-datasets/
│   └── IR/
│       ├── ir-after-spring-break.json   # Primary dataset (updated post-spring-break)
│       ├── ir5129.json                  # Additional test IR
│       ├── phase_grouper.py             # Groups phases from raw IR data
│       └── test_stepthrough.py          # Steps through IR instructions for debugging
└── PoC/
    └── poc5129.js          # Proof-of-concept for IR 5129
```

## Getting Started

1. Clone the repository and open `graph-visualizer/index.html` in a browser **via a local server** (e.g. `python3 -m http.server` or the VS Code Live Server extension). Opening the HTML file directly will fail due to the `d3.json()` data fetch.
2. The visualizer loads `toy-datasets/IR/ir-after-spring-break.json` by default. To use a different IR file, update the path in `loadData()` in `main.js`.
3. See `graph-visualizer/README.md` for a full explanation of the codebase.

## Data Files

The IR JSON files follow the schema defined in [Dr. Lim's JITCIRModeler spec](https://github.com/hlim1/JITCIRModeler/tree/main). We made several updates to the schema after spring break — the diff is documented [here](https://docs.google.com/document/d/1jwRePJLvh4XAH4irzjmmdnO3b0wv48TX3sCchfUoRec/edit?tab=t.0#heading=h.anls0jw7z3b9).

The Python scripts in `toy-datasets/IR/` were written early on to explore the data:
- **`phase_grouper.py`** — groups IR instructions by optimization phase
- **`test_stepthrough.py`** — steps through instructions chronologically, useful for debugging edge/node state at any point in optimization