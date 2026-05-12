import { createApp } from "./src/app.js";
import http from "http";

const app = createApp();
const server = http.createServer(app);

server.listen(5002, async () => {
  console.log("Test server running on 5002");
  
  try {
    const res = await fetch("http://localhost:5002/api/v1/products");
    console.log("Status:", res.status);
    const body = await res.text();
    console.log("Body:", body);
  } catch (err) {
    console.error("Fetch error:", err);
  }
  
  process.exit(0);
});
