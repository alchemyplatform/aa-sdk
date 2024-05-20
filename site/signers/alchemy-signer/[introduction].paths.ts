const configPaths = {
  paths() {
    return [
      { params: { introduction: "index" } },
      { params: { introduction: "introduction" } },
      { params: { introduction: "introduction.md" } },
    ];
  },
};

export default configPaths;
