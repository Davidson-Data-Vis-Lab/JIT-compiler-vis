/**
 * Force-directed graph renderer.
 * Called by updateVis() in main.js after vis.nodes and vis.links are set.
 * Calls bindTooltips() from tooltip.js after drawing.
 * 
 * @author Ellora Devulapally, Taft Harrell
 */

function drag(simulation) {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

function renderVis() {
    let vis = this;

    // Determine which nodes are visible for this phase
    const visibleNodes = vis.filter === "none"
        ? vis.nodes
        : vis.nodes.filter(n => vis.phaseNodes.has(n.id));

    const types = ["basic"];
    const links = vis.links.map(d => Object.create(d));
    const nodes = visibleNodes.map(d => Object.create(d));

    const width = 1000;
    const height = 800;

    // Clear and rebuild SVG each render
    d3.select("#chart-area").select("svg").remove();

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force('collide', d3.forceCollide(d => 65));

    const svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", width * 1.5)
        .attr("height", height * 1.5)
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    // Per-type markers, as they don't inherit styles.
    svg.append("defs").selectAll("marker")
        .data(types)
        .join("marker")
        .attr("id", d => `arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 38)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", "black")
        .attr("d", 'M0,-5L10,0L0,5');

    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("class", "edge")
        .attr("stroke", "black")
        .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);

    const node = svg.append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(drag(simulation));

    node.append("circle")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("r", 25)
        .attr('fill', d => '#6baed6');

    node.append("text")
        .attr("x", 30 + 4)
        .attr("y", "0.31em")
        .text(d => d.id)
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 3);


    // node.on('dblclick', (e, d) => console.log(nodes[d.index]));

    simulation.on("tick", () => {
        link.attr("d", d => `M${d.source.x},${d.source.y}A0,0 0 0,1 ${d.target.x},${d.target.y}`);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Store selections on vis so tooltip.js can access them
    vis.nodeSelection = node;
    vis.linkSelection = link;

    bindTooltips();  // tooltip.js
}