const favoritesContainer = document.getElementById('favoritesContainer');

function displayFavorites() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];    
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p>No favorite recipes yet.</p>';
        return;
    }
    favoritesContainer.innerHTML = '';

    const horizontalContainer = document.createElement('div');
    horizontalContainer.classList.add('favorites-row-container'); 

    favorites.forEach(recipe => {
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
        });

        horizontalContainer.appendChild(recipeCard);
    });

    favoritesContainer.appendChild(horizontalContainer);
}

displayFavorites();
