const loadUsersBtn = document.getElementById('load-users-btn');
const searchInput = document.getElementById('search-input');
const usersList = document.getElementById('users-list');
const postsArea = document.getElementById('posts-area');
const statusMessage = document.getElementById('status-message');

let allUsers = [];
const API_BASE = 'https://jsonplaceholder.typicode.com';

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
}

function clearStatus() {
    statusMessage.textContent = '';
    statusMessage.className = 'status';
}

async function fetchUsers() {
    loadUsersBtn.disabled = true;
    searchInput.disabled = true;
    usersList.innerHTML = '';
    showStatus('Загрузка...', 'loading');

    try {
        const response = await fetch(`${API_BASE}/users`);
        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
        }
        allUsers = await response.json();
        
        renderUsers(allUsers);
        searchInput.disabled = false;
        showStatus(`Успешно загружено ${allUsers.length} пользователей.`, 'success');
    } catch (error) {
        showStatus(`Ошибка при загрузке: ${error.message}. Попробуйте еще раз.`, 'error');
        usersList.innerHTML = '<p class="no-results">Не удалось загрузить пользователей.</p>';
    } finally {
        loadUsersBtn.disabled = false;
    }
}

function renderUsers(users) {
    usersList.innerHTML = '';

    if (users.length === 0) {
        usersList.innerHTML = '<p class="no-results">Пользователи не найдены</p>';
        return;
    }

    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';

        const name = document.createElement('h3');
        name.textContent = user.name;

        const email = document.createElement('p');
        email.textContent = `Email: ${user.email}`;

        const city = document.createElement('p');
        city.textContent = `Город: ${user.address.city}`;

        const postsBtn = document.createElement('button');
        postsBtn.textContent = 'Показать публикации';
        postsBtn.addEventListener('click', () => fetchUserPosts(user.id, user.name));

        card.append(name, email, city, postsBtn);
        usersList.appendChild(card);
    });
}

function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm)
    );
    
    if (filteredUsers.length === 0 && searchTerm !== '') {
        usersList.innerHTML = '<p class="no-results">Пользователи не найдены</p>';
    } else {
        renderUsers(filteredUsers);
    }
}

async function fetchUserPosts(userId, userName) {
    postsArea.innerHTML = '';
    showStatus('Загрузка публикаций...', 'loading');

    try {
        const response = await fetch(`${API_BASE}/posts?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
        }
        
        const posts = await response.json();
        const firstThreePosts = posts.slice(0, 3);
        
        renderPosts(firstThreePosts, userName);
        clearStatus();
    } catch (error) {
        showStatus(`Ошибка при загрузке публикаций: ${error.message}`, 'error');
        postsArea.innerHTML = '<p class="placeholder">Не удалось загрузить публикации.</p>';
    }
}

function renderPosts(posts, userName) {
    postsArea.innerHTML = `<h3>Публикации пользователя: ${userName}</h3>`;

    if (posts.length === 0) {
        const noPosts = document.createElement('p');
        noPosts.className = 'placeholder';
        noPosts.textContent = 'У этого пользователя нет публикаций.';
        postsArea.appendChild(noPosts);
        return;
    }

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';

        const title = document.createElement('h4');
        title.textContent = post.title;

        const body = document.createElement('p');
        body.textContent = post.body;

        postCard.append(title, body);
        postsArea.appendChild(postCard);
    });
}

loadUsersBtn.addEventListener('click', fetchUsers);
searchInput.addEventListener('input', filterUsers);