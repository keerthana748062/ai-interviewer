document.addEventListener("DOMContentLoaded", () => {

    const startBtn = document.getElementById("startBtn");
    const options = document.querySelectorAll(".domain-option");

    let selectedDomain = "";

    /* -------------------------
    DOMAIN SELECTION
    ------------------------- */
    options.forEach(option => {
        option.addEventListener("click", () => {

            options.forEach(o => o.classList.remove("active"));
            option.classList.add("active");

            selectedDomain = option.innerText;

            startBtn.disabled = false;
            startBtn.classList.add("enabled");
        });
    });

    /* -------------------------
    START INTERVIEW
    ------------------------- */
    if (startBtn) {

        startBtn.addEventListener("click", async () => {

            try {

                // 🔴 Validation
                if (!selectedDomain) {
                    alert("Please select an interview domain");
                    return;
                }

                // 🔥 API CALL
                const response = await fetch("http://localhost:3000/api/interview/start", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ domain: selectedDomain })
                });

                const data = await response.json();

                console.log("START RESPONSE:", data);

                if (!response.ok) {
                    alert(data.error || "Failed to start interview");
                    return;
                }

                // ✅ STORE DATA
                localStorage.setItem("sessionId", data.sessionId);
                localStorage.setItem("question", data.question);
                localStorage.setItem("domain", selectedDomain);

                if (data.avatar) {
                    localStorage.setItem("avatar", JSON.stringify(data.avatar));
                }

                // ✅ REDIRECT (FINAL STEP)
                window.location.href = "interview.html";

            } catch (error) {
                console.error("Error:", error);
                alert("Server not reachable. Make sure backend is running.");
            }

        });

    }

    /* -------------------------
    NAVBAR ACTIVE LINK
    ------------------------- */
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {

        let current = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;

            if (window.scrollY >= sectionTop) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");

            if (link.getAttribute("href") === "#" + current) {
                link.classList.add("active");
            }
        });

    });

});

