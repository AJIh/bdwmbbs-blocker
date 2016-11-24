let DOMItems;
function retrievePostsFromDOM() {
  DOMItems = document.querySelectorAll('.post-card');
  return [...DOMItems].map(postDOM => { // 必须使用...语法，因为posts是NodeList
    const usernameContainer = postDOM.querySelector('.username > a');
    const username = usernameContainer.textContent;
    const quoteHead = postDOM.querySelector('.quotehead');
    const quoteUsername = quoteHead ? quoteHead.dataset.username : null;
    return { username, quoteUsername };
  });
}

function retrieveThreadsFromDOM() {
  DOMItems = document.querySelectorAll('.list-item');
  return [...DOMItems].map(threadDOM => { // 必须使用...语法，因为posts是NodeList
    const usernameContainer = threadDOM.querySelector('.author > .name');
    const username = usernameContainer.textContent;
    return { username };
  });
}

function hideSpecifiedItems(operations) {
  operations.forEach((op, index) => {
    if (op === OP_HIDE) {
      DOMItems.item(index).style.display = 'none';
    }
  });
}

function retrieveUsernameFromDOM() {
  return document.querySelector('.bbsid').textContent;
}

function onChangeBlockLevel(event) {
  const username = retrieveUsernameFromDOM();
  const blockLevel = event.target.value;
  chrome.runtime.sendMessage({
    type: CHANGE_BLOCK_LEVEL,
    username,
    blockLevel,
  });
}

function renderUserPage(blockLevel) {
  const p = document.querySelector('.nick > p');

  const select = document.createElement('select');
  select.innerHTML = Object.keys(levelName).map(level =>
    `<option value="${level}" ${level === blockLevel ? 'selected' : ''}>${levelName[level]}</option>`).join('');
  select.addEventListener('input', onChangeBlockLevel, false);

  p.appendChild(select);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.type) {
      case GET_POSTS: {
        const posts = retrievePostsFromDOM();
        sendResponse(posts);
        break;
      }
      case GET_THREADS: {
        const threads = retrieveThreadsFromDOM();
        sendResponse(threads);
        break;
      }
      case GET_USER: {
        const username = retrieveUsernameFromDOM();
        sendResponse(username);
        break;
      }
      case RENDER_USER: {
        renderUserPage(request.blockLevel)
        break;
      }
      case FILTER_ITEMS:
        hideSpecifiedItems(request.operations);
        break;
      default:
    }
  }
);
