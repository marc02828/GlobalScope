
const apiKey = 'pub_831404a8b48df18c1625daa86236cfd1dfc29'; // API key galing sa NewsData.io

// Kinukuha yung mga elements sa HTML
const countrySelector = document.getElementById('countrySelector'); // Dropdown ng bansa
const newsContainer = document.getElementById('newsContainer'); // Lalagyan ng news
const searchInput = document.getElementById('searchInput'); // Text input para maghanap
const searchButton = document.getElementById('searchButton'); // Search button
const savedArticlesList = document.getElementById('savedArticlesList');// Lalagyan ng saved news
const noSavedArticles = document.getElementById('noSavedArticles'); // Text kapag walang saved
const tabBtns = document.querySelectorAll('.tab-btn'); // Mga tab buttons
const tabContents = document.querySelectorAll('.tab-content'); // Laman ng bawat tab
const navTabs = document.querySelectorAll('.nav-tab'); // Navigation tabs

// Kinukuha ung saved articles sa localStorage (o empty array kung wala pa)
let savedArticles = JSON.parse(localStorage.getItem('savedArticles')) || [];

// Function na magfe-fetch ng news based sa country at search query
async function fetchNews(country, query = '') {
    try {
        newsContainer.innerHTML = '<div class="loading">Loading news...</div>';
        
        //Kung may search query, idagdag sa URL
        let apiUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&country=${country}&language=en`;
        
        if (query) {
            apiUrl += `&q=${encodeURIComponent(query)}`;
        }

        // Request sa API gamit ang fetch()
        const response = await fetch(apiUrl);
        const data = await response.json(); // I-convert ang response to JSON
        
        // Ipakita ang news kung meron
        if (data.results && data.results.length > 0) {
            displayNews(data.results);
        } else {
            newsContainer.innerHTML = '<div class="error-message">No news found. Please try another search term or country.</div>';
        }
    } catch (error) {
        console.error('Error fetching news:', error); //Kapag may error sa API, ipakita ang error message
        newsContainer.innerHTML = '<div class="error-message">Failed to load news. Please try again later.</div>';
    }
}

// Function para ipakita ang news articles sa UI
    function displayNews(articles) {
        newsContainer.innerHTML = '';
        
 
        const articlesToShow = articles.slice(0, 10); // Limit sa 10 articles
        
        if (articlesToShow.length === 0) {
            newsContainer.innerHTML = '<div class="error-message">No news found. Please try another search term or country.</div>';
            return;
        }
        
        // I-loop ang articles para ipakita sila isa-isa
        articlesToShow.forEach(article => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            
            // Placeholder kung walang image
            const imageUrl = article.image_url || 'https://source.unsplash.com/random/600x400/?news';
            const description = article.description || 'No description available. Click to read more.';
            const source = article.source_id || 'Unknown source';
            const publishedDate = article.pubDate ? new Date(article.pubDate).toLocaleDateString() : 'Unknown date';
            const isSaved = savedArticles.some(saved => saved.link === article.link); // check kung saved na

            const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(article.title)} news`;
            
            //I-construct ung inner HTML ng news card
            newsCard.innerHTML = `
                <button class="save-btn ${isSaved ? 'saved' : ''}" data-article='${JSON.stringify(article).replace(/'/g, "\\'")}'>
                    ${isSaved ? '✓' : '+'}
                </button>
                <div class="news-image">
                    <img src="${imageUrl}" alt="${article.title}" onerror="this.src='https://source.unsplash.com/random/600x400/?news'">
                </div>
                <div class="news-content">
                    <span class="news-category">${article.category ? article.category[0] : 'General'}</span>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-description">${description}</p>
                    <div class="news-meta">
                        <span>${source} • ${publishedDate}</span>
                        <div class="news-actions">
                            <a href="${article.link}" target="_blank" class="read-more">Read More</a>
                            <a href="${youtubeSearchUrl}" target="_blank" class="watch-news">Watch News</a>
                        </div>
                    </div>
                </div>
            `;
            
            newsContainer.appendChild(newsCard); //Idagdag ang card sa container
        });
        
        // Lagyan ng event listener ang lahat ng save buttons
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', toggleSaveArticle);
        });
    }

