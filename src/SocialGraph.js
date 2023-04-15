import React, { useEffect, useState } from "react";
import { SigmaContainer, ZoomControl, FullScreenControl } from "@react-sigma/core";
import { omit, mapValues, keyBy, constant } from "lodash";

import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";

import GraphSettingsController from "./GraphSettingsController";
import GraphEventsController from "./GraphEventsController";
import GraphDataController from "./GraphDataController";

import ClustersPanel from "./ClustersPanel";
import SearchField from "./SearchField";
import drawLabel from "./canvas-utils";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faCompress, faTimes, faColumns } from "@fortawesome/free-solid-svg-icons";

const SocialGraph = ({ lensProfile, connections }) => {
  const [showContents, setShowContents] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [dataset, setDataset] = useState(null);
  const [filtersState, setFiltersState] = useState({
    clusters: {},
  });
  const [hoveredNode, setHoveredNode] = useState(null);
  const getConnectionTypeCluster = (type) => {
    switch (type){
        case "mutual_follow": return '1';
        case "follower": return '2';
        case "following": 
        default: return '3';
    }
  }

  const buildStatsString = (stats) =>{
    let s = stats ? `${stats.totalFollowers} followers | ${stats.totalFollowing} following` : ''
    return s
  }

  const buildPictureURL = (picture) => {
    let url = '';
    if (picture && picture.original && picture.original.url) {
      if (picture.original.url.startsWith('ipfs://')) {
        let hash = picture.original.url.substring(7, picture.original.url.length)
        url = `https://lens.infura-ipfs.io/ipfs/${hash}`
      } else {
        url = picture.original.url
      }
    }
    return url;
  }

  const transformResponseToGraphData = (response) => {
    let nodes = []
    let edges = []
    const clusters = [
      { key: "0", color: "#6c3e81", clusterLabel: "Lens Profile" },
      { key: "1", color: "#432cff", clusterLabel: "Mutual Follow" },
      { key: "2", color: "#579f5f", clusterLabel: "Follower" },
      { key: "3", color: "#d043c4", clusterLabel: "Following" }
    ];
    
    // add self node
    nodes.push({
      "key": lensProfile.id,
      "label": lensProfile.name,
      "statsLabel": buildStatsString(lensProfile.stats),
      "URL": `https://lenster.xyz/u/${lensProfile.handle.substring(0,lensProfile.handle.length -5)}`,
      "cluster": "0",
      "profile_picture_url": buildPictureURL(lensProfile.picture),
      "x": 0,
      "y": 0,
      "score": 30
    })

    // add connection nodes & edges
    response.map((connection,i) =>{
      nodes.push({
        key: connection.id,
        label: connection.name,
        statsLabel: buildStatsString(connection.stats),
        URL: `https://lenster.xyz/u/${connection.handle.substring(0,connection.handle.length -5)}`,
        cluster: getConnectionTypeCluster(connection.connection_type),
        profile_picture_url: buildPictureURL(connection.picture),
        x: 0,
        y: 0,
        score: 31
      })
      edges.push([lensProfile.id,connection.id])
    } )
    
    return {
        "nodes": nodes,
        "edges": edges,
        "clusters": clusters
    }
  }

  // Load connections data on mount:
  useEffect(() => {
    const transformedData = transformResponseToGraphData(connections)
    setDataset(transformedData);
    setFiltersState({
      clusters: mapValues(keyBy(transformedData.clusters, "key"), constant(true)),
    });
    requestAnimationFrame(() => setDataReady(true));
  }, []);

  if (!dataset) return null;

  return (
    <div id="app-root" className={(showContents ? "show-contents" : "")}>
      <SigmaContainer
        style={{ height: '500px' }}
        graphOptions={{ type: "directed" }}
        settings={{
          nodeProgramClasses: { image: getNodeProgramImage() },
          labelRenderer: drawLabel,
          defaultNodeType: "image",
          defaultEdgeType: "arrow",
          labelDensity: 0.07,
          labelGridCellSize: 60,
          labelRenderedSizeThreshold: 15,
          labelFont: "Lato, sans-serif",
          zIndex: true,
        }}
        className="react-sigma"
      >
        <GraphSettingsController hoveredNode={hoveredNode} />
        <GraphEventsController setHoveredNode={setHoveredNode} />
        <GraphDataController dataset={dataset} filters={filtersState} />

        {dataReady && (
          <>
            <div className="controls">
              <div className="ico">
                <button
                  type="button"
                  className="show-contents"
                  onClick={() => setShowContents(true)}
                  title="Show caption and description"
                >
                  <FontAwesomeIcon icon={faColumns} />
                </button>
              </div>
              <FullScreenControl
                className="ico"
                customEnterFullScreen={<FontAwesomeIcon icon={faExpand} />}
                customExitFullScreen={<FontAwesomeIcon icon={faCompress} />}
              />
              <ZoomControl
                className="ico"
              />
            </div>
            <div className="contents">
              <div className="ico">
                <button
                  type="button"
                  className="ico hide-contents"
                  onClick={() => setShowContents(false)}
                  title="Show caption and description"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="panels">
                <SearchField filters={filtersState} />
                
                <ClustersPanel
                  clusters={dataset.clusters}
                  filters={filtersState}
                  setClusters={(clusters) =>
                    setFiltersState((filters) => ({
                      ...filters,
                      clusters,
                    }))
                  }
                  toggleCluster={(cluster) => {
                    setFiltersState((filters) => ({
                      ...filters,
                      clusters: filters.clusters[cluster]
                        ? omit(filters.clusters, cluster)
                        : { ...filters.clusters, [cluster]: true },
                    }));
                  }}
                />
              </div>
            </div>
          </>
        )}
      </SigmaContainer>
    </div>
  );
};

export default SocialGraph;
