function buildmap(entities) {
  return entities.reduce((result, entity) => ({ ...result, [entity.id]: entity }), {});
}

function findbyid(entities, id) {
  return entities.find((entity) => entity.id === id);
}

module.exports = {
  buildmap,
  findbyid
}