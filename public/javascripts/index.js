function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('visible'));
    document.getElementById(id).classList.add('visible');
}

async function showSaved(userId) {
    let savedJSON = await fetchJSON(`api/v1/user/saved?userId=${userId}`);
    let savedHTML = savedJSON.map(post => {
        return `
        <div class="container">
        
        `
        // need save button and where to display course info 
    })
    document.getElementById("saved-results").value = savedHTML;
}
