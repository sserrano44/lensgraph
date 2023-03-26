// components/Graph.js
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function buildGraphData(data) {
  const nodes = [];
  const links = [];

  const addNodesLinks = (node, parentId) => {
    nodes.push(node);

    if (parentId) {
      links.push({ source: parentId, target: node.id });
    }

    if (node.children) {
      node.children.forEach((child) => addNodesLinks(child, node.id));
    }
  };

  data.forEach((node) => addNodesLinks(node));

  return { nodes, links };
}

function Graph({ data }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { nodes, links } = buildGraphData(data);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    const svg = d3.select(containerRef.current).append('svg').attr('viewBox', [0, 0, width, height]);

    // Add a zoomable container
    const zoomContainer = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom().on('zoom', (event) => {
      zoomContainer.attr('transform', event.transform);
    });

    // Attach zoom behavior to the SVG
    svg.call(zoom);

    // Add link and node elements to the zoomable container
    const link = zoomContainer
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5);

    const node = zoomContainer
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', '#69b3a2')
      .call(drag(simulation));

      // Add tooltip
      const tooltip = d3
      .select(containerRef.current)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #999')
      .style('border-radius', '4px')
      .style('padding', '4px')
      .style('pointer-events', 'none');

      node
      .on('mouseover', (event, d) => {
        tooltip.style('opacity', 1);
        tooltip.html(`
          <p style="color: black">Handle: ${d.handle}</p>
          <p style="color: black">ID: ${d.name}</p>
          <p style="color: black">Name: ${d.label}</p>
          <p style="color: black">Bio: ${d.bio}</p>
          <p style="color: black">ID: ${d.id}</p>
          `);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY + 10 + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      })
      .on('click', (event, d) => {
        const url = `https://lenster.xyz/u/${d.handle}`;
        window.open(url, '_blank');
      });

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    });

    return () => {
      svg.remove();
      simulation.stop();
    };
  }, [data]);


  const drag = (simulation) => {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
      }}
      className="graph"
    ></div>
  );
}

export default Graph;

