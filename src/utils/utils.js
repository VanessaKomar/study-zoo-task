const stripHtmlTags = (str) => str.replace(/<\/?[^>]+(>|$)/g, "");

const getAnimalInfo = (animals, images, tags, connectors, sectors) => {
  const imageMap = new Map(images.map((image) => [image.text, image.id]));
  const tagMap = new Map(tags.map((tag) => [tag.id, tag.text]));
  const sectorMap = new Map(sectors.map((sector) => [sector.groupId, sector.text]));
  const idToTitleMap = new Map([
    ...animals.map((animal) => [animal.id, animal.text]),
    ...images.map((image) => [image.id, image.text]),
  ]);

  return animals.map((animal) => {
    const tagNames = (animal.tags || []).map((tagId) => tagMap.get(tagId) || null);

    const sectorName = sectorMap.get(animal.sector) || null;

    return {
      name: animal.text,
      sector: sectorName,
      tags: tagNames.filter(Boolean),
    };
  });
};

const groupAnimalsBySector = (animals) => {
  return animals.reduce((grouped, animal) => {
    const { sector, ...rest } = animal;

    if (!grouped[sector]) {
      grouped[sector] = [];
    }
    grouped[sector].push(rest);
    return grouped;
  }, {});
};

const getSectorInfo = (sectors, connectors) => {
  const sectorMap = new Map(sectors.map((sector) => [sector.id, sector.text]));

  return sectors.map((sector) => {
    const sectorConnectors = connectors.filter(
      (connector) =>
      connector.start === sector.id || connector.end === sector.id
    );

    // const connectionIds = sectorConnectors.map((connector) => {
    //   const connectedId = (connector.start === sector.id) ?
    //     connector.end : connector.start;
    //   const connectedName = sectorMap.get(connectedId);
    //   return connectedName ? `${sector.text}_to_${connectedName}` : null;
    // }).filter(Boolean);

    const connections = sectorConnectors
      .map((connector) => {
        const connectedId = (connector.start === sector.id) ?
          connector.end : connector.start;
        return sectorMap.get(connectedId) || null;
      })
      .filter(Boolean);

    return {
      name: sector.text,
      // connectionIds,
      connections,
    };
  });
};

const getNoteInfo = (noteDetails) => {
  return noteDetails.map((note) => {
    const matches = note.content.match(/<p>(.*?)<\/p>/g) || [];

    const timeOfDay = matches[0] ? matches[0].replace(/<\/?p>/g, "").trim() : null;
    const animalOne = matches[2] ? matches[2].split(":")[1]?.replace(/<\/?p>/g, "").trim() : null;
    const animalTwo = matches[3] ? matches[3].split(":")[1]?.replace(/<\/?p>/g, "").trim() : null;

    return {
      // id: note.id,
      timeOfDay,
      animalOne,
      animalTwo
    };
  });
};

/* 
  New Function: getConnectorInfo
  Iterates over the animals (using the original animals array) and their connectors,
  producing a deduplicated list of non-empty connection strings.
*/
const getConnectorInfo = (animals, images, connectors) => {
  // Create lookup maps
  const imageMap = new Map(images.map(image => [image.text, image.id]));
  const idToTitleMap = new Map([
    ...animals.map(animal => [animal.id, animal.text]),
    ...images.map(image => [image.id, image.text]),
  ]);

  const connectionSet = new Set();

  animals.forEach(animal => {
    const animalConnectors = connectors.filter(
      connector =>
        connector.start === animal.id || 
        connector.end === animal.id ||
        connector.start === imageMap.get(animal.text) || 
        connector.end === imageMap.get(animal.text)
    );

  animalConnectors.forEach(connector => {
    const connectedId = (connector.start === animal.id || connector.start === imageMap.get(animal.text)) ?
      connector.end : connector.start;
    const connectedName = idToTitleMap.get(connectedId);
    if (connectedName) {
      // Sort the two names alphabetically so that duplicate connections cancel out.
      const names = [animal.text, connectedName].sort();
      const sortedConnection = `${names[0]}_to_${names[1]}`;
      connectionSet.add(sortedConnection);
    }
    });
  });

  return Array.from(connectionSet);
};


// Export functions for CommonJS
module.exports = {
  stripHtmlTags,
  getAnimalInfo,
  getSectorInfo,
  getNoteInfo,
  groupAnimalsBySector,
  getConnectorInfo
};