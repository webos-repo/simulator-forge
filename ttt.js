const fs = require("node:fs");

const outDir = "./out";
const publishDir = `${outDir}/publish`;
const tmpDir = `${outDir}/tmp`;
const packageDir = `${outDir}/webOS_TV_25_Simulator_1.4.2-darwin-arm64`;

// fs.rmdir(publishDir, { recursive: true });
// fs.rmdirSync(tmpDir, { recursive: true });

fs.cpSync(packageDir, tmpDir, { recursive: true });
