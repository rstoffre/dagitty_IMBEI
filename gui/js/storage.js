

const STORAGE_KEY = "daggity_models";

//Get all models from local storage
function getAllModels() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return [];
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error("Could not read saved models:", error);
        return [];
    }
}

// Save all models to local storage
function saveAllModels(models) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(models)
    );
}

//Save a new model to local storage and return its unique ID
//Models are stored with the following structure:
// {
//     id: "unique-id",
//     modelId: "my-model",
//     content: "dagitty model content",
//     createdAt: "2024-06-01T12:00:00.000Z"
// }
function saveModel(modelId, content, name) {
    const models = getAllModels();

    const model = {
    id: crypto.randomUUID(),
    modelId: modelId,
    name: name,
    content: content,
    createdAt: new Date().toISOString()
    };

    models.push(model);

    saveAllModels(models);

    return model.id;
}


//Get all versions of a specific model, sorted by creation date (newest first)
function getModelVersions(modelId) {
    const models = getAllModels();

    return models
        .filter(model => model.modelId === modelId)
        .sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
}



//Delete a specific model version by its ID
function deleteModel(id) {
    const models = getAllModels();

    const filtered = models.filter(
        model => model.id !== id
    );

    saveAllModels(filtered);
}


//Return all saved models, sorted by creation date (newest first)
function getAllSavedModels() {
    return getAllModels().sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

//Export the model history for a specific model ID
function exportModelHistory(modelId) {
    return {
        format: "dagitty-model-history",
        version: 1,
        modelId: modelId,
        exportedAt: new Date().toISOString(),
        models: getModelVersions(modelId).map(model => ({
            name: model.name || "Unbenannte Version" ,
            content: model.content,
            createdAt: model.createdAt
        }))
    };
}

//Import a model history from a JSON object and save it to local storage
function importModelHistory(importedData) {
    if (
        importedData.format !== "dagitty-model-history" ||
        !Array.isArray(importedData.models)
    ) {
        throw new Error("Ungültiges Dateiformat.");
    }

    const modelId = importedData.modelId || "my-model";

    const importedModels = importedData.models.map(model => ({
        id: crypto.randomUUID(),
        modelId: modelId,
        name: model.name || "Unbenannte Version",
        content: model.content,
        createdAt: model.createdAt
    }));

    // Alle bisher lokal gespeicherten Modelle ersetzen
    saveAllModels(importedModels);
}