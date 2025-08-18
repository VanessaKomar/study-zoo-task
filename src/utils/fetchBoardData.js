const {
  stripHtmlTags,
  getAnimalInfo,
  getSectorInfo,
  getNoteInfo,
  groupAnimalsBySector,
  getConnectorInfo
} = require("./utils");

async function fetchBoardData() {
  try {
    const allItems = await window.miro.board.get();

    const animals = allItems.filter((i) => i.type === "card");
    const images = allItems.filter((i) => i.type === "image");
    const tags = allItems.filter((i) => i.type === "tag");
    const allConnectors = allItems.filter((i) => i.type === "connector");
    const sectors = allItems.filter((i) => i.shape === "circle");
    const notes = allItems.filter((i) => i.type === "sticky_note");

    const sectorDetails = sectors.map((sector) => ({
      text: stripHtmlTags(sector.content),
      id: sector.id,
      groupId: sector.groupId,
      connectors: sector.connectorIds,
    }));

    const animalDetails = animals.map((animal) => ({
      text: stripHtmlTags(animal.title),
      tags: animal.tagIds || [],
      id: animal.id,
      sector: animal.groupId,
    }));

    const imageDetails = images.map((image) => ({
      text: image.title,
      id: image.id,
    }));

    const tagDetails = tags.map((tag) => ({
      text: tag.title,
      id: tag.id,
    }));

    const allConnectorDetails = allConnectors.map((connector) => ({
      id: connector.id,
      start: connector.start.item,
      end: connector.end.item,
      color: connector.style.strokeColor,
    }));

    const sectorConnectorDetails = allConnectorDetails
      .filter((connector) => connector.color === "#844e25") // Only sector connectors
      .map((sectorConnector) => ({
        id: sectorConnector.id,
        start: sectorConnector.start,
        end: sectorConnector.end,
      }));

    const connectorDetails = allConnectorDetails
      .filter((connector) => connector.color !== "#844e25") // Everything else
      .map((connector) => ({
        id: connector.id,
        start: connector.start,
        end: connector.end,
      }));

    const noteDetails = notes.map((note) => ({
      id: note.id,
      content: note.content,
    }));

    const animalsInfo = getAnimalInfo(animalDetails, imageDetails, tagDetails, connectorDetails, sectorDetails);
    const animalsbySectorInfo = groupAnimalsBySector(animalsInfo);
    const sectorInfo = getSectorInfo(sectorDetails, sectorConnectorDetails);
    const noteInfo = getNoteInfo(noteDetails);
    const connectorInfo = getConnectorInfo(animalDetails, imageDetails, connectorDetails);


    const boardDetails = {
      animals: animalsbySectorInfo,
      sectors: sectorInfo,
    };

    const boardData = {
      notes: noteInfo,
      connectors: connectorInfo,
    };

    // Send data to Next.js API to save as a file
    await fetch("/api/saveBoardDetails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(boardDetails),
    });

    // Send data to Next.js API to save as a file
    await fetch("/api/saveBoardData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(boardData),
    });

    return;
  } catch (err) {
    console.error("Error fetching board data:", err);
    return null;
  }
}

module.exports = { fetchBoardData };