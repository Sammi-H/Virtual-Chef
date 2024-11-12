const textarea = document.getElementById("input");
const form = document.getElementById("searchForm");

textarea.setAttribute("maxlength", "1500");

function checkMaxLength() {
    if (textarea.value.length === 1500) {
        document.getElementById("errorModal").style.display = "block";
    }
}

function adjustTextareaHeight() {
    textarea.style.height = "auto";
    textarea.style.height = textarea.value === "" ? "60px" : `${textarea.scrollHeight}px`;
}

textarea.addEventListener("input", () => {
    adjustTextareaHeight();
    checkMaxLength();
});

textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.dispatchEvent(new Event("submit"));
    }
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (textarea.value.trim() !== "") {
        const query = textarea.value;
        startSearch(query);
    }
});

function closeModal() {
    const modal = document.getElementById("errorModal");
    modal.style.display = "none";
}

async function startSearch(query) {
    const apiKey = "b68b21af683845f7b176059b6a47eac0";
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error("API-fel: Kunde inte hämta data");
        }

        const data = await response.json();
        console.log(data.results);  

        const filteredRecipes = data.results.filter(recipe => {
            const title = recipe.title ? recipe.title.toLowerCase() : "";
            const summary = recipe.summary ? recipe.summary.toLowerCase() : "";

            return title.includes(query.toLowerCase()) || summary.includes(query.toLowerCase());
        });

        displayRecepies(filteredRecipes);
    } catch (error) {
        console.error("Fel vid hämtning av data:", error);
    }
}

function displayRecepies(recipes) {
    const container = document.getElementById("recepie-container");
    container.innerHTML = "";

    localStorage.setItem("recipes", JSON.stringify(recipes));

    recipes.forEach(recipe => {
        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");

        recipeCard.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}">
        <h3>${recipe.title}</h3>
        <p>${recipe.summary ? recipe.summary : "No summary available."}</p>
        `;

        recipeCard.addEventListener("click", () => showRecipeDetails(recipe.id));
        container.appendChild(recipeCard);
    });
}

async function showRecipeDetails(id) {
    const apiKey = "b68b21af683845f7b176059b6a47eac0";
    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        document.body.style.overflow = "auto";
        const recipe = await response.json();

        const recipeDetails = document.createElement("div");
        recipeDetails.style.display = "flex";
        recipeDetails.style.flexDirection = "column";
        recipeDetails.style.alignItems = "center";
        recipeDetails.style.padding = "20px";
        recipeDetails.style.maxWidth = "800px";
        recipeDetails.style.margin = "0 auto";
        recipeDetails.style.backgroundImage = "url('path/to/your/background-image.jpg')";
        recipeDetails.style.backgroundSize = "cover";
        recipeDetails.style.backgroundPosition = "center";

        recipeDetails.innerHTML = `
            <div class="chef">
                <img src="docs/Images/Chef.PNG" alt="Chef" style="position: fixed; right: 0; bottom: 0; width: 30%;" />
            </div>
            <h2 style="text-align: center; color: #333; font-size: 2em; margin-bottom: 20px;">${recipe.title}</h2>
            <img src="${recipe.image}" alt="${recipe.title}" style="width: 70%; max-width: 600px; border-radius: 15px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
            <div style="background: white; padding: 20px; padding-left: 25px; border-radius: 15px; max-width: 600px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                <h3 style="color: #333; margin-bottom: 10px; font-size: 1.5em;">How to Make ${recipe.title}</h3>
                <p style="color: #555;">${recipe.instructions || "Instructions not available."}</p>
            </div>
            <button id="goBackBtn" style="margin-top: 20px; padding: 10px 20px; background-color: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Go Back
            </button>
        `;

        document.body.innerHTML = "";
        document.body.appendChild(recipeDetails);

        document.getElementById("goBackBtn").addEventListener("click", () => {
            window.history.pushState({}, '', '/');
            window.location.reload();
        });

        history.replaceState({ page: "recipe-details" }, "", "");

    } catch (error) {
        console.error("Error fetching recipe details:", error);
    }
}

const resetBtn = document.querySelector("#resetSearchBtn");
resetBtn.addEventListener("click", () => {
    textarea.value = "";
    textarea.style.height = "60px";
    document.getElementById("recepie-container").innerHTML = "";
    localStorage.removeItem("recipes");
});

window.onload = function() {
    const savedRecipes = JSON.parse(localStorage.getItem("recipes"));
    if (savedRecipes) {
        displayRecepies(savedRecipes);
    }
};
