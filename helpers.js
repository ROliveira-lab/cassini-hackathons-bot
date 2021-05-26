function todictionary(entities, keyfunction) {
  return entities.reduce((result, entity) => ({ ...result, [keyfunction(entity)]: entity }), {});
}

module.exports = {
  todictionary
}