// Function para mag-save o mag-remove ng article
function toggleSaveArticle(e) {
    const article = JSON.parse(e.target.dataset.article);
    const articleIndex = savedArticles.findIndex(saved => saved.link === article.link);
    
    if (articleIndex === -1) {
        // Add to saved articles
        savedArticles.push(article);
        e.target.classList.add('saved');
        e.target.innerHTML = '✓';
    } else {
        // Remove from saved articles
        savedArticles.splice(articleIndex, 1);
        e.target.classList.remove('saved');
        e.target.innerHTML = '+';
    }
    
    // I-save sa localStorage
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
    
    // Kung nasa saved tab, i-refresh ang list
    if (document.getElementById('savedTab').classList.contains('active')) {
        displaySavedArticles();
    }
}

// Function para ipakita ung mga saved articles
function displaySavedArticles() {
    savedArticlesList.innerHTML = '';
    
    if (savedArticles.length === 0) {
        noSavedArticles.style.display = 'block';
        return;
    }
    
    noSavedArticles.style.display = 'none';
    
    // Loop sa bawat saved article
    savedArticles.forEach((article, index) => {
        const articleItem = document.createElement('div');
        articleItem.className = 'saved-article-item';
        
        const imageUrl = article.image_url || 'https://source.unsplash.com/random/600x400/?news';
        const source = article.source_id || 'Unknown source';
        const publishedDate = article.pubDate ? new Date(article.pubDate).toLocaleDateString() : 'Unknown date';
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(article.title)} news`;
        
        // Lagyan ng laman
        articleItem.innerHTML = `
            <div class="saved-article-title">${article.title}</div>
            <div class="saved-article-meta">${source} • ${publishedDate}</div>
            <div style="display: flex; gap: 10px; margin-bottom: 0.5rem;">
                <a href="${article.link}" target="_blank" class="read-more">Read Article</a>
                <a href="${youtubeSearchUrl}" target="_blank" class="watch-news">Watch News</a>
            </div>
            <button class="remove-btn" data-index="${index}">Remove</button>
        `;
        
        savedArticlesList.appendChild(articleItem);// I-append sa list
    });
    
    // Event listener para sa remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', removeSavedArticle);
    });
}

// Function para mag-remove ng article sa saved list
function removeSavedArticle(e) {
    const index = parseInt(e.target.dataset.index);
    savedArticles.splice(index, 1);
    
    // Update localStorage
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
    
    // Update saved articles list
    displaySavedArticles();
    
    // Update save buttons in news tab if we're on that tab
    if (document.getElementById('newsTab').classList.contains('active')) {
        document.querySelectorAll('.save-btn').forEach(btn => {
            const article = JSON.parse(btn.dataset.article);
            if (!savedArticles.some(saved => saved.link === article.link)) {
                btn.classList.remove('saved');
                btn.innerHTML = '+';
            }
        });
    }
}

// Function para mag-switch ng tabs
function switchTab(e) {
    const tabId = e.target.dataset.tab;
    
    // Update tab buttons
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Update tab contents
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}Tab`).classList.add('active');
    
    // If switching to saved tab, update the list
    if (tabId === 'saved') {
        displaySavedArticles();
    }
}

// Event listeners for tab buttons
tabBtns.forEach(btn => {
    btn.addEventListener('click', switchTab);
});

// Event listeners for nav tabs
navTabs.forEach(tab => {
    tab.addEventListener('click', switchTab);
});

// Event listener for country change
countrySelector.addEventListener('change', (e) => {
    fetchNews(e.target.value, searchInput.value.trim());
});

// Event listener for search button click
searchButton.addEventListener('click', () => {
    const searchQuery = searchInput.value.trim();
    fetchNews(countrySelector.value, searchQuery);
});

// Event listener for Enter key in search input
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const searchQuery = searchInput.value.trim();
        fetchNews(countrySelector.value, searchQuery);
    }
});

// Load news by default country sa unang bukas ng page
fetchNews(countrySelector.value); 