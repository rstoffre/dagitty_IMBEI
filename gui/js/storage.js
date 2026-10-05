// ============================================
// Daggity Model Storage
// ============================================

const STORAGE_KEY = "daggity_models";


// ============================================
// Internal helper
// ============================================

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


function saveAllModels(models) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(models)
    );
}


// ============================================
// Save
// ============================================

function saveModel(modelId, content) {
    const models = getAllModels();

    const model = {
        id: crypto.randomUUID(),
        modelId: modelId,
        content: content,
        createdAt: new Date().toISOString()
    };

    models.push(model);

    saveAllModels(models);

    return model.id;
}


// ============================================
// Get all versions of a model
// ============================================

function getModelVersions(modelId) {
    const models = getAllModels();

    return models
        .filter(model => model.modelId === modelId)
        .sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
}


// ============================================
// Get one specific saved model
// ============================================

function getModel(id) {
    const models = getAllModels();

    return models.find(model => model.id === id) || null;
}


// ============================================
// Delete one saved model
// ============================================

function deleteModel(id) {
    const models = getAllModels();

    const filtered = models.filter(
        model => model.id !== id
    );

    saveAllModels(filtered);
}


// ============================================
// Get all saved models
// ============================================

function getAllSavedModels() {
    return getAllModels().sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
}
