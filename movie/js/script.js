const API_KEY = 'ec540667cb2b22a546e5f608c2925cd7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const isIndexPage = document.getElementById('movies-grid') !== null;
const isWatchlistPage = document.getElementById('watchlist-grid') !== null;

if (isIndexPage) {
    initIndexPage();
} else if (isWatchlistPage) {
    initWatchlistPage();
}

function initIndexPage() {
    const moviesGrid = document.getElementById('movies-grid');
    const sortSelect = document.getElementById('sort-select');
    const searchInput = document.getElementById('searchInput');
    const suggestions = document.getElementById('suggestionsList');
    const movieDetails = document.getElementById('movie-details');
    const closeModal = document.getElementById('close-modal');
    const movieModal = document.getElementById('movie-modal');
    const loadingIndicator = document.getElementById('loading');
    const notification = document.getElementById('notification');

    console.log('moviesGrid:', moviesGrid);
    console.log('sortSelect:', sortSelect);
    console.log('searchInput:', searchInput);
    console.log('suggestions:', suggestions);
    console.log('movieDetails:', movieDetails);
    console.log('closeModal:', closeModal);
    console.log('movieModal:', movieModal);
    console.log('loadingIndicator:', loadingIndicator);
    console.log('notification:', notification);

    if (!loadingIndicator) {
        console.error('Loading indicator not found!');
    }

    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    searchInput.addEventListener('input', handleSearchInput);
    sortSelect.addEventListener('change', fetchMovies);
    closeModal.addEventListener('click', () => {
        movieModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target == movieModal) {
        movieModal.style.display = 'none';
        }
    });

    fetchMovies();

    async function handleSearchInput() {
        const query = searchInput.value.trim();
        if (query.length > 0) {
        const data = await fetchData('/search/movie', `&query=${encodeURIComponent(query)}`);
        showSuggestions(data.results);
        } else {
        suggestions.innerHTML = '';
        suggestions.style.display = 'none';
        }
    }


    function showSuggestions(movies) {
        suggestions.innerHTML = '';
        if (!movies || movies.length === 0) {
        suggestions.style.display = 'none';
        return;
        }
        movies.slice(0, 5).forEach(movie => {
        const li = document.createElement('li');
        li.textContent = movie.title;
        li.addEventListener('click', () => {
            searchInput.value = movie.title;
            suggestions.innerHTML = '';
            suggestions.style.display = 'none';
            fetchMovies();
        });
        suggestions.appendChild(li);
        });
        suggestions.style.display = 'block';
    }

    async function fetchMovies() {
        if (!loadingIndicator) {
        console.error('Loading indicator element is missing.');
        return;
        }

        const query = searchInput.value.trim();
        const sortBy = sortSelect.value;
        let endpoint = '/discover/movie';
        let params = `&sort_by=${sortBy}`;

        if (query) {
        endpoint = '/search/movie';
        params += `&query=${encodeURIComponent(query)}`;
        }

        try {
        loadingIndicator.style.display = 'block'; 
        const data = await fetchData(endpoint, params);
        loadingIndicator.style.display = 'none'; 
        displayMovies(data.results);
        } catch (error) {
        loadingIndicator.style.display = 'none'; 
        console.error('Error in fetchMovies:', error);
        showNotification('Failed to fetch movies. Please try again later.');
        }
    }

    function displayMovies(movies) {
        moviesGrid.innerHTML = '';
        if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = '<p>No movies found.</p>';
        return;
        }
        movies.forEach(movie => {
        if (movie && movie.title) { 
            const movieCard = createMovieCard(movie);
            moviesGrid.appendChild(movieCard);
        }
        });
    }

   
    function createMovieCard(movie) {
        const div = document.createElement('div');
        div.classList.add('movie-card');

        const posterPath = movie.poster_path ? IMAGE_URL + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Image';

        div.innerHTML = `
        <img src="${posterPath}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>Release Date: ${movie.release_date || 'N/A'}</p>
        <button class="add-watchlist">+ Watchlist</button>
        `;

        div.addEventListener('click', (e) => {
        if (!e.target.classList.contains('add-watchlist')) {
            openMovieModal(movie.id);
        }
        });

        
        div.querySelector('.add-watchlist').addEventListener('click', (e) => {
        e.stopPropagation(); 
        addToWatchlist(movie);
        });

        return div;
    }

    
    async function openMovieModal(movieId) {
        const movie = await fetchData(`/movie/${movieId}`, '&append_to_response=credits,videos');
        if (!movie || !movie.title) {
        alert('Failed to load movie details.');
        return;
        }
        movieDetails.innerHTML = `
        <h2>${movie.title}</h2>
        <p><strong>Synopsis:</strong> ${movie.overview || 'N/A'}</p>
        <p><strong>Rating:</strong> ${movie.vote_average || 'N/A'} / 10</p>
        <p><strong>Runtime:</strong> ${movie.runtime ? movie.runtime + ' minutes' : 'N/A'}</p>
        <h3>Cast:</h3>
        <ul>
            ${movie.credits.cast.slice(0, 5).map(actor => `<li>${actor.name} as ${actor.character}</li>`).join('')}
        </ul>
        ${movie.videos.results.length > 0 ? `<h3>Trailer:</h3>` : ''}
        ${movie.videos.results.length > 0 ? `<iframe width="560" height="315" src="https://www.youtube.com/embed/${movie.videos.results[0].key}" allowfullscreen></iframe>` : ''}
        `;
        movieModal.style.display = 'block';
    }

    
    function addToWatchlist(movie) {
        if (!watchlist.find(item => item.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        showNotification('Movie added to watchlist.');
        } else {
        showNotification('Movie is already in the watchlist.');
        }
    }

   
    function showNotification(message) {
        if (!notification) {
        console.error('Notification element not found!');
        return;
        }
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => {
        notification.style.display = 'none';
        }, 3000);
    }
}

