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

async function deleteItem(listId, itemName) {
    try {
        const response = await fetch(`/api/list/${listId}/item/${itemName}/delete`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error("Erreur lors de la suppression");

        // Recharge la liste après suppression
        loadList(listId);
    } catch (err) {
        alert("Suppression échouée : " + err.message);
    }
}

async function deleteList(listId){
    try {

        const response = await fetch(`/api/list/${listId}/delete`, {
            method : 'DELETE'
        });
        console.log("test")
        if (!response.ok) throw new Error("IL FAIS TARPIIIIINNN CHAUUUUUUD");
        window.location.reload();
    }   catch (err) {
        alert("Impossible to Delete : Error Server")
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
                        <div class="list-container">
                        <div class="list-left">
                        <button class="button" onclick="toggleItem('${listId}', '${name}', ${completed})">
                            ${completed ? '✔' : '✘'}
                        </button>
                        - </div><div class="list-center">${name}</div>
                        <div class="list-right">
                        <button class="button" onclick="deleteItem('${listId}', '${name}')">Supprimer</button></div>
                        </div>
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


