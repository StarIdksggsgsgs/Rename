import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.text({ type: "*/*", limit: "2mb" }));

function renameLocals(code) {
  const localRegex = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
  let match;
  const locals = [];
  while ((match = localRegex.exec(code)) !== null) {
    locals.push(match[1]);
  }
  const renameMap = {};
  locals.forEach((name, idx) => {
    renameMap[name] = `V${idx + 1}`;
  });
  return code.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|--.*?$|\b[a-zA-Z_][a-zA-Z0-9_]*\b)/gm, (match) => {
    if (/^["']|^--/.test(match)) return match;
    return renameMap[match] || match;
  });
}

app.post("/rename", (req, res) => {
  const code = req.body;
  if (!code) return res.status(400).send("No code provided");
  const renamedCode = renameLocals(code);
  res.setHeader("Content-Type", "text/plain");
  res.send(renamedCode);
});

app.listen(port, () => console.log(`API running on port ${port}`));
