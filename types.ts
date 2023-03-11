import { AttributeIds } from "node-opcua";

interface ItemToMonitor {
  nodeId: string;
  attributeId: AttributeIds.Value;
}

interface Parameters {
  samplingInterval: number;
  discardOldest: boolean;
  queueSize: number;
}

export { ItemToMonitor, Parameters };