function initWatchlistPage() {
    const watchlistGrid = document.getElementById('watchlist-grid');
    const movieModal = document.getElementById('movie-modal');
    const movieDetails = document.getElementById('movie-details');
    const closeModal = document.getElementById('close-modal');
    const notification = document.getElementById('notification');

    console.log('watchlistGrid:', watchlistGrid);
    console.log('movieModal:', movieModal);
    console.log('movieDetails:', movieDetails);
    console.log('closeModal:', closeModal);
    console.log('notification:', notification);

    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    closeModal.addEventListener('click', () => {
        movieModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target == movieModal) {
        movieModal.style.display = 'none';
        }
    });

    displayWatchlist();


    function displayWatchlist() {
        watchlistGrid.innerHTML = '';
        if (watchlist.length === 0) {
        watchlistGrid.innerHTML = '<p>Your watchlist is empty.</p>';
        return;
        }
        watchlist.forEach(movie => {
        if (movie && movie.title) { // Basic validation
            const movieCard = createWatchlistCard(movie);
            watchlistGrid.appendChild(movieCard);
        }
        });
    }


    function createWatchlistCard(movie) {
        const div = document.createElement('div');
        div.classList.add('movie-card');

        const posterPath = movie.poster_path ? IMAGE_URL + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Image';

        div.innerHTML = `
        <img src="${posterPath}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <button class="remove-watchlist">Remove</button>
        `;

        div.addEventListener('click', (e) => {
        if (!e.target.classList.contains('remove-watchlist')) {
            openMovieModal(movie.id);
        }
        });

        div.querySelector('.remove-watchlist').addEventListener('click', (e) => {
        e.stopPropagation(); 
        removeFromWatchlist(movie.id);
        });

        return div;
    }

    function removeFromWatchlist(movieId) {
        if (confirm('Are you sure you want to remove this movie from your watchlist?')) {
        watchlist = watchlist.filter(movie => movie.id !== movieId);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        displayWatchlist();
        showNotification('Movie removed from watchlist.');
        }
    }

    async function openMovieModal(movieId) {
        const movie = await fetchData(`/movie/${movieId}`, '&append_to_response=credits,videos');
        if (!movie || !movie.title) {
        alert('Failed to load movie details.');
        return;
        }
        movieDetails.innerHTML = `
        <h2>${movie.title}</h2>
        <p><strong>Synopsis:</strong> ${movie.overview || 'N/A'}</p>
        <p><strong>Rating:</strong> ${movie.vote_average || 'N/A'} / 10</p>
        <p><strong>Runtime:</strong> ${movie.runtime ? movie.runtime + ' minutes' : 'N/A'}</p>
        <h3>Cast:</h3>
        <ul>
            ${movie.credits.cast.slice(0, 5).map(actor => `<li>${actor.name} as ${actor.character}</li>`).join('')}
        </ul>
        ${movie.videos.results.length > 0 ? `<h3>Trailer:</h3>` : ''}
        ${movie.videos.results.length > 0 ? `<iframe width="560" height="315" src="https://www.youtube.com/embed/${movie.videos.results[0].key}" allowfullscreen></iframe>` : ''}
        `;
        movieModal.style.display = 'block';
    }

    function showNotification(message) {
        if (!notification) {
        console.error('Notification element not found!');
        return;
        }
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => {
        notification.style.display = 'none';
        }, 3000);
    }
}

    
async function fetchData(endpoint, params = '') {
    const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}${params}&language=en-US&page=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data. Please try again later.');
        return { results: [] };
    }
}
