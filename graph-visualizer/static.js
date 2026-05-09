/**
 * Static graph renderer.
 * This is the original renderVis() from the old main.js, extracted here
 * and renamed renderStaticVis() so main.js can toggle between this and
 * the force-directed renderer
 *
 * Depends on (set by main.js):
 *   vis.svg        – persistent SVG element
 *   vis.nodes      – all nodes
 *   vis.circles    – fixed grid positions, indexed by node array index
 *   vis.links      – [{ source: {x,y}, target: {x,y} }] (coordinate objects)
 *   vis.linkPath   – d3.linkHorizontal generator
 *   vis.phaseNodes – Set of alive node IDs for the current phase
 *   vis.filter     – current phase ID (or "none")
 *
 * @author Ellora Devulapally, Taft Harrell
 */


//TODO: comment these functions 
function getPhasesForInstType(node, type) {
    const phases = new Set();
    for (const rec of Object.values(node.instAccess || {})) {
        if (rec.type === type) phases.add(Number(rec.phaseFnId));
    }
    return Array.from(phases).sort((a, b) => a - b);
}

function getFirstPhaseForInstType(node, type) {
    const phases = getPhasesForInstType(node, type);
    return phases.length ? phases[0] : null;
}

function renderStaticVis() {
    let vis = this;

    const radius = 35;

    // Ensure vis.svg exists (created once in initVis equivalent).
    // If the force-directed view destroyed it, recreate it.
    if (d3.select("#chart-area").select("svg").empty()) {
        vis.svg = d3.select("#chart-area")
            .append("svg")
            .attr("width", 750)
            .attr("height", 1000);
    } else {
        // Re-select in case it was replaced
        vis.svg = d3.select("#chart-area").select("svg");
        vis.svg.attr("width", 750).attr("height", 1000).attr("viewBox", null);
    }

    // Remove visual elements, keep defs slot clean
    vis.svg.selectAll("circle").remove();
    vis.svg.selectAll("text").remove();
    vis.svg.selectAll("path").remove();
    vis.svg.selectAll("polygon").remove();
    vis.svg.select("defs").remove();

    // Arrow marker
    vis.svg.append("defs")
        .append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 5)
        .attr("refY", 0)
        .attr("markerWidth", 2.5)
        .attr("markerHeight", 2.5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#ff0000");

    // Draw circles — all nodes, opacity reflects alive status
    vis.svg.selectAll("circle")
        .data(vis.nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("cx", (d, i) => vis.circles[i].x)
        .attr("cy", (d, i) => vis.circles[i].y)
        .attr("r", radius)
        .attr("fill", "#ADD8E6")
        .attr("opacity", d => {
            if (!vis.phaseNodes) return 1;
            return vis.phaseNodes.has(d.id) ? 1 : 0.1;
        });

    // Node ID labels
    vis.svg.selectAll("text")
        .data(vis.nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d, i) => d.id < 10 ? vis.circles[i].x - 5 : vis.circles[i].x - 7)
        .attr("y", (d, i) => vis.circles[i].y - 10)
        .attr("fill", "black")
        .style("font-size", "20px")
        .text(d => d.id);

    // Draw edges — vis.links already has { source: {x,y}, target: {x,y} }
    const edgeSelection = vis.svg.selectAll("path.edge")
        .data(vis.links)
        .enter()
        .append("path")
        .attr("class", "edge")
        .attr("d", vis.linkPath)
        .attr("fill", "none")
        .attr("stroke", "#000000")
        .attr("stroke-width", 0.5)
        .attr("marker-end", "url(#arrow)");

    const CREATE = 7;
    const KILL = 3;
    const OPT_TYPES = new Set([0, 1, 2, 4, 6]);

    const nodes = vis.svg.selectAll(".node");
    const edges = vis.svg.selectAll(".edge");

    nodes.on('mouseover', (event, d) => {
        const alive_status =
            vis.phaseNodes ? (vis.phaseNodes.has(d.id) ? "True" : "False") : "True";

        const creationPhase = getFirstPhaseForInstType(d, CREATE) ?? "N/A";
        const killPhase = getFirstPhaseForInstType(d, KILL) ?? "N/A";

        const optimizedPhases = new Set();
        for (const rec of Object.values(d.instAccess || {})) {
            if (OPT_TYPES.has(rec.type)) optimizedPhases.add(Number(rec.phaseFnId));
        }
        const optimizedPhasesStr = optimizedPhases.size
            ? Array.from(optimizedPhases).sort((a, b) => a - b).join(", ")
            : "None";

        // Edge highlighting: compare coordinates (original approach)
        const nodeXPosition = vis.circles[d.id].x;
        const nodeYPosition = vis.circles[d.id].y;

        vis.iterableEdges = edges._groups[0];
        vis.iterableEdges.forEach(edge => {
            edge.setAttribute("stroke-width", 0);
            const src = edge.__data__["source"];
            const tgt = edge.__data__["target"];
            if ((src.x === nodeXPosition && src.y === nodeYPosition) ||
                (tgt.x === nodeXPosition && tgt.y === nodeYPosition)) {
                edge.setAttribute("stroke-width", 2.5);
            }
        });

        d3.select('#tooltip-box')
            .style('display', 'block')
            .style('left', event.pageX + 'px')
            .style('top', event.pageY + 'px')
            .html(`
                <ul>
                  <li><strong>Node ID:</strong> ${d.id}</li>
                  <li><strong>Opcode:</strong> ${d.opcode}: ${d.mnemonic}</li>
                  <li><strong>Alive?:</strong> ${alive_status}</li>
                  <li><strong>Size:</strong> ${d.size} bytes</li>
                  <li><strong>Created in Phase:</strong> ${creationPhase}</li>
                  <li><strong>Modified in Phase(s):</strong> ${optimizedPhasesStr}</li>
                  <li><strong>Killed in Phase:</strong> ${killPhase}</li>
                </ul>
            `);
    })
    .on('mouseleave', () => {
        if (vis.iterableEdges) {
            vis.iterableEdges.forEach(edge => edge.setAttribute("stroke-width", 0.5));
        }
        d3.select('#tooltip-box').style('display', 'none');
    });
}