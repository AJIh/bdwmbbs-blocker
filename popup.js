const blockList = document.querySelector('.block-list');

function buildHTMLFrom({ username, blockLevel }) {
  const options = Object.keys(levelName).map(level =>
    `<option value="${level}" ${level === blockLevel ? 'selected' : ''}>${levelName[level]}</option>`).join('');
  const id = `block-${username}`;
  return `<li class="list-item"><label for="${id}">${username}</label><select id="${id}" data-username="${username}">${options}</select></li>`;
}

function handleChangeBlockLevel(event) {
  const select = event.target;
  const username = select.dataset.username;
  const blockLevel = Number.parseInt(select.value, 10);
  if (blockLevel === BLOCK_NONE) {
    chrome.storage.sync.remove(username);
  } else {
    chrome.storage.sync.set({ [username]: blockLevel });
  }
}

chrome.storage.sync.get(null, (items) => {
  const listItems = Object.keys(items).map(username => {
    return buildHTMLFrom({ username, blockLevel: items[username] });
  }).join('');
  blockList.innerHTML = listItems;
  [...blockList.querySelectorAll('select')].forEach(select =>
    select.addEventListener('input', handleChangeBlockLevel, false));
});
