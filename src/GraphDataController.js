import { useSigma } from "@react-sigma/core";
import { useLayoutCirclepack } from "@react-sigma/layout-circlepack";
import { useEffect } from "react";
import { keyBy, omit } from "lodash";

const GraphDataController = ({ dataset, filters, children }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const { positions, assign } = useLayoutCirclepack({
    center: 0,
    hierarchyAttributes: ['cluster'],
    scale: 10
  });

  const calcMinMaxFromSize = (size,min=true) => {
    if(min){
      if(size<30)return 20;
      if(size>80)return 15;
    }else{
      if(size<30)return 40;
      if(size>80)return 30;
    }
  }
  
  /**
   * Feed graphology with the new dataset:
   */
  useEffect(() => {
    if (!graph || !dataset) return;

    const clusters = keyBy(dataset.clusters, "key");
    dataset.nodes.forEach((node) =>
      graph.addNode(node.key, {
        ...node,
        ...omit(clusters[node.cluster], "key"),
        image: node.profile_picture_url,
      }),
    );
    dataset.edges.forEach(([source, target]) => graph.addEdge(source, target, { size: 0 }));

    // Use degrees as node sizes:
    const scores = graph.nodes().map((node) => graph.getNodeAttribute(node, "score"));
    const minDegree = Math.min(...scores);
    const maxDegree = Math.max(...scores);
    const MIN_NODE_SIZE = calcMinMaxFromSize(dataset.nodes.length);
    const MAX_NODE_SIZE = calcMinMaxFromSize(dataset.nodes.length,false);
    graph.forEachNode((node) =>
      graph.setNodeAttribute(
        node,
        "size",
        ((graph.getNodeAttribute(node, "score") - minDegree) / (maxDegree - minDegree)) *
          (MAX_NODE_SIZE - MIN_NODE_SIZE) +
          MIN_NODE_SIZE,
      ),
    );

    assign();
    sigma.getCamera().animatedUnzoom(1.2)
    return () => graph.clear();
  }, [assign, dataset]);

  /**
   * Apply filters to graphology:
   */
  useEffect(() => {
    const { clusters } = filters;
    graph.forEachNode((node, { cluster, tag }) =>
      graph.setNodeAttribute(node, "hidden", !clusters[cluster]),
    );
  }, [graph, filters]);

  return <>{children}</>;
};

export default GraphDataController;
