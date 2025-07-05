async function toggleItem(listId, itemName, currentState) {
    try {
        const response = await fetch(`/api/list/${listId}/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                itemName: itemName,
                newState: !currentState
            })
        });

        if (!response.ok) throw new Error('Erreur de mise à jour');
        
        // Recharge la liste après mise à jour
        loadList(listId);
    } catch (err) {
        alert(err.message);
    }
}

let currentListId = null;

async function loadList(listId) {
    currentListId = listId;
    try {
        const response = await fetch(`/api/list/${listId}`);
        if (!response.ok) throw new Error('Erreur de chargement');

        const data = await response.json();
        const container = document.getElementById('list-items-container');
        container.innerHTML = '';

        Object.entries(data.Items).forEach(([name, completed]) => {
            const el = document.createElement('div');
            el.innerHTML = `
            <button onclick="toggleItem('${listId}', '${name}', ${completed})">
                ${completed ? '✔' : '✘'}
            </button>
            - ${name}
        `;
            container.appendChild(el);
        });

    } catch (err) {
        alert(err.message);
    }
}

document.getElementById('add-item-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const input = document.getElementById('new-item-name');
    const itemName = input.value.trim();

    if (!itemName || !currentListId) return;

    try {
        const response = await fetch(`/api/list/${currentListId}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemName })
        });

        if (!response.ok) throw new Error('Échec de l\'ajout');

        input.value = ''; // Réinitialiser
        loadList(currentListId); // Recharger la liste
    } catch (err) {
        alert(err.message);
    }
});


