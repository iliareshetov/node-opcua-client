import {
  OPCUAClient,
  AttributeIds,
  TimestampsToReturn,
  ClientMonitoredItem,
} from "node-opcua";
import os from "os";

const client = OPCUAClient.create({ endpointMustExist: false });
/*
- Root (i=84)
    - Objects (i=85)
    - Types (i=86)
    - Views (i=87)
*/
const nodeId = "ns=0;i=85"; // RootFolder.Objects.

const hostname = os.hostname().toLowerCase();
const endpointUrl = "opc.tcp://" + hostname + ":26543";

async function main() {
  try {
    // step 1 : connect to
    await client.connect(endpointUrl);
    console.log("connected");

    // step 2 : createSession

    const session = await client.createSession();
    console.log("session created");

    let browseResult = await session.browse({
      nodeId,
      //   nodeClassMask: NodeClass.Variable, // we only want sub node that are Variables
      resultMask: 63, // extract all information possible
    });
    console.log("BrowseResult = ", browseResult.toString());

    const subscription = await session.createSubscription2({
      requestedPublishingInterval: 2000,
      requestedMaxKeepAliveCount: 20,
      requestedLifetimeCount: 6000,
      maxNotificationsPerPublish: 1000,
      publishingEnabled: true,
      priority: 10,
    });

    subscription
      .on("keepalive", () => console.log("keepalive"))
      .on("terminated", () => console.log("subscription terminated"));

    const itemToMonitor = {
      nodeId: "ns=1;i=1001",
      attributeId: AttributeIds.Value,
    };

    const parameters = {
      samplingInterval: 1000,
      discardOldest: true,
      queueSize: 10,
    };

    const monitoredItem = ClientMonitoredItem.create(
      subscription,
      itemToMonitor,
      parameters,
      TimestampsToReturn.Both
    );

    monitoredItem.on("changed", (dataValue) => {
      console.log("value has changed : ", dataValue.value.value);
      console.log(dataValue);
    });
  } catch (err) {
    console.log("An error has occured : ", err);
  }
}
main();
