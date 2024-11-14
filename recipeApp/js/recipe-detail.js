const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');
const API_KEY = 'ed4ee341aaf1444f82d0c464cd3c4f4f';

const recipeTitle = document.getElementById('recipeTitle');
const recipeImage = document.getElementById('recipeImage');
const ingredientsList = document.getElementById('ingredientsList');
const instructionsList = document.getElementById('instructionsList');
const calories = document.getElementById('calories');
const protein = document.getElementById('protein');
const fat = document.getElementById('fat');

async function fetchRecipeDetails(id) {
    const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`);
    const data = await response.json();
    showRecipeDetails(data);  
}

function showRecipeDetails(details) {
    console.log("Recipe Details:", details);  

    recipeTitle.textContent = details.title;
    const recipeImageURL = details.image.startsWith('http')
    ? details.image
    : `https://spoonacular.com/recipeImages/${details.image}`;
    
    recipeImage.src = recipeImageURL;  
    ingredientsList.innerHTML = details.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('');
    instructionsList.innerHTML = details.instructions.split('\n').map(step => `<li>${step}</li>`).join('');  
    
    calories.textContent = details.nutrition.nutrients.find(n => n.title === 'Calories').amount;
    protein.textContent = details.nutrition.nutrients.find(n => n.title === 'Protein').amount;
    fat.textContent = details.nutrition.nutrients.find(n => n.title === 'Fat').amount;
}


if (recipeId) {
    fetchRecipeDetails(recipeId);
} else {
    alert("No recipe ID provided.");
}
