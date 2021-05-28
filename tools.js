const fs = require("fs");

const { indicators, lines, modes, findIndex } = require("./classes");

function obtenerDatos(file, nlines, n, mode, itemList) {
  file.shift();
  if (nlines === lines["DOUBLELINE"]) file.shift();
  for (let i = 0; i < n; i++) {
    let splitted = file[i].split(/\s/);
    let line = splitted.filter(function (elem) {
      return elem != "";
    });
    switch (mode) {
      case modes["INT_FLOAT"]:
        let e0, r0;
        e0 = parseInt(line[0]);
        r0 = parseFloat(line[1]);
        itemList[i].setValues(
          indicators["NOTHING"],
          indicators["NOTHING"],
          indicators["NOTHING"],
          e0,
          indicators["NOTHING"],
          indicators["NOTHING"],
          r0
        );
        break;
      case modes["INT_FLOAT_FLOAT"]:
        let e, r, rr;
        e = parseInt(line[0]);
        r = parseFloat(line[1]);
        rr = parseFloat(line[2]);
        itemList[i].setValues(
          e,
          r,
          rr,
          indicators["NOTHING"],
          indicators["NOTHING"],
          indicators["NOTHING"],
          indicators["NOTHING"]
        );
        break;
      case modes["INT_INT_INT_INT"]:
        let e1, e2, e3, e4;
        e1 = parseInt(line[0]);
        e2 = parseInt(line[1]);
        e3 = parseInt(line[2]);
        e4 = parseInt(line[3]);
        itemList[i].setValues(
          e1,
          indicators["NOTHING"],
          indicators["NOTHING"],
          e2,
          e3,
          e4,
          indicators["NOTHING"]
        );
        break;
    }
  }
  file.splice(0, n);
}

async function getFile(filename) {
  const fsPromises = fs.promises;
  const data = await fsPromises
    .readFile(filename)
    .catch((err) => console.error("Failed to read file", err));

  return data.toString();
}

function getArrayReady(data) {
  let arrayData = data.split("\r\n");
  return arrayData.filter(function (elem) {
    return elem != "";
  });
}

function correctConditions(n, list, indices) {
  list.forEach(
    (element, index, arreglo) => (indices[index] = arreglo[index].getNode1)
  );

  for (let i = 0; i < n - 1; i++) {
    let pivot = list[i].getNode1;
    for (let j = i; j < n; j++)
      if (list[j].getNode1 > pivot) list[j].setNode1 = list[j].getNode1 - 1;
  }
}

async function leerMallayCondiciones(m, filename) {
  let inputfilename = filename + ".dat";
  const response = await getFile(inputfilename);
  let fileArray = getArrayReady(response);
  let k = fileArray[0].split(" ")[0];
  let Q = fileArray[0].split(" ")[1];
  let nnodes = fileArray[1].split(" ")[0];
  let neltos = fileArray[1].split(" ")[1];
  let ndirich = fileArray[1].split(" ")[2];
  let nneu = fileArray[1].split(" ")[3];
  fileArray.shift();
  fileArray.shift();
  m.setParameters(k, Q);
  m.setSizes(nnodes, neltos, ndirich, nneu);
  m.createData();

  //console.log(m.getElements(), "elementList");
  //console.log(m.getDirichlet(), "dirichlet");
  //console.log(m.getNeumann(), "neumann");

  obtenerDatos(
    fileArray,
    lines["SINGLELINE"],
    nnodes,
    modes["INT_FLOAT_FLOAT"],
    m.getNodes()
  );
  obtenerDatos(
    fileArray,
    lines["DOUBLELINE"],
    neltos,
    modes["INT_INT_INT_INT"],
    m.getElements()
  );
  obtenerDatos(
    fileArray,
    lines["DOUBLELINE"],
    ndirich,
    modes["INT_FLOAT"],
    m.getDirichlet()
  );
  obtenerDatos(
    fileArray,
    lines["DOUBLELINE"],
    nneu,
    modes["INT_FLOAT"],
    m.getNeumann()
  );
  //console.log(m.getElements())
  //console.log(m.getNodes());
  correctConditions(ndirich, m.getDirichlet(), m.getDirichletIndices());
}

function writeResults(m, T, filename) {
  let dirichIndices = m.getDirichletIndices();
  let dirich = m.getDirichlet();
  let outputFileName = filename + ".pos.res";

  let outputFileData =
    "GiD Post Results File 1.0\n" +
    'Result "Temperature" "Load Case 1" 1 Scalar OnNodes\nComponentNames "T"\nValues\n';

  let Tpos = 0;
  let Dpos = 0;
  let n = m.getSize("NODES");
  let nd = m.getSize("DIRICHLET");

  for (let i = 0; i < n; i++) {
    if (findIndex(i + 1, nd, dirichIndices)) {
      outputFileData += `${i + 1} ${dirich[Dpos].getValue}\n`;
      Dpos++;
    } else {
      outputFileData += `${i + 1} ${T[Tpos]}\n`;
      Tpos++;
    }
  }
  outputFileData += "End values\n";
  fs.writeFile(outputFileName, outputFileData, function (err) {
    if (err) return console.log(err);
    //console.log("Hello World > helloworld.txt");
  });
}

module.exports = {
  leerMallayCondiciones,
  writeResults,
};
