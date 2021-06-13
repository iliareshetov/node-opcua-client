require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("executed query", { text, duration, rows: res.rowCount });
  return res;
};

const save = async (nodeId, name, value) => {
  const res = await query("SELECT * FROM  opcuadata.tag WHERE nodeid = $1", [
    nodeId,
  ]);

  if (!res.rows[0]) {
    const res = await query(
      "INSERT INTO opcuadata.tag(nodeid, tagname, tagvalue, updatetime) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [nodeId, name, value]
    );

    return `Created new tag with id: ${res.rows[0].tagid}`;
  } else {
    const res = await query(
      "UPDATE opcuadata.tag SET tagvalue = $1 , updatetime = NOW() WHERE nodeid = $2 RETURNING *",
      [value, nodeId]
    );

    console.log(res.rows[0]);

    return `Updated tag with nodeid: ${res.rows[0].nodeid}`;
  }
};

module.exports = {
  query,
  save,
};
