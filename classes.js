const indicators = { NOTHING: null };
const lines = {
  NOLINE: "NOLINE",
  SINGLELINE: "SINGLELINE",
  DOUBLELINE: "DOUBLELINE",
};
const modes = {
  NOMODE: "NOMODE",
  INT_FLOAT: "INT_FLOAT",
  INT_FLOAT_FLOAT: "INT_FLOAT_FLOAT",
  INT_INT_INT_INT: "INT_INT_INT_INT",
};

class Item {
  constructor(id, x, y, node1, node2, node3, value) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.node1 = node1;
    this.node2 = node2;
    this.node3 = node3;
    this.value = value;
  }

  setvalues(id, x, y, node1, node2, node3, value) {}

  set setId(id) {
    this.id = identifier;
  }

  set setX(xCoord) {
    this.x = xCoord;
  }

  set setY(yCoord) {
    this.y = yCoord;
  }

  set setNode1(node1) {
    this.node1 = node1;
  }

  set setNode2(node2) {
    this.node2 = node2;
  }

  set setNode3(node3) {
    this.node3 = node3;
  }

  set setValue(value) {
    this.value = value;
  }

  get getId() {
    return this.id;
  }

  get getX() {
    return this.x;
  }

  get getY() {
    return this.y;
  }

  get getNode1() {
    return this.node1;
  }

  get getNode2() {
    return this.node2;
  }

  get getNode3() {
    return this.node3;
  }

  get getValue() {
    return this.value;
  }
}

class Node extends Item {
  constructor(id, x, y, node1, node2, node3, value) {
    super(id, x, y, node1, node2, node3, value);
  }
  setValues(id, x, y, node1, node2, node3, value) {
    this.id = id;
    this.x = x;
    this.y = y;
  }
}

class Element extends Item {
  setValues(id, x, y, node1, node2, node3, value) {
    this.id = id;
    this.node1 = node1;
    this.node2 = node2;
    this.node3 = node3;
  }
}

class Condition extends Item {
  setValues(id, x, y, node1, node2, node3, value) {
    this.node1 = node1;
    this.value = value;
  }
}

class Mesh {
  constructor() {
    this.parameters = { THERMAL_CONDUCTIVITY: null, HEAT_SOURCE: null };
    this.sizes = {
      NODES: null,
      ELEMENTS: null,
      DIRICHLET: null,
      NEUMANN: null,
    };
    this.nodeList = null;
    this.elementList = null;
    this.indicesDirich = null;
    this.dirichletList = null;
    this.neumannList = null;
  }

  setParameters(k, Q) {
    this.parameters["THERMAL_CONDUCTIVITY"] = k;
    this.parameters["HEAT_SOURCE"] = Q;
  }

  setSizes(nnodes, neltos, ndirich, nneu) {
    this.sizes["NODES"] = nnodes;
    this.sizes["ELEMENTS"] = neltos;
    this.sizes["DIRICHLET"] = ndirich;
    this.sizes["NEUMANN"] = nneu;
  }
  getSizes() {
    return this.sizes;
  }
  getSize(s) {
    return this.sizes[s];
  }
  getParameter(p) {
    return this.parameters[p];
  }
  createData() {
    this.nodeList = Array(parseInt(this.sizes["NODES"])).fill(null);
    this.nodeList.forEach(
      (elem, index, arreglo) => (arreglo[index] = new Node())
    );

    this.elementList = Array(parseInt(this.sizes["ELEMENTS"])).fill(null);
    this.elementList.forEach(
      (elem, index, arreglo) => (arreglo[index] = new Element())
    );

    this.indicesDirich = [];

    this.dirichletList = Array(parseInt(this.sizes["DIRICHLET"])).fill(null);
    this.dirichletList.map(
      (elem, index, arreglo) => (arreglo[index] = new Condition())
    );

    this.neumannList = Array(parseInt(this.sizes["NEUMANN"])).fill(null);
    this.neumannList.forEach(
      (elem, index, arreglo) => (arreglo[index] = new Condition())
    );
  }
  getNodes() {
    return this.nodeList;
  }
  getElements() {
    return this.elementList;
  }
  getDirichletIndices() {
    return this.indicesDirich;
  }
  getDirichlet() {
    return this.dirichletList;
  }
  getNeumann() {
    return this.neumannList;
  }
  getNode(i) {
    return this.nodeList[i];
  }
  getElement(i) {
    return this.elementList[i];
  }
  getCondition(i, type) {
    if (type === "DIRICHLET") return this.dirichletList[i];
    else return this.neumannList[i];
  }
}

function findIndex(v, s, arr) {
  for (let i = 0; i < s; i++) if (arr[i] === v) return true;
  return false;
}

module.exports = {
  Mesh,
  indicators,
  lines,
  modes,
  findIndex,
};
