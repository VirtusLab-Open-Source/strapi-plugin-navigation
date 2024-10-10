export type RestartReasons = 'GRAPH_QL';
export type RestartStatus = { required: true; reasons?: RestartReasons[] } | { required: false };