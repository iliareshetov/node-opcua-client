import { Pool, QueryArrayConfig, QueryResult } from "pg";
import dotenv from "dotenv";
import { UAString } from "node-opcua";

dotenv.config();

const pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.DBHOST,
  database: process.env.DATABASE,
  password: process.env.DBPASS,
  port: 5432,
  ssl: false,
});

pool.on("error", (err: Error, client: any) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const query = async (
  text: string | QueryArrayConfig<any>,
  params: any[]
): Promise<QueryResult> => {
  const start: number = Date.now();
  const res: QueryResult = await pool.query(text, params);
  const duration: number = Date.now() - start;
  console.log("executed query", { text, duration, rows: res.rowCount });
  return res;
};

const saveTag = async (
  nodeId: string,
  name: UAString,
  value: string
): Promise<string> => {
  const res: QueryResult = await query(
    "SELECT * FROM  opcuadata.tag WHERE nodeid = $1",
    [nodeId]
  );

  if (!res.rows[0]) {
    const res: QueryResult = await query(
      "INSERT INTO opcuadata.tag(nodeid, tagname, tagvalue, updatetime) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [nodeId, name, value]
    );

    return `Created new tag with id: ${res.rows[0].tagid}`;
  } else {
    const res: QueryResult = await query(
      "UPDATE opcuadata.tag SET tagvalue = $1 , updatetime = NOW() WHERE nodeid = $2 RETURNING *",
      [value, nodeId]
    );

    console.log(res.rows[0]);

    return `Updated tag with nodeid: ${res.rows[0].nodeid}`;
  }
};

export { saveTag, pool };
