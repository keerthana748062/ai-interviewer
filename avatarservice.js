// avatarservice.js

function generateAvatarPayload(text) {
    return {
        text: text,

        // 🎤 Voice settings (frontend will use this)
        voice: {
            rate: 1,        // speed
            pitch: 1,       // tone
            volume: 1
        },

        // 🎭 Emotion (for UI avatar)
        emotion: detectEmotion(text)
    };
}


/* -------------------------
EMOTION DETECTION
------------------------- */
function detectEmotion(text) {
    const t = text.toLowerCase();

    if (t.includes("great") || t.includes("good") || t.includes("excellent")) {
        return "happy";
    }

    if (t.includes("why") || t.includes("how")) {
        return "thinking";
    }

    if (t.includes("challenge") || t.includes("difficult")) {
        return "serious";
    }

    return "neutral";
}


/* -------------------------
OPTIONAL: SPEECH-TO-TEXT HELPER (frontend trigger)
------------------------- */
function getSpeechToTextConfig() {
    return {
        enabled: true,
        language: "en-US",
        continuous: false
    };
}


module.exports = {
    generateAvatarPayload,
    getSpeechToTextConfig
};