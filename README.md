---

## Repository Structure

```
JIT-compiler-vis/
├── data-processing/
│   └── parseIR.py/     # A python file that reconstructs the edges of an IR based on an input JSON file (used to verify our main.js file which builds a map of all phase-based edges between nodes)
    └── result.json/    # The output of parseIR.py
├── graph-visualizer/       # D3.js visualization of the IR graph (see README inside)
│   ├── index.html
│   ├── main.js             # Data loading, phase logic, view toggle
│   ├── static.js           # Static grid renderer
│   ├── forcedirected.js    # Force-directed renderer
│   ├── buttons.js          # Phase dropdown UI
│   ├── tooltip.js          # Node hover tooltips for the force-directed graph
│   └── style.css
├── meeting-notes/
│   └── agenda.md/  # Agenda for spring semester 2025 - contains all notes from group and individual meetings
├── toy-datasets/
│   └── IR/
│       ├── ir-after-spring-break.json   # Primary dataset 
│       ├── ir5129.json                  # Beta test IR
│       ├── phase_grouper.py             # Beta phase grouper (from when we were trying to understand the IR)
│       └── test_stepthrough.py          # Steps through IR instructions for debugging (from when we were trying to understand the IR)
└── PoC/
    └── poc5129.js          # Proof-of-concept for IR 5129
└── draw_phase_graphs.py/   # Dr. Lim's Python code used to generate static PNGs of nodes and edges created in each phase given an IR (used to verify our visualizer)
```

## Data Files

* [Updated branch](https://github.com/hlim1/JITCIRModeler/tree/code_fix) of the repository with Dr. Lim's IR modeler (**updated JSON file specification in the README**): [https://github.com/hlim1/JITCIRModeler/tree/code_fix](https://github.com/hlim1/JITCIRModeler/tree/code_fix)
    * The changes are summarized [here](https://docs.google.com/document/d/1jwRePJLvh4XAH4irzjmmdnO3b0wv48TX3sCchfUoRec/edit?tab=t.0#heading=h.anls0jw7z3b9)

* Original repository with Dr. Lim's IR modeler (contains the JSON file specification): [https://github.com/hlim1/JITCIRModeler/tree/main](https://github.com/hlim1/JITCIRModeler/tree/main)


* Relevant papers: [Google Drive](https://drive.google.com/drive/folders/12Ie1mGx-F6mFgl4Mr23RGoWGHZ8u4YIx?usp=sharing)