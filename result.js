
/* =========================
   FETCH RESULT FROM BACKEND
========================= */

async function loadResult(){

try{

    // 🔥 Replace this with your backend API
    const res = await fetch("http://localhost:5000/api/result");

    let data;

    if(res.ok){
        data = await res.json();
    }else{
        throw new Error("No backend");
    }

    displayResult(data);

}catch(err){

    // ✅ fallback dummy data
    const data = {
        score: 78,
        tech: 85,
        communication: 65,
        problem: 80
    };

    displayResult(data);
}

}


/* =========================
   DISPLAY RESULT
========================= */

function displayResult(data){

// SCORE
document.getElementById("score").innerText = data.score + "%";

// RATING
let rating = "";
if(data.score > 80) rating = "Excellent 🎉";
else if(data.score > 60) rating = "Good 👍";
else rating = "Average ⚠️";

document.getElementById("rating").innerText = rating;


// SUMMARY
let summary = "";

if(data.communication < 70){
    summary = "Your technical skills are strong, but communication needs improvement.";
}else{
    summary = "Great performance overall! Keep improving to reach excellence.";
}

document.getElementById("summary").innerText = summary;


// DECISION
let decision = "";
let role = "";

if(data.score > 75){
    decision = "✅ Selected";
    role = "Recommended Role: Software Developer";
}else{
    decision = "❌ Not Selected";
    role = "Keep improving and try again!";
}

document.getElementById("decision").innerText = decision;
document.getElementById("role").innerText = role;


// PROGRESS BARS (ANIMATION)
setTimeout(()=>{
    document.getElementById("techBar").style.width = data.tech + "%";
    document.getElementById("commBar").style.width = data.communication + "%";
    document.getElementById("problemBar").style.width = data.problem + "%";
}, 300);

}


/* =========================
   INIT
========================= */

loadResult();