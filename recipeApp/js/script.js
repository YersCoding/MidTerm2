const API_KEY = 'ed4ee341aaf1444f82d0c464cd3c4f4f';


const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const suggestionsList = document.getElementById('suggestionsList');
const recipesContainer = document.getElementById('recipesContainer');
const recipeModal = document.getElementById('recipeModal');
const recipeTitle = document.getElementById('recipeTitle');
const recipeDetails = document.getElementById('recipeDetails');
const closeModal = document.getElementById('closeModal');

async function searchRecipes(query) {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=5&apiKey=${API_KEY}`);
    const data = await response.json();
    return data.results;    
}

async function getRecipeDetails(id) {
    const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`);
    const data = await response.json();
    return data;
}


function displayRecipes(recipes) {
    recipesContainer.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.innerHTML = `
            <img src="${recipe.image || 'default-image.png'}" alt="${recipe.title}">
            <div class="recipe-info">
            <h3>${recipe.title}</h3>
            <p>Prep time: ${recipe.readyInMinutes || 'N/A'} min</p>
            </div>
        `;
        recipeCard.addEventListener('click', () => {
            window.location.href = `recipe-details.html?id=${recipe.id}`;
            console.log(`Clicked recipe with ID: ${recipe.id}`);
            
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            if (!favorites.some(fav => fav.id === recipe.id)) {  
                favorites.push(recipe);
                localStorage.setItem('favorites', JSON.stringify(favorites));
            }
        });
        recipesContainer.appendChild(recipeCard);
    });
}



function showRecipeDetails(details) {
    recipeTitle.textContent = details.title;
    recipeDetails.innerHTML = `
        <h4>Ingredients</h4>
        <ul>
            ${details.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')}
        </ul>
        <h4>Instructions</h4>
        <p>${details.instructions}</p>
        <h4>Nutritional Information</h4>
        <p>Calories: ${details.nutrition.nutrients.find(n => n.title === 'Calories').amount} kcal</p>
        <p>Protein: ${details.nutrition.nutrients.find(n => n.title === 'Protein').amount} g</p>
        <p>Fat: ${details.nutrition.nutrients.find(n => n.title === 'Fat').amount} g</p>
    `;
    recipeModal.style.display = 'flex';
}


closeModal.addEventListener('click', () => {
    recipeModal.style.display = 'none';
});

searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim();
    if (query.length > 2) {
        const recipes = await searchRecipes(query);
        suggestionsList.innerHTML = recipes.map(recipe => `<li>${recipe.title}</li>`).join('');
        suggestionsList.style.display = 'block';
    } else {
        suggestionsList.style.display = 'none';
    }
});

suggestionsList.addEventListener('click', async (e) => {
    const query = e.target.textContent;
    searchInput.value = query;
    suggestionsList.style.display = 'none';
    const recipes = await searchRecipes(query);
    displayRecipes(recipes);
});


searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query) {
        const recipes = await searchRecipes(query);
        displayRecipes(recipes);
        displaySuggestions(recipes);  
    }
});

function displaySuggestions(recipes) {
    suggestionsList.innerHTML = recipes.map(recipe => `<li>${recipe.title}</li>`).join('');
    suggestionsList.style.display = 'block';
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('.searchBar')) {
        suggestionsList.style.display = 'none';
    }
});

recipeCard.addEventListener('click', () => {
    window.location.href = `recipe-details.html?id=${recipe.id}`;
});

