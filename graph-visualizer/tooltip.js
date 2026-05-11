/**
 * Tooltip and edge highlight on node hover.
 * Called from renderVis() in forcedirected.js after every render,
 * so handlers are always bound to fresh nodes.
 * 
 * @author Ellora Devulapally, Taft Harrell
 */

//TODO: Need to add comments for these two functions below
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

/**
 * Tooltip logic for displaying information about a node.
 */
function bindTooltips() {
    let vis = this;

    //Types are specified in Dr. Lim's JSON specification file
    const CREATE = 7;
    const KILL = 3;
    const OPT_TYPES = new Set([0, 1, 2, 4, 6]);

    vis.nodeSelection
        .on('mouseover', (event, d) => {
            const alive_status = vis.phaseNodes.has(d.id) ? "True" : "False";

            const creationPhase = getFirstPhaseForInstType(d, CREATE) ?? "N/A";
            const killPhase = getFirstPhaseForInstType(d, KILL) ?? "N/A";

            const optimizedPhases = new Set();
            for (const rec of Object.values(d.instAccess || {})) {
                if (OPT_TYPES.has(rec.type)) optimizedPhases.add(Number(rec.phaseFnId));
            }
            const optimizedPhasesStr =
                optimizedPhases.size ? Array.from(optimizedPhases).sort((a, b) => a - b).join(", ") : "None";

            // Highlight only edges connected to this node, hide all others
            vis.linkSelection
                .attr("stroke-width", edgeD => {
                    const srcId = typeof edgeD.source === "object" ? edgeD.source.id : edgeD.source;
                    const tgtId = typeof edgeD.target === "object" ? edgeD.target.id : edgeD.target;
                    return (srcId === d.id || tgtId === d.id) ? 1.5 : 0;
                });

            //Display node information here
            d3.select('#tooltip-box')
                .style('display', 'block')
                .style('left', (event.pageX) + 'px')
                .style('top', (event.pageY) + 'px')
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
        //Hide tooltip and change boldness of edges
        .on('mouseleave', () => {
            vis.linkSelection.attr("stroke-width", 1.5);
            d3.select('#tooltip-box').style('display', 'none');
        });
    vis.nodeSelection
        .on('mouseover touchstart', (event, d) => {
            const alive_status = vis.phaseNodes.has(d.id) ? "True" : "False";

            const creationPhase = getFirstPhaseForInstType(d, CREATE) ?? "N/A";
            const killPhase = getFirstPhaseForInstType(d, KILL) ?? "N/A";

            const optimizedPhases = new Set();
            for (const rec of Object.values(d.instAccess || {})) {
                if (OPT_TYPES.has(rec.type)) optimizedPhases.add(Number(rec.phaseFnId));
            }
            const optimizedPhasesStr =
                optimizedPhases.size ? Array.from(optimizedPhases).sort((a, b) => a - b).join(", ") : "None";

            // Highlight only edges connected to this node, hide all others
            vis.linkSelection
                .attr("stroke-width", edgeD => {
                    const srcId = typeof edgeD.source === "object" ? edgeD.source.id : edgeD.source;
                    const tgtId = typeof edgeD.target === "object" ? edgeD.target.id : edgeD.target;
                    return (srcId === d.id || tgtId === d.id) ? 1.5 : 0;
                });

            //Display node information here
            d3.select('#tooltip-box')
                .style('display', 'block')
                .style('left', (event.pageX) + 'px')
                .style('top', (event.pageY) + 'px')
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
        .on('mouseleave touchend', () => {
            vis.linkSelection.attr("stroke-width", 1.5);
            d3.select('#tooltip-box').style('display', 'none');
        });
        
